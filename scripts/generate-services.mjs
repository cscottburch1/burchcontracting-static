/**
 * Writes the 16 service pages produced by src/build/services.mjs.
 *
 * Phase 3.2. All rendering lives in src/build/services.mjs as a pure render();
 * this file is the only part that touches disk. See scripts/generate-guides.mjs
 * for why the split matters — in short, the old top-level writes were what made
 * the generators unable to import each other, which is why all three carried a
 * verbatim copy of the chrome.
 *
 * Output locations are unchanged by this step, deliberately: it is a pure
 * refactor and the content gate must show zero difference. Phase 3.2d moves
 * output to .build/pages/.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { render } from '../src/build/services.mjs'

const root = resolve(import.meta.dirname, '..')

console.log('🏗️  Generating service pages...')

const pages = render()
for (const page of pages) {
  const target = resolve(root, page.file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, page.html, 'utf-8')
  console.log(`✓ Generated ${dirname(page.file)}`)
}

console.log(`✅ Generated ${pages.length} service pages successfully!`)
