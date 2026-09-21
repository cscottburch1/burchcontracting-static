/**
 * Writes the service-area pages, faqs.html and the sitemap produced by
 * src/build/geo.mjs.
 *
 * Phase 3.2, third of three generators. All rendering lives in src/build/geo.mjs
 * as pure functions; this file is the only part that touches disk. See
 * scripts/generate-guides.mjs for why the split matters.
 *
 * The sitemap comes from a separate export, not from the page list, because it
 * is not a page: different destination, no chrome, and none of the page gates
 * apply to it. Phase 3.2d routes it into the build output rather than public/,
 * and Phase 3.5 then drops public/sitemap.xml from git — it is a committed
 * build artifact today, the same anti-pattern as the committed generated HTML.
 *
 * Output locations are unchanged by this step, deliberately: it is a pure
 * refactor and the content gate must show zero difference.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { render, renderSitemap } from '../src/build/geo.mjs'

const root = resolve(import.meta.dirname, '..')

const { pages, factsNeeded } = render()

for (const page of pages) {
  const target = resolve(root, page.file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, page.html, 'utf-8')
}

writeFileSync(resolve(root, 'public/sitemap.xml'), renderSitemap(), 'utf-8')

console.log(`Generated ${pages.length - 1} service area pages, faqs.html, and sitemap.xml`)

if (factsNeeded.length) {
  console.log(`\n${factsNeeded.length} FACT-NEEDED item(s) from service-area pages (add to docs/archive/CITABILITY-FACTS-NEEDED.md):`)
  for (const f of factsNeeded) console.log(`  - [${f.area}] ${f.field}`)
}
