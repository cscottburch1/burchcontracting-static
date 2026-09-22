/**
 * Structured-data gate. Reads dist/, exits 1 on any failure.
 *
 *   node scripts/check-schema.mjs
 *
 * JSON-LD is the one thing on these pages that no human proofreads, because it
 * is invisible. A malformed block, a dangling @id or a Question nobody can see
 * costs a rich result and produces no symptom a person would notice — which is
 * why every check here is one that already went wrong or nearly did.
 *
 * WHAT IT ASSERTS
 *
 * 1. Every block parses. A block that throws is ignored entirely by Google, so
 *    a trailing comma silently deletes a page's whole graph.
 * 2. Every node has an @type. A node without one is inert.
 * 3. Every @id and every url on this origin points at a real URL. This is the
 *    one that catches a renamed page: the graph keeps referencing the address
 *    that used to exist, and mainEntityOfPage quietly dangles.
 * 4. Every FAQPage Question is visible text on that same page. Google's actual
 *    rule; check-build asserts this for calculators, this widens it to the
 *    whole site.
 * 5. Every page offering a Service is a page the sitemap lists. A service we
 *    advertise in structured data and omit from the sitemap is one Google is
 *    told about twice and can find once.
 *
 *    This compares each Service page's own canonical against the sitemap,
 *    rather than the Service node's url: these nodes carry no url field. The
 *    first draft of this check read node.url, found nothing on any page, and
 *    reported "0 Service URLs present" as a pass — a gate incapable of
 *    failing, which is the failure mode this whole file exists to prevent.
 *
 * WHY dist/ AND NOT .build/pages/
 *
 * The schema is identical in both, but the sitemap this compares against is
 * only written to dist/, and a gate that reads two trees is a gate that can
 * be satisfied by a stale one.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'

import { PAGE_URLS, SITE_ORIGIN } from '../src/data/url-map.js'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')

if (!existsSync(distDir)) {
  console.error('check-schema: dist/ not found — run `npm run build` first.')
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

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
}

function decodeEntities(s) {
  return String(s)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&middot;', '·')
    .replaceAll('&nbsp;', ' ')
}

/** Every node in a graph, including nested ones, so @id checks reach all of them. */
function* nodes(value) {
  if (Array.isArray(value)) {
    for (const item of value) yield* nodes(item)
    return
  }
  if (value && typeof value === 'object') {
    yield value
    for (const item of Object.values(value)) yield* nodes(item)
  }
}

const failures = []
const pages = walk(distDir)

// Sitemap URLs, for check 5. dist/sitemap.xml is written by the build.
const sitemapPath = resolve(distDir, 'sitemap.xml')
if (!existsSync(sitemapPath)) {
  console.error('check-schema: dist/sitemap.xml not found — run `npm run build` first.')
  process.exit(1)
}
const sitemapUrls = new Set(
  [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
)

// Every address this site legitimately answers on, for check 3. Fragment ids
// (#business, #article) are identifiers, not addresses, so the fragment is
// stripped before comparing.
const knownUrls = new Set([SITE_ORIGIN, `${SITE_ORIGIN}/`])
for (const url of Object.values(PAGE_URLS)) knownUrls.add(`${SITE_ORIGIN}${url}`)
for (const loc of sitemapUrls) knownUrls.add(loc)

function canonicalOf(html) {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/)
  return m ? m[1] : null
}

let blockCount = 0
const servicePages = new Set()

for (const file of pages) {
  const rel = relative(distDir, file).split(sep).join('/')
  if (rel.startsWith('api/')) continue
  const html = readFileSync(file, 'utf8')
  const visible = decodeEntities(stripTags(html))

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  for (const [, raw] of blocks) {
    blockCount++
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      failures.push(`${rel}: JSON-LD does not parse — ${error.message}. Google discards the whole block.`)
      continue
    }

    for (const node of nodes(data)) {
      const type = node['@type']

      // 2. a node with properties but no @type
      const hasOwnProperties = Object.keys(node).some((k) => !k.startsWith('@'))
      if (!type && hasOwnProperties && !node['@id']) {
        const preview = JSON.stringify(node).slice(0, 80)
        failures.push(`${rel}: JSON-LD node has no @type and is inert — ${preview}`)
      }

      // 3. @id / url on this origin must be an address that exists
      for (const field of ['@id', 'url']) {
        const value = node[field]
        if (typeof value !== 'string' || !value.startsWith(SITE_ORIGIN)) continue
        const withoutFragment = value.split('#')[0]
        if (!knownUrls.has(withoutFragment)) {
          failures.push(`${rel}: JSON-LD ${field} "${value}" points at a URL this site does not serve`)
        }
      }

      // 4. every FAQPage question must be visible on the page
      if (type === 'FAQPage') {
        for (const q of node.mainEntity ?? []) {
          if (typeof q?.name !== 'string') continue
          if (!visible.includes(decodeEntities(q.name))) {
            failures.push(`${rel}: FAQPage question "${q.name}" is not visible text on this page`)
          }
        }
      }

      // 5. note that this page offers a Service; checked against the sitemap below
      if (type === 'Service') servicePages.add(rel)
    }
  }
}

for (const rel of servicePages) {
  const canonical = canonicalOf(readFileSync(resolve(distDir, rel), 'utf8'))
  if (!canonical) {
    failures.push(`${rel}: offers a Service in structured data but has no canonical link`)
    continue
  }
  if (!sitemapUrls.has(canonical)) {
    failures.push(`${rel}: offers a Service in structured data, but its canonical ${canonical} is not in dist/sitemap.xml`)
  }
}

if (failures.length) {
  console.error(`check-schema FAILED — ${failures.length} issue(s):\n`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `check-schema passed — ${blockCount} JSON-LD block(s) across ${pages.length} page(s): all parse, ` +
    `every node typed, every on-site @id and url resolves, every FAQPage question visible, ` +
    `all ${servicePages.size} Service page(s) listed in the sitemap.`
)
