/**
 * Every page whose dateModified comes from a literal entry in
 * src/data/content-date-overrides.json rather than from git history.
 *
 * Those are the pages whose date a person has to move by hand, so they are
 * the pages check-build check 15 watches. A page dated by git needs no watch:
 * its date moves when its own file changes.
 *
 * Mirrors how the build resolves dates: a service takes its __service__<id>
 * entry, else the __datafile__src/data/services.js pair (serviceDates() in
 * src/build/content-dates.mjs); a hand-authored or calculator page takes the
 * entry keyed by its own file; the area pages and /faqs take the geo-aeo.js
 * data-file entry. Only entries that are actually present are returned.
 */
import fs from 'node:fs'
import path from 'node:path'

import { CALCULATOR_PAGES_META } from '../../src/data/calculators.js'
import { SERVICE_AREAS } from '../../src/data/geo-aeo.js'
import { HAND_AUTHORED_PAGES } from '../../src/data/pages.js'
import { SERVICES } from '../../src/data/services.js'

const root = path.resolve(import.meta.dirname, '../..')
export const OVERRIDES_PATH = path.join(root, 'src/data/content-date-overrides.json')

export function readOverridesFile() {
  return JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'))
}

/** [{ rel, key, dateModified }] for every page dated by a literal override. */
export function overrideDatedPages(overrides = readOverridesFile()) {
  const literal = overrides.dates ?? {}
  const out = []
  const servicesKey = '__datafile__src/data/services.js'

  for (const s of SERVICES) {
    const own = literal[`__service__${s.id}`]
    const key = own ? `__service__${s.id}` : literal[servicesKey] ? servicesKey : null
    if (!key) continue
    const dateModified = (own && own.dateModified) || literal[servicesKey]?.dateModified
    if (dateModified) out.push({ rel: `${s.slug}/index.html`, key, dateModified })
  }

  for (const page of [...HAND_AUTHORED_PAGES, ...CALCULATOR_PAGES_META]) {
    const entry = literal[page.file]
    if (entry?.dateModified) out.push({ rel: page.file, key: page.file, dateModified: entry.dateModified })
  }

  const areaKey = '__datafile__src/data/geo-aeo.js'
  if (literal[areaKey]?.dateModified) {
    for (const a of SERVICE_AREAS) out.push({ rel: `service-areas/${a.slug}.html`, key: areaKey, dateModified: literal[areaKey].dateModified })
    out.push({ rel: 'faqs.html', key: areaKey, dateModified: literal[areaKey].dateModified })
  }

  return out
}
