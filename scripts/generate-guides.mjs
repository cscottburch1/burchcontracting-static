/**
 * Writes the cost guides and articles produced by src/build/guides.mjs.
 *
 * Phase 3.2 split this in two. All the rendering moved to src/build/guides.mjs
 * as a pure render() — data in, {url, file, html} out, no filesystem access and
 * nothing executed at module top level. This file is the only part that
 * touches disk.
 *
 * The split is what makes the generators importable by each other. Previously
 * every generator wrote files as it ran, so importing one to reuse its chrome
 * would have written pages as a side effect of the import — which is precisely
 * why all three carried a verbatim copy of the header and footer instead.
 *
 * Output locations are unchanged by this step, on purpose: it is a pure
 * refactor and the content gate must show zero difference. Phase 3.2d moves
 * every generator's output to .build/pages/ and stops committing generated
 * HTML.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { render, summary } from '../src/build/guides.mjs'

const root = resolve(import.meta.dirname, '..')

const pages = render()
for (const page of pages) {
  const target = resolve(root, page.file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, page.html, 'utf-8')
}

console.log(
  `✅ Generated ${pages.length} pages: ${summary.costGuides} cost guides, ` +
  `${summary.articles} articles, ${summary.hubs} hubs.`
)
