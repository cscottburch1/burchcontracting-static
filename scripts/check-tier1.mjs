/**
 * The content floor for Tier 1 service pages. Reads dist/, exits 1 on failure.
 *
 *   node scripts/check-tier1.mjs
 *
 * Phase 6 promotes bathroom remodeling, kitchen remodeling, ADA bath-to-shower
 * and whole-home remodeling to lead offers. A lead offer is not a tier label in
 * a data file; it is a page that answers the questions a buyer actually has and
 * routes them to a price and a next step. This asserts the minimum.
 *
 * FOR EVERY SERVICE WITH `tier: 1`:
 *
 * 1. At least 6 FAQPage questions. Below that the page does not cover the
 *    obvious objections, and it will not earn an FAQ rich result.
 * 2. A link to its own calculator. Every Tier 1 service has one; a lead page
 *    that does not offer the price tool is throwing the lead away.
 * 3. At least one link to a cost guide under /cost/. This is the one the site
 *    fails today on every Tier 1 page — the guides exist and nothing points at
 *    them from the service pages.
 * 4. A headline range that agrees with its own pricing table. `garage-builder`
 *    is the canonical contradiction: the hero says "$39,000-$145,000" and the
 *    first table row says a 2-car is "$51,798–$62,381". Compared in the
 *    headline's own unit — the first version compared bath and kitchen's
 *    absolute headlines against their per-sq-ft tier table and called them
 *    "not comparable" while an absolute project table sat on the same page —
 *    allowing only displayRound(). headlineAgreesWithTable() in pricing-sync.js
 *    is the one implementation; check-build's check 12 runs it on every service.
 *
 * In `npm test` since Phase 6.6, the commit that made it pass. It was written
 * and shown failing first (10 findings at 6.0, 3 after 6.3), as the gate-adding
 * rule in RUNBOOK.md requires: a gate added green is a gate nobody has seen work.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { headlineAgreesWithTable } from '../src/data/pricing-sync.js'
import { SERVICES } from '../src/data/services.js'
import { pageUrl } from '../src/data/url-map.js'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')

if (!existsSync(distDir)) {
  console.error('check-tier1: dist/ not found — run `npm run build` first.')
  process.exit(1)
}

const tier1 = SERVICES.filter((s) => s.tier === 1)
const failures = []

if (!tier1.length) {
  console.error(
    'check-tier1: no service carries `tier: 1`. Phase 6.1 adds the tier field; until then this ' +
      'check has nothing to assert, and a check with nothing to assert is not a check.'
  )
  process.exit(1)
}

for (const service of tier1) {
  const file = resolve(distDir, `${service.slug}/index.html`)
  if (!existsSync(file)) {
    failures.push(`${service.slug}: no built page at ${service.slug}/index.html`)
    continue
  }
  const html = readFileSync(file, 'utf8')
  const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ')
  const label = service.slug

  // 1. FAQ depth
  const questions = [...html.matchAll(/"@type":"Question","name":"([^"]*)"/g)].map((m) => m[1])
  if (questions.length < 6) {
    failures.push(`${label}: ${questions.length} FAQPage question(s), needs at least 6`)
  }

  // 2. its own calculator
  const ownCalculator = service.calculator ? pageUrl(`calculator/${service.calculator}.html`) : null
  if (!ownCalculator) {
    failures.push(`${label}: tier 1 but no calculator defined in services.js`)
  } else if (!body.includes(`href="${ownCalculator}"`)) {
    failures.push(`${label}: does not link to its own calculator (${ownCalculator})`)
  }

  // 3. at least one cost guide
  const costLinks = [...body.matchAll(/href="(\/cost\/[^"]+)"/g)].map((m) => m[1])
  if (!costLinks.length) {
    failures.push(`${label}: links to no cost guide under /cost/`)
  }

  // 4. headline range vs its own table — the same function check-build's
  // check 12 runs over every service.
  if (!service.stats?.costRange || !/\$/.test(service.stats.costRange)) {
    failures.push(`${label}: stats.costRange has no dollar amount`)
  } else {
    const problem = headlineAgreesWithTable(service)
    if (problem) failures.push(`${label}: ${problem}`)
  }
}

if (failures.length) {
  console.error(`check-tier1 FAILED — ${failures.length} issue(s) across ${tier1.length} Tier 1 page(s):\n`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `check-tier1 passed — ${tier1.length} Tier 1 page(s): 6+ FAQ questions, own calculator linked, ` +
    `a cost guide linked, and a headline range matching the page's own table.`
)
