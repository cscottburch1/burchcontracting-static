/**
 * Content-loss gate for the cleanup refactor.
 *
 * Captures what every built page *says* — not how it is spelled — so a
 * generator refactor can be proven not to have dropped anything. Run it once
 * before the work starts and again after each phase, then diff:
 *
 *   node scripts/snapshot-dist.mjs <out.json>     # default: <tmp>/snapshot-dist.json
 *   node scripts/snapshot-dist.mjs --diff <before.json> <after.json>
 *
 * Requires `npm run build` first; it reads dist/, never source.
 *
 * What is deliberately NOT captured, because the refactor is allowed to change
 * it and capturing it would make the gate cry wolf on every run:
 *   - whitespace, indentation, line endings (normalized away)
 *   - attribute order, and key order inside JSON-LD (deep-sorted)
 *   - the order of internal links (compared as a set)
 *   - <head> assets, hashed bundle filenames, <script>/<style> bodies
 *
 * What IS captured, because losing any of it is the failure this gate exists
 * to catch: visible body text with nav/footer stripped, the full set of JSON-LD
 * blocks, title/canonical/robots/description, and the set of internal links.
 *
 * Keyed by public URL from src/data/url-map.js rather than by file path, so the
 * Phase 1 flatten (which moves every file) does not invalidate the baseline.
 * 404.html is keyed as "unlisted:404.html" since it has no public URL by design.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { PAGE_URLS, UNLISTED_FILES } from '../src/data/url-map.js'

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')

// --- extraction helpers -----------------------------------------------------

/** Strip a paired tag and everything inside it, repeatedly. */
function stripBlock(html, tag) {
  return html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi'), ' ')
}

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&middot;': '·', '&mdash;': '—', '&ndash;': '–',
}

function decodeEntities(text) {
  return text
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => {
      if (ENTITIES[m]) return ENTITIES[m]
      const num = /^&#(\d+);$/.exec(m)
      return num ? String.fromCodePoint(Number(num[1])) : m
    })
}

/**
 * Visible body text with the page chrome removed. Every generated page has
 * exactly one <header> and one <footer> (verified across all 71 dist pages), so
 * removing those plus <head> leaves the page's own content — including anything
 * that sits outside <main>, which taking <main> alone would silently drop.
 */
function visibleText(html) {
  let s = html
  for (const tag of ['head', 'header', 'footer', 'script', 'style', 'noscript', 'svg']) {
    s = stripBlock(s, tag)
  }
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  s = s.replace(/<[^>]+>/g, ' ')
  return decodeEntities(s).replace(/\s+/g, ' ').trim()
}

/** Recursively sort object keys so attribute order never shows up as a diff. */
function deepSort(value) {
  if (Array.isArray(value)) return value.map(deepSort)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, deepSort(value[k])]))
  }
  return value
}

function jsonLdBlocks(html, rel, problems) {
  const blocks = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html))) {
    try {
      blocks.push(deepSort(JSON.parse(decodeEntities(m[1]).trim())))
    } catch (err) {
      problems.push(`${rel}: JSON-LD block failed to parse — ${err.message}`)
    }
  }
  // Sorted by serialized form so block order in the document is not a diff.
  return blocks.map((b) => JSON.stringify(b)).sort()
}

function attr(html, re) {
  const m = re.exec(html)
  return m ? decodeEntities(m[1]).trim() : null
}

/** Internal hrefs only: site-relative or same-origin. Deduped and sorted. */
function internalLinks(html) {
  const out = new Set()
  const re = /href=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html))) {
    let href = decodeEntities(m[1]).trim()
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    if (href.startsWith('https://burchcontracting.com')) href = href.slice('https://burchcontracting.com'.length) || '/'
    if (/^[a-z]+:\/\//i.test(href)) continue
    out.add(href.split('#')[0] || '/')
  }
  return [...out].sort()
}

// --- walk -------------------------------------------------------------------

/**
 * dist/api/** is not part of the site. It is the legacy PHP tree (contact
 * handler, mailer library, the old admin panel, an email template) that vite copies
 * out of public/ wholesale. It reaches Cloudflare in the asset bundle but is
 * unreachable there: worker.js intercepts every /api/* request before any asset
 * lookup and api.js 404s unknown routes. Phase 4 deletes public/api/ outright.
 * Excluded here so the content gate tracks pages, not an email template.
 */
const EXCLUDED_PREFIXES = ['api/']

function walk(dir) {
  const found = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walk(full))
    else if (entry.name.endsWith('.html')) found.push(full)
  }
  return found
}

