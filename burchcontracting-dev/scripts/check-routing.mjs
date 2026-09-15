/**
 * Routing parity check — proves a host serves every URL exactly the way the
 * Hostinger site did: same status codes, same redirect targets, same
 * security headers.
 *
 *   node scripts/check-routing.mjs --record https://burchcontracting.com
 *     Requests every path below and saves the results to
 *     migration/routing-baseline.json.
 *
 *   node scripts/check-routing.mjs <base-url>
 *     Requests the same paths from <base-url> (a workers.dev preview,
 *     `wrangler dev`, or production) and exits 1 on any difference.
 *
 * Paths: every built page in dist/ plus the .html / trailing-slash /
 * index.html variants people and crawlers type, every legacy Next.js URL in
 * migration/legacy-urls.txt, and a few fixed probes. Requires `npm run build`.
 *
 * Re-record the baseline whenever URLs or redirects change on purpose.
 */
import fs from 'node:fs'
import path from 'node:path'
import { findRedirect, parseRedirectRules } from '../cloudflare/htaccess.js'
import { MOVED_URLS, PAGE_URLS } from '../src/data/url-map.js'

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')
const baselineFile = path.join(root, 'migration/routing-baseline.json')
const legacyFile = path.join(root, 'migration/legacy-urls.txt')

const PRODUCTION_HOST = 'burchcontracting.com'
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const SECURITY_HEADERS = [
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'content-security-policy',
]

const FIXED_PATHS = [
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/favicon.ico',
  '/favicon.svg',
  '/this-page-does-not-exist',
  '/contact?utm_source=routing-check',
  '/areas?utm_source=routing-check',
  '/.htaccess',
]

// Intentional differences on Cloudflare, with the reason.
const EXPECTED_DIFFERENCES = {
  '/.htaccess': 'Apache config is not uploaded to Cloudflare, so it 404s instead of 403.',
}

// Backend files that must never be uploaded as static files. /api/* is
// answered by cloudflare/api.js (405 or 404 for these), so any 200 means
// Cloudflare is serving the raw file (see public/.assetsignore).
const MUST_NOT_BE_STATIC = [
  '/.htaccess',
  '/api/contact.php',
  '/api/config.local.php.example',
  '/api/admin/db.php',
  '/api/admin/schema.sql',
  '/api/PHPMailer/src/SMTP.php',
  '/api/email-templates/confirmation.html',
]

const args = process.argv.slice(2)
const record = args[0] === '--record'
const base = (record ? args[1] : args[0])?.replace(/\/+$/, '')

if (!base) {
  console.error('Usage: node scripts/check-routing.mjs [--record] <base-url>')
  process.exit(2)
}
if (!fs.existsSync(distDir)) {
  console.error('check-routing: dist/ not found — run `npm run build` first.')
  process.exit(2)
}

const problems = []
const notes = []
const distFiles = walk(distDir).map((file) => path.relative(distDir, file).split(path.sep).join('/'))

// Both hosts now redirect the .html form of a page to its clean URL, and both
// are meant to: Apache through the rules in public/.htaccess, Cloudflare
// through cloudflare/worker.js, which runs before the asset server
// (run_worker_first). So a rule pointing at a file's clean URL is correct.
//
// What would be a real fault is a rule that sends a file somewhere OTHER than
// its own public URL — that would shadow a real page, the way the legacy
// "^calculator/([a-z-]+)/?$" catch-all briefly hijacked /calculator/garages.
const rules = parseRedirectRules(fs.readFileSync(path.join(root, 'public/.htaccess'), 'utf8'))
for (const rel of distFiles) {
  if (rel.startsWith('api/') || !rel.endsWith('.html')) continue
  const hit = findRedirect(rules, `/${rel}`)
  if (!hit) continue
  const ownUrl = PAGE_URLS[rel]
  if (ownUrl && hit.location === ownUrl) continue
  problems.push(`/${rel}: .htaccess redirects this existing page to ${hit.location}, not to its own URL (${ownUrl ?? 'unmapped'}) — a rule is shadowing a real page`)
}

// The 2026-07 rebuild's URLs are probed from the map, not from dist/. They are
// the addresses Google indexed for the eight weeks before the restore, so they
// have to keep redirecting for good — and /garages/ and /additions/ no longer
// exist as directories, so deriving them from the build would silently drop
// exactly the URLs that matter most.
const paths = [...new Set([...pagePaths(), ...Object.keys(MOVED_URLS), ...legacyPaths(), ...FIXED_PATHS])].sort()
const results = Object.fromEntries(await mapLimit(paths, 4, async (p) => [p, await probe(p)]))

