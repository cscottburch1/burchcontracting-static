/**
 * Internal link gate. Reads dist/, exits 1 on any failure.
 *
 *   node scripts/check-links.mjs
 *
 * Two directions, because a link graph can break both ways:
 *
 * 1. EVERY INTERNAL HREF RESOLVES. A link either names a file that exists in
 *    dist/, or a path the Worker turns into one, or a path the redirect table
 *    sends somewhere. Anything else is a 404 a visitor reaches by clicking,
 *    which is the worst kind: nothing in the build fails, and it only surfaces
 *    in Search Console weeks later.
 *
 * 2. EVERY SITEMAP URL HAS AT LEAST ONE INBOUND LINK. A page reachable only
 *    from the sitemap is a page the crawler treats as unimportant and a visitor
 *    cannot find at all. check-build already asserts this; it is repeated here
 *    against dist/ rather than .build/pages/, because the two trees differ —
 *    vite rewrites asset paths — and this is the tree that ships.
 *
 * WHAT RESOLUTION MEANS HERE
 *
 * Deliberately the same rules cloudflare/worker.js applies, in the same order,
 * because "does this link work" has exactly one correct answer and it is the
 * Worker's. A clean URL resolves if dist/<path>.html or dist/<path>/index.html
 * exists; a path with an extension resolves if that file exists; otherwise the
 * legacy redirect table gets a say. Duplicating the Worker's logic loosely here
 * would produce a gate that passes on links the Worker 404s, which is worse
 * than no gate.
 *
 * External links, mailto:, tel: and fragment-only links are out of scope. This
 * checks the parts of the graph this repo controls.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'

import { findLegacyRedirect } from '../cloudflare/redirects.js'
import { MOVED_URLS, PAGE_URLS } from '../src/data/url-map.js'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')

if (!existsSync(distDir)) {
  console.error('check-links: dist/ not found — run `npm run build` first.')
  process.exit(1)
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

function fileExists(relPath) {
  const target = resolve(distDir, relPath.replace(/^\//, ''))
  if (!target.startsWith(distDir)) return false
  try {
    return statSync(target).isFile()
  } catch {
    return false
  }
}

/** The same order cloudflare/worker.js resolves in. */
function resolves(pathname) {
  if (pathname === '/') return fileExists('index.html')

  // Anything naming a file is served as-is.
  if (/\.[a-z0-9]+$/i.test(pathname)) {
    if (fileExists(pathname)) return true
    // .html forms 301 to the clean URL rather than being served.
    if (pathname.endsWith('.html')) return true
    return Boolean(findLegacyRedirect(pathname))
  }

  if (MOVED_URLS[pathname]) return true
  if (pathname.endsWith('/')) {
    if (fileExists(`${pathname}index.html`)) return true
  } else if (fileExists(`${pathname}.html`) || fileExists(`${pathname}/index.html`)) {
    return true
  }
  // A trailing-slash form of a real page 301s to the canonical.
  const withoutSlash = pathname.replace(/\/$/, '')
  if (withoutSlash && (fileExists(`${withoutSlash}.html`) || fileExists(`${withoutSlash}/index.html`))) return true

  return Boolean(findLegacyRedirect(pathname))
}

const pages = walk(distDir).filter((f) => !relative(distDir, f).split(sep).join('/').startsWith('api/'))

const broken = []
const inbound = new Set()
let hrefCount = 0

for (const file of pages) {
  const rel = relative(distDir, file).split(sep).join('/')
  const html = readFileSync(file, 'utf8')

  for (const [, href] of html.matchAll(/<a[^>]+href="([^"]*)"/g)) {
    if (!href.startsWith('/')) continue // external, mailto:, tel:, fragment-only
    hrefCount++

    const pathname = href.split('#')[0].split('?')[0]
    if (!pathname) continue // a bare "#anchor" on this page

    inbound.add(pathname)
    inbound.add(pathname.replace(/\/$/, ''))

    if (!resolves(pathname)) {
      broken.push(`${rel} links to ${href}, which resolves to nothing in dist/ and matches no redirect`)
    }
  }
}

// 2. orphans, against dist/sitemap.xml
const sitemapPath = resolve(distDir, 'sitemap.xml')
if (!existsSync(sitemapPath)) {
  console.error('check-links: dist/sitemap.xml not found — run `npm run build` first.')
  process.exit(1)
}
const sitemapUrls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => {
    try {
      return new URL(m[1]).pathname
    } catch {
      return null
    }
  })
  .filter(Boolean)

const orphans = sitemapUrls.filter((url) => url !== '/' && !inbound.has(url) && !inbound.has(url.replace(/\/$/, '')))

const failures = [
  ...new Set(broken),
  ...orphans.map((url) => `${url} is in the sitemap but nothing on the site links to it`),
]

if (failures.length) {
  console.error(`check-links FAILED — ${failures.length} issue(s):\n`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `check-links passed — ${hrefCount} internal href(s) across ${pages.length} page(s) all resolve, ` +
    `and all ${sitemapUrls.length} sitemap URL(s) have at least one inbound link. ` +
    `PAGE_URLS defines ${Object.keys(PAGE_URLS).length} pages.`
)