function snapshot() {
  if (!fs.existsSync(distDir)) {
    console.error('snapshot-dist: dist/ not found — run `npm run build` first.')
    process.exit(1)
  }
  const problems = []
  const pages = {}
  const unlisted = new Set(UNLISTED_FILES)

  for (const file of walk(distDir).sort()) {
    const rel = path.relative(distDir, file).split(path.sep).join('/')
    if (EXCLUDED_PREFIXES.some((p) => rel.startsWith(p))) continue
    const html = fs.readFileSync(file, 'utf8')

    let key = PAGE_URLS[rel]
    if (!key) {
      if (unlisted.has(rel)) key = `unlisted:${rel}`
      else {
        problems.push(`${rel}: no entry in PAGE_URLS and not in UNLISTED_FILES — cannot key this page`)
        continue
      }
    }
    if (pages[key]) problems.push(`${key}: two dist files map to the same public URL`)

    pages[key] = {
      file: rel,
      title: attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      canonical: attr(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i),
      robots: attr(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i),
      description: attr(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i),
      jsonLd: jsonLdBlocks(html, rel, problems),
      links: internalLinks(html),
      text: visibleText(html),
    }
  }
  return { pages, problems }
}

// --- diff -------------------------------------------------------------------

const FIELDS = ['title', 'canonical', 'robots', 'description', 'text']

function diff(beforeFile, afterFile) {
  const before = JSON.parse(fs.readFileSync(beforeFile, 'utf8')).pages
  const after = JSON.parse(fs.readFileSync(afterFile, 'utf8')).pages
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()

  const changes = []
  let identical = 0

  for (const key of keys) {
    const b = before[key]
    const a = after[key]
    if (!b) { changes.push(`+ ${key}: page ADDED`); continue }
    if (!a) { changes.push(`- ${key}: page REMOVED`); continue }

    const fieldDiffs = []
    for (const f of FIELDS) {
      if (b[f] === a[f]) continue
      if (f === 'text') {
        // Report size and a first divergence point rather than dumping the page.
        const at = [...b.text].findIndex((c, i) => c !== a.text[i])
        fieldDiffs.push(
          `text: ${b.text.length} -> ${a.text.length} chars; first difference at ~${at < 0 ? 'end' : at}\n` +
          `      before: ...${b.text.slice(Math.max(0, at - 60), at + 60)}...\n` +
          `      after:  ...${a.text.slice(Math.max(0, at - 60), at + 60)}...`
        )
      } else {
        fieldDiffs.push(`${f}:\n      before: ${b[f]}\n      after:  ${a[f]}`)
      }
    }
    const lost = b.jsonLd.filter((x) => !a.jsonLd.includes(x))
    const gained = a.jsonLd.filter((x) => !b.jsonLd.includes(x))
    if (lost.length) fieldDiffs.push(`jsonLd: ${lost.length} block(s) LOST — ${lost.map((s) => s.slice(0, 90)).join(' | ')}`)
    if (gained.length) fieldDiffs.push(`jsonLd: ${gained.length} block(s) added — ${gained.map((s) => s.slice(0, 90)).join(' | ')}`)

    const linksLost = b.links.filter((x) => !a.links.includes(x))
    const linksGained = a.links.filter((x) => !b.links.includes(x))
    if (linksLost.length) fieldDiffs.push(`links LOST (${linksLost.length}): ${linksLost.join(', ')}`)
    if (linksGained.length) fieldDiffs.push(`links added (${linksGained.length}): ${linksGained.join(', ')}`)

    if (fieldDiffs.length) changes.push(`~ ${key}\n    ${fieldDiffs.join('\n    ')}`)
    else identical++
  }

  console.log(`snapshot-diff: ${keys.length} page(s); ${identical} identical, ${changes.length} changed.`)
  if (changes.length) {
    console.log(`\n${changes.join('\n')}`)
    process.exit(1)
  }
  console.log('No differences in text, JSON-LD, title, canonical, robots, description, or internal links.')
}

// --- main -------------------------------------------------------------------

const args = process.argv.slice(2)

if (args[0] === '--diff') {
  if (args.length < 3) {
    console.error('usage: node scripts/snapshot-dist.mjs --diff <before.json> <after.json>')
    process.exit(1)
  }
  diff(args[1], args[2])
} else {
  const outFile = args[0] ?? path.join(os.tmpdir(), 'snapshot-dist.json')
  const { pages, problems } = snapshot()
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify({ takenAt: new Date().toISOString(), pages }, null, 2))

  const counts = Object.values(pages)
  console.log(
    `snapshot-dist: ${counts.length} page(s) -> ${outFile}\n` +
    `  ${counts.reduce((n, p) => n + p.jsonLd.length, 0)} JSON-LD blocks, ` +
    `${counts.reduce((n, p) => n + p.links.length, 0)} internal links, ` +
    `${counts.reduce((n, p) => n + p.text.length, 0).toLocaleString()} chars of visible text`
  )
  if (problems.length) {
    console.error(`\nsnapshot-dist: ${problems.length} problem(s):\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
}
