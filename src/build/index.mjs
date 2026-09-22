/**
 * The one entry point that produces every page.
 *
 * Calls each generator's pure render() and writes the result to .build/pages/,
 * which is gitignored and is the only directory vite scans for HTML inputs.
 * Nothing generated is committed; if it can be built, it is built.
 *
 * WHY .build/pages/ IS VITE'S ROOT, AND NOT JUST AN INPUT DIRECTORY
 *
 * Vite emits each HTML input at its path relative to `root`. With root left at
 * the project directory, an input at .build/pages/cost/index.html lands in
 * dist/.build/pages/cost/index.html — verified by experiment, not assumed. Every
 * URL on the site would have changed, which invariant 1 forbids outright.
 *
 * So .build/pages/ becomes the root, and vite.config.js compensates: publicDir
 * points back at the project's public/, and an alias maps /src to the real
 * src/. Both are needed because absolute paths inside a page resolve from root.
 *
 * THE VERBATIM COPIES ARE TEMPORARY
 *
 * Twelve pages are not generated yet — eleven calculators and 404.html. Since
 * vite now scans exactly one directory, they have to be in it, so they are
 * copied across byte-for-byte. That keeps this step content-neutral: the
 * snapshot must show zero difference.
 *
 * Phase 3.3b replaces the calculator copies with real rendering, at which point
 * COPIED_PAGES holds 404.html alone — permanently, since that page must keep
 * noindex and is the one page whose chrome is allowed to differ.
 *
 * ORDER MATTERS, for one remaining step. generate-calculator-tables.mjs still
 * patches the eleven calculator source pages in place, so it must run before
 * this file copies them. package.json's prebuild enforces that. Phase 3.3b
 * converts it the way 3.3c converted the trust layer, and the ordering
 * constraint goes away with it.
 */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import * as guides from './guides.mjs'
import * as services from './services.mjs'
import * as geo from './geo.mjs'
import * as handAuthored from './pages.mjs'

const project = resolve(import.meta.dirname, '../..')
const outDir = resolve(project, '.build/pages')

/**
 * Pages still copied verbatim rather than rendered.
 *
 * Phase 3.3a-ii removed the seven hand-authored pages from this list; they are
 * now rendered by pages.mjs through the shared chrome. What remains is the
 * eleven calculators, which Phase 3.3b converts, and 404.html, which stays here
 * permanently — it must keep noindex, it has no entry in PAGE_URLS, and it is
 * the one page whose chrome may differ.
 *
 * This list and CHROME_EXEMPT in scripts/check-build.mjs describe the same
 * pages and shrink together. Done means both are exactly ['404.html'].
 */
const COPIED_PAGES = [
  '404.html',
  'calculator/ada-bath-shower.html',
  'calculator/additions.html',
  'calculator/basement-finishing.html',
  'calculator/bath-remodel.html',
  'calculator/covered-patios.html',
  'calculator/decks.html',
  'calculator/estimate.html',
  'calculator/garages.html',
  'calculator/kitchen-remodel.html',
  'calculator/porch.html',
  'calculator/whole-home-remodel.html',
]

function write(relPath, contents) {
  const target = resolve(outDir, relPath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf-8')
}

// Rebuilt from scratch every run. A stale page left behind from a previous
// build would be picked up by the scan and shipped — the same class of bug as
// a page that never reaches dist/, in the opposite direction.
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const rendered = [
  ...guides.render(),
  ...services.render(),
  ...handAuthored.render(),
]
const geoResult = geo.render()
rendered.push(...geoResult.pages)

for (const page of rendered) write(page.file, page.html)

let copied = 0
const missing = []
for (const rel of COPIED_PAGES) {
  const source = resolve(project, rel)
  if (!existsSync(source)) {
    missing.push(rel)
    continue
  }
  const target = resolve(outDir, rel)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
  copied++
}

// The sitemap is not a page: its own destination, no chrome, none of the page
// gates. Written beside .build/pages/ so the scan never treats it as an input;
// scripts/write-sitemap.mjs puts it in dist/ after the build.
writeFileSync(resolve(project, '.build/sitemap.xml'), geo.renderSitemap(), 'utf-8')

const total = rendered.length + copied
console.log(
  `build: ${total} pages -> .build/pages/ ` +
  `(${rendered.length} rendered, ${copied} copied verbatim pending Phase 3.3), plus sitemap.xml`
)

if (missing.length) {
  console.error(
    `build: ${missing.length} page(s) listed in COPIED_PAGES do not exist:\n  ` + missing.join('\n  ')
  )
  process.exit(1)
}

if (geoResult.factsNeeded.length) {
  console.log(`\n${geoResult.factsNeeded.length} FACT-NEEDED item(s) from service-area pages:`)
  for (const f of geoResult.factsNeeded) console.log(`  - [${f.area}] ${f.field}`)
}