if (record) {
  const saved = Object.fromEntries(Object.entries(results).map(([p, { body, ...rest }]) => [p, rest]))
  fs.writeFileSync(baselineFile, JSON.stringify({ recordedFrom: base, recordedAt: new Date().toISOString(), results: saved }, null, 2) + '\n')
  console.log(`check-routing: recorded ${paths.length} paths from ${base} to ${path.relative(root, baselineFile)}`)
  report()
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'))

for (const p of paths) {
  const want = baseline.results[p]
  const got = results[p]
  if (!want) {
    notes.push(`${p}: not in baseline (got ${got.status})`)
    continue
  }

  const diffs = []
  if (got.status !== want.status) diffs.push(`status ${want.status} → ${got.status}`)
  if (got.location !== want.location) diffs.push(`location ${want.location} → ${got.location}`)
  if ([200, 404].includes(want.status) && got.status === want.status && got.contentType !== want.contentType) {
    diffs.push(`content-type ${want.contentType} → ${got.contentType}`)
  }
  for (const name of SECURITY_HEADERS) {
    if ((want.headers[name] ?? null) !== (got.headers[name] ?? null)) diffs.push(`${name} ${want.headers[name] ? 'differs' : 'unexpected'}${got.headers[name] ? '' : ' (missing)'}`)
  }

  if (!diffs.length) continue
  if (EXPECTED_DIFFERENCES[p]) notes.push(`${p}: expected — ${EXPECTED_DIFFERENCES[p]}`)
  else problems.push(`${p}: ${diffs.join('; ')}`)
}

for (const p of Object.keys(baseline.results)) {
  if (!results[p]) notes.push(`${p}: in baseline but no longer checked`)
}

if (new URL(base).hostname !== PRODUCTION_HOST) {
  for (const p of MUST_NOT_BE_STATIC) {
    const { status, body } = await probe(p)
    if (status === 200) problems.push(`${p}: served as a static file (${body.slice(0, 40).replace(/\s+/g, ' ')}…) — check public/.assetsignore`)
  }
}

console.log(`check-routing: compared ${paths.length} paths on ${base} against the baseline recorded from ${baseline.recordedFrom} (${baseline.recordedAt.slice(0, 10)})`)
report()

function report() {
  if (notes.length) console.log(`\nNotes (${notes.length}):\n  ${notes.slice(0, 40).join('\n  ')}`)
  if (problems.length) {
    console.error(`\nFAILED — ${problems.length} difference(s):\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
  console.log('\nPassed.')
  process.exit(0)
}

function pagePaths() {
  const out = []
  for (const rel of distFiles) {
    if (!rel.endsWith('.html') || rel.startsWith('api/')) continue
    if (rel === 'index.html') {
      out.push('/', '/index.html')
    } else if (rel.endsWith('/index.html')) {
      const folder = `/${rel.slice(0, -'index.html'.length)}`
      out.push(folder, folder.slice(0, -1), `/${rel}`)
    } else {
      const bare = `/${rel.slice(0, -'.html'.length)}`
      out.push(`/${rel}`, bare, `${bare}/`, `/${rel}/`)
    }
  }
  return out
}

function legacyPaths() {
  return fs
    .readFileSync(legacyFile, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('/api'))
}

async function probe(p) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(base + p, { redirect: 'manual', headers: { 'user-agent': BROWSER_UA } })
      const body = await response.text()
      const location = response.headers.get('location')
      return {
        status: response.status,
        location: location ? relativeLocation(location) : null,
        contentType: contentTypeOf(response),
        headers: Object.fromEntries(SECURITY_HEADERS.map((name) => [name, response.headers.get(name)]).filter(([, value]) => value !== null)),
        body,
      }
    } catch (error) {
      if (attempt === 3) throw new Error(`${p}: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
}

function contentTypeOf(response) {
  // Same type, two registered names: Apache sends image/x-icon for .ico,
  // Cloudflare sends image/vnd.microsoft.icon.
  const aliases = { 'image/vnd.microsoft.icon': 'image/x-icon' }
  const type = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase() || null
  return aliases[type] ?? type
}

function relativeLocation(location) {
  const target = new URL(location, base)
  return target.host === new URL(base).host ? target.pathname + target.search + target.hash : target.href
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

async function mapLimit(items, limit, fn) {
  const output = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const index = next++
        output[index] = await fn(items[index])
      }
    })
  )
  return output
}
