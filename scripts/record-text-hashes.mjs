/**
 * Records the visible-text hash of every page dated by a literal override,
 * beside its date, in src/data/content-date-overrides.json ("textHashes").
 * check-build check 15 then fails when such a page's text changes and its
 * date does not.
 *
 *   npm run build && node scripts/record-text-hashes.mjs
 *
 * Run it after bumping an override's dateModified for a page whose text
 * changed. It REFUSES to re-record a page whose text changed while its
 * dateModified did not: that is exactly the situation check 15 exists to
 * catch, and silently re-recording it would erase the finding. Bump the date
 * first. --accept overrides the refusal, for a text change that genuinely
 * does not warrant a new date (say why in the commit message).
 *
 * Reads .build/pages/, so it needs a fresh build.
 */
import fs from 'node:fs'
import path from 'node:path'

import { OVERRIDES_PATH, overrideDatedPages, readOverridesFile } from './lib/override-pages.mjs'
import { visibleTextHash } from './lib/visible-text.mjs'

const root = path.resolve(import.meta.dirname, '..')
const pagesRoot = path.join(root, '.build/pages')
const accept = process.argv.includes('--accept')

if (!fs.existsSync(pagesRoot)) {
  console.error('record-text-hashes: .build/pages/ not found — run `npm run build` first.')
  process.exit(1)
}

const overrides = readOverridesFile()
const previous = overrides.textHashes ?? {}
const next = {}
const refused = []
let changed = 0

for (const { rel, key, dateModified } of overrideDatedPages(overrides)) {
  const hash = visibleTextHash(fs.readFileSync(path.join(pagesRoot, rel), 'utf8'))
  const before = previous[rel]
  if (before && before.hash !== hash && before.dateModified === dateModified && !accept) {
    refused.push(`${rel}: text changed but its dateModified is still ${dateModified} (${key}) — bump the date, then re-run`)
    next[rel] = before
    continue
  }
  if (!before || before.hash !== hash || before.dateModified !== dateModified || before.key !== key) changed++
  next[rel] = { key, dateModified, hash }
}

if (refused.length) {
  console.error('record-text-hashes: refused to re-record without a date change:\n  ' + refused.join('\n  '))
  process.exit(1)
}

overrides.textHashes = next
fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2) + '\n')
console.log(`record-text-hashes: ${Object.keys(next).length} page(s) recorded, ${changed} new or changed.`)
