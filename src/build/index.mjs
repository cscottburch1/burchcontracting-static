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
 * ONE PAGE IS STILL COPIED, AND ALWAYS WILL BE
 *
 * 404.html. It must keep noindex permanently, it has no entry in PAGE_URLS, and
 * it is the one page whose chrome is allowed to differ. Since vite scans exactly
 * one directory, it has to be in that directory, so it is copied across.
 *
 * Nothing else is. As of Phase 3.3b every other page in dist/ is rendered by a
 * pure render() in this directory, from data in src/data/ and templates in
 * src/templates/, and no committed .html file is both a source and an output.
 * That is the end state Phase 3 was for.
 *
 * There is no longer an ordering constraint between prebuild steps, because
 * there are no longer several prebuild steps: `npm run prebuild` is this file.
 * The one real dependency that remained — a calculator's pricing table has to
 * be in place before the trust layer reads its <h2> — is now two statements in
 * pages.mjs, which is where a dependency between two steps belongs.
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
 * Pages copied verbatim rather than rendered.
 *
 * 3.3a-ii removed the seven hand-authored pages and 3.3b the eleven
 * calculators. 404.html is what is left, and it is not scaffolding: see above.
 *
 * This list and CHROME_EXEMPT in scripts/check-build.mjs describe the same
 * page. If one of them ever grows, the other should too, and the reason should
 * be as durable as this one.
 */
const COPIED_PAGES = ['404.html']

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
  `(${rendered.length} rendered, ${copied} copied verbatim), plus sitemap.xml`
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
