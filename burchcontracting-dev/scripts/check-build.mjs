/**
 * Build guard — fails the build (exit 1) on failure modes that have each
 * already shipped once:
 *   1. Double-encoded ampersands ("&amp;amp;") anywhere in built HTML.
 *   2. Orphan pages: any URL listed in sitemap.xml with zero inbound
 *      internal links from anywhere else on the site.
 *   3. Site-wide noindex still present when BUILD_ENV=production.
 *   4. reCAPTCHA site key drift: dist/contact.html must have a well-formed
 *      data-recaptcha-site-key, and no dist/assets/*.js may contain a key
 *      literal — see LAUNCH-CHECKLIST.md #3 for why this must be the only
 *      place the site key lives.
 *
 * Checks 1-3 scan the repo's own HTML source files directly (index.html,
 * service pages, generated service-area/calculator pages, etc.) — the same
 * files `npm run build` bundles into dist/ — rather than requiring a prior
 * build step, so those can run standalone in CI or locally. Check 4 reads
 * dist/ directly, since it's specifically verifying what actually gets
 * deployed; it requires `npm run build` to have already run.
 *
 * Exception: 404.html is excluded from the noindex check. Per
 * LAUNCH-CHECKLIST.md #1, 404.html must carry noindex permanently, in
 * production or not — flagging it as a failure would make the production
 * check permanently unfixable. This is a documented, deliberate exception,
 * not a loophole.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git', 'public'])
const NOINDEX_EXEMPT = new Set(['404.html'])

function walkHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtmlFiles(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

function relPath(f) {
  return path.relative(root, f).split(path.sep).join('/')
}

function toPublicUrl(rel) {
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length)
  return '/' + rel
}

const files = walkHtmlFiles(root)
const pages = files.map((f) => ({ file: f, rel: relPath(f), html: fs.readFileSync(f, 'utf8') }))

let failed = false
const failures = []

// --- Check 1: double-encoded ampersands ---
const doubleEncoded = pages.filter((p) => p.html.includes('&amp;amp;'))
if (doubleEncoded.length) {
  failed = true
  failures.push({
    check: 'double-encoded-ampersand',
    detail: doubleEncoded.map((p) => p.rel),
  })
}

// --- Check 2: orphan pages (sitemap URL with zero inbound internal links) ---
const sitemapPath = path.join(root, 'public/sitemap.xml')
const sitemapXml = fs.readFileSync(sitemapPath, 'utf8')
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => m[1])
  .map((loc) => {
    try {
      return new URL(loc).pathname
    } catch {
      return null
    }
  })
  .filter(Boolean)

const allInboundHrefs = new Set()
for (const page of pages) {
  const hrefs = [...page.html.matchAll(/href=["']([^"']*)["']/g)].map((m) => m[1])
  for (const href of hrefs) {
    if (!href.startsWith('/')) continue
    const pathOnly = href.split('#')[0].split('?')[0]
    if (pathOnly) allInboundHrefs.add(pathOnly)
    if (href.includes('#')) allInboundHrefs.add(href) // fragment links (e.g. /#service-areas) count too
  }
}

const orphans = sitemapUrls.filter((url) => url !== '/' && !allInboundHrefs.has(url))
if (orphans.length) {
  failed = true
  failures.push({
    check: 'orphan-page',
    detail: orphans,
  })
}

// --- Check 3: noindex present in production ---
if (process.env.BUILD_ENV === 'production') {
  const noindexPages = pages.filter(
    (p) => /<meta[^>]*name=["']robots["'][^>]*noindex/i.test(p.html) && !NOINDEX_EXEMPT.has(p.rel)
  )
  if (noindexPages.length) {
    failed = true
    failures.push({
      check: 'noindex-in-production',
      detail: noindexPages.map((p) => p.rel),
    })
  }
}

// --- Check 4: reCAPTCHA site key must live only in dist/contact.html's
// data-recaptcha-site-key attribute, never baked into JS. Requires a prior
// build (dist/assets/*.js is what actually gets deployed) — see
// LAUNCH-CHECKLIST.md #3 for the incident this guards against.
const RECAPTCHA_KEY_RE = /^6L[0-9A-Za-z_-]{38}$/
const distContactPath = path.join(root, 'dist/contact.html')
const distAssetsDir = path.join(root, 'dist/assets')

if (!fs.existsSync(distContactPath)) {
  failed = true
  failures.push({
    check: 'recaptcha-site-key',
    detail: ['dist/contact.html not found — run `npm run build` before check-build.'],
  })
} else {
  const distContactHtml = fs.readFileSync(distContactPath, 'utf8')
  const keyMatch = distContactHtml.match(/data-recaptcha-site-key="([^"]*)"/)

  if (!keyMatch) {
    failed = true
    failures.push({
      check: 'recaptcha-site-key',
      detail: ['dist/contact.html has no data-recaptcha-site-key attribute at all.'],
    })
  } else if (!RECAPTCHA_KEY_RE.test(keyMatch[1])) {
    failed = true
    failures.push({
      check: 'recaptcha-site-key',
      detail: [
        `dist/contact.html's data-recaptcha-site-key is "${keyMatch[1]}" — not a well-formed reCAPTCHA v3 site key (expected "6L" followed by 38 letters/digits/_/-). Check for a placeholder, typo, or empty value.`,
      ],
    })
  }

  if (fs.existsSync(distAssetsDir)) {
    const leaked = fs
      .readdirSync(distAssetsDir)
      .filter((f) => f.endsWith('.js'))
      .filter((f) => /6L[0-9A-Za-z_-]{20,}/.test(fs.readFileSync(path.join(distAssetsDir, f), 'utf8')))

    if (leaked.length) {
      failed = true
      failures.push({
        check: 'recaptcha-key-baked-into-js',
        detail: leaked.map(
          (f) =>
            `dist/assets/${f} contains a reCAPTCHA key literal — the site key must only exist in contact.html's data attribute, read at runtime. This means the old VITE_RECAPTCHA_SITE_KEY env-var path or a hardcoded literal has crept back into src/js/. Remove it — see LAUNCH-CHECKLIST.md #3.`
        ),
      })
    }
  }
}

// --- Report ---
if (failed) {
  console.error('check-build FAILED\n')
  for (const f of failures) {
    console.error(`[${f.check}] ${f.detail.length} issue(s):`)
    for (const d of f.detail) console.error(`  - ${d}`)
    console.error('')
  }
  process.exit(1)
} else {
  console.log(`check-build passed — ${pages.length} pages scanned, ${sitemapUrls.length} sitemap URLs checked for orphans${process.env.BUILD_ENV === 'production' ? ', noindex checked (production mode)' : ' (noindex check skipped — not BUILD_ENV=production)'}, reCAPTCHA site key verified single-source in dist/.`)
}
