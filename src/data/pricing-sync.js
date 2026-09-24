/**
 * Derives display-ready pricing strings for the standalone service pages
 * (src/data/services.js) directly from src/js/calculator-config.js, so the
 * two can never drift out of sync again. calculator-config.js is the single
 * source of truth for all pricing on this site — this module never invents
 * a number, it only formats what calculateEstimate() already produces.
 */
import { PRICING_CONFIG, QUOTED_RATES, adaBathEstimate, calculateEstimate, formatCurrency } from '../js/calculator-config.js'

const DEFAULT_LOCATION = 'fountainInnArea'

function firstKey(obj) {
  return Object.keys(obj)[0]
}

/**
 * Typical dollar estimate for one rate tier at a specific size, with
 * optional factor overrides (defaults to the baseline/first option for
 * material, complexity, and site — i.e. the least-upgraded scenario).
 */
export function projectEstimate(serviceKey, rateId, sqft, overrides = {}) {
  const service = PRICING_CONFIG.services[serviceKey]
  const rate = service.baseRates[rateId]
  const locationKey = overrides.location ?? DEFAULT_LOCATION
  const materialKey = overrides.material ?? firstKey(service.materialFactors)
  const complexityKey = overrides.complexity ?? firstKey(service.complexityFactors)
  const siteKey = overrides.site ?? firstKey(service.siteConditionFactors)

  const est = calculateEstimate({
    squareFootage: sqft,
    baseDirectCost: rate.directCost,
    locationFactor: PRICING_CONFIG.locationFactors[locationKey].factor,
    materialFactor: service.materialFactors[materialKey],
    complexityFactor: service.complexityFactors[complexityKey],
    siteConditionFactor: service.siteConditionFactors[siteKey],
    addersTotal: 0,
    overheadAndProfit: PRICING_CONFIG.defaultOverheadAndProfit,
    outputRanges: PRICING_CONFIG.outputRanges,
  })
  return est
}

/** "$X,XXX–$Y,YYY" using the budget-conscious/custom-high bounds. */
export function projectCostString(serviceKey, rateId, sqft, overrides = {}) {
  const est = projectEstimate(serviceKey, rateId, sqft, overrides)
  return `${formatCurrency(est.budgetLow)}–${formatCurrency(est.customHigh)}`
}

/**
 * Combines the low end of one project estimate with the high end of another
 * into one "$X,XXX–$Y,YYY" string — e.g. a service's cheapest scenario
 * (small/basic) through its priciest scenario (large/premium).
 */
export function combinedCostString(lowEstimate, highEstimate, { plus = false } = {}) {
  return `${formatCurrency(lowEstimate.budgetLow)}–${formatCurrency(highEstimate.customHigh)}${plus ? '+' : ''}`
}

/**
 * Typical $/sqft band for one rate tier, using the calculator's own
 * budget-conscious/custom-high output spread (0.93x-1.12x) at baseline
 * factors — the same "typical, no upgrades assumed" scenario used for the
 * calculator hero copy and services.html, so both stay aligned. ($/sf is
 * scale-invariant here since there are no adders, so any sqft works.)
 */
export function tierPerSqftBand(serviceKey, rateId, overrides = {}) {
  const est = projectEstimate(serviceKey, rateId, 100, overrides)
  return { min: est.budgetLow / 100, max: est.customHigh / 100 }
}

/** "$XX–$YY/sq ft" for one rate tier. */
export function tierPerSqftString(serviceKey, rateId, overrides = {}) {
  const { min, max } = tierPerSqftBand(serviceKey, rateId, overrides)
  return `$${Math.round(min)}-${Math.round(max)}/sq ft`
}

/** Combined $/sqft band across every rate tier in a service (for stats.costRange / pricePerSqFt). */
export function servicePerSqftBand(serviceKey) {
  const service = PRICING_CONFIG.services[serviceKey]
  let min = Infinity
  let max = -Infinity
  for (const rateId of Object.keys(service.baseRates)) {
    const band = tierPerSqftBand(serviceKey, rateId)
    min = Math.min(min, band.min)
    max = Math.max(max, band.max)
  }
  return { min, max }
}

export function servicePerSqftString(serviceKey) {
  const { min, max } = servicePerSqftBand(serviceKey)
  return `$${Math.round(min)}-${Math.round(max)} Per Sq Ft`
}

/**
 * Nearest $500, for headline display only (Phase 6.6). A headline like
 * "$3,984–$98,018+" reads as false precision on a range that wide; the table
 * under it keeps the calculator's exact figures, and nothing here touches
 * calculator math.
 */
export function displayRound(amount) {
  return Math.round(amount / 500) * 500
}

/**
 * A service's headline range: the low end of its cheapest table row through
 * the high end of its priciest, rounded for display. Pass the SAME estimates
 * the table rows use, so the headline cannot disagree with the table under it
 * — which is what headlineAgreesWithTable() asserts.
 */
export function displayRange(lowEstimate, highEstimate, { plus = false } = {}) {
  return `${formatCurrency(displayRound(lowEstimate.budgetLow))}–${formatCurrency(displayRound(highEstimate.customHigh))}${plus ? '+' : ''}`
}

/** Every amount in a price string. "$39-92" is two amounts: the second has no $ of its own. */
function dollarAmounts(text) {
  return [...String(text).matchAll(/\$([0-9][0-9,]*)(?:\s*[-–]\s*\$?([0-9][0-9,]*))?/g)]
    .flatMap((m) => [m[1], m[2]])
    .filter(Boolean)
    .map((n) => Number(n.replace(/,/g, '')))
}

function perSqFt(text) {
  return /sq\s?ft/i.test(String(text))
}

/**
 * Does a service's headline (stats.costRange) equal min..max of its own
 * table rows in the same unit? Returns null if it does, or a sentence saying
 * how it does not. Used by check-build (every service) and check-tier1.
 *
 * "Its own table" is every commonProjects cost and pricingTiers range quoted
 * in the headline's unit — absolute dollars or per square foot. Each bound
 * may match exactly or after displayRound(). A headline with no dollar amount
 * ("Custom Quote") has nothing to agree with.
 */
export function headlineAgreesWithTable(service) {
  const headline = service.stats?.costRange ?? ''
  const hero = dollarAmounts(headline)
  if (!hero.length) return null
  const unitPerSqFt = perSqFt(headline)
  const rows = [
    ...(service.commonProjects ?? []).map((p) => p.cost),
    ...(service.pricingTiers ?? []).map((t) => t.range),
  ].filter((text) => text && perSqFt(text) === unitPerSqFt)
  const table = rows.flatMap(dollarAmounts)
  if (!table.length) return null
  const [heroMin, heroMax] = [Math.min(...hero), Math.max(...hero)]
  const [tableMin, tableMax] = [Math.min(...table), Math.max(...table)]
  const agrees = (h, t) => h === t || h === displayRound(t)
  if (agrees(heroMin, tableMin) && agrees(heroMax, tableMax)) return null
  return (
    `headline "${headline}" says $${heroMin.toLocaleString()}–$${heroMax.toLocaleString()}, ` +
    `its own ${unitPerSqFt ? 'per-sq-ft' : 'dollar'} table says $${tableMin.toLocaleString()}–$${tableMax.toLocaleString()}`
  )
}

/**
 * ADA bath-to-shower, cheapest configuration to priciest: the calculator's
 * opening state (fiberglass, grab bars, standard valve, Fountain Inn area)
 * through tile, grab bars, thermostatic valve, Simpsonville/Greenville.
 * Rounded to $100, which is how the owner states it: "$9,800–$25,400".
 */
export function adaBathRange() {
  const low = adaBathEstimate().finalLow
  const high = adaBathEstimate({ location: 'simpsonvilleArea', finish: 'tile', grabBars: true, thermostatic: true }).finalHigh
  const to100 = (n) => Math.round(n / 100) * 100
  return `${formatCurrency(to100(low))}–${formatCurrency(to100(high))}`
}

/** An owner-quoted per-sq-ft rate as "$X-Y/sq ft" (see QUOTED_RATES). */
export function quotedPerSqft(key) {
  const r = QUOTED_RATES[key]
  return `$${r.perSqftLow}-${r.perSqftHigh}/sq ft`
}

/**
 * An owner-quoted per-sq-ft rate applied to a size range, shaped like a
 * projectEstimate() so displayRange() takes it: low rate x smallest size
 * through high rate x largest.
 */
export function quotedEstimate(key, minSqft, maxSqft = minSqft) {
  const r = QUOTED_RATES[key]
  return { budgetLow: r.perSqftLow * minSqft, customHigh: r.perSqftHigh * maxSqft }
}

/** quotedEstimate() as "$X–$Y". */
export function quotedCost(key, minSqft, maxSqft = minSqft) {
  const e = quotedEstimate(key, minSqft, maxSqft)
  return `${formatCurrency(e.budgetLow)}–${formatCurrency(e.customHigh)}`
}

/** The handyman rate: "$65/hr, 2-hour minimum ($130)". */
export function handymanRate() {
  const { hourly, minimumHours } = QUOTED_RATES.handyman
  return `$${hourly}/hr, ${minimumHours}-hour minimum (${formatCurrency(hourly * minimumHours)})`
}

/**
 * Rounding for dollar figures in sentences (PR #28): nearest $100 under
 * $10,000, nearest $500 from $10,000, nearest $1,000 from $100,000. A sentence
 * saying "$6,375 to $30,708" reads as false precision; the table under it is
 * where exact figures belong. Tables keep exact figures and headlines keep
 * displayRound(); nothing here touches calculator math.
 */
export function proseRound(amount) {
  if (amount < 10000) return Math.round(amount / 100) * 100
  if (amount < 100000) return Math.round(amount / 500) * 500
  return Math.round(amount / 1000) * 1000
}

/** One amount, prose-rounded: "$72,500". */
export function proseAmount(amount) {
  return formatCurrency(proseRound(amount))
}

/** projectCostString(), prose-rounded: "$6,400–$7,700". */
export function proseCost(serviceKey, rateId, sqft, overrides = {}) {
  const est = projectEstimate(serviceKey, rateId, sqft, overrides)
  return `${proseAmount(est.budgetLow)}–${proseAmount(est.customHigh)}`
}

/** The low end of one estimate to the high end of another, prose-rounded. */
export function proseRange(lowEstimate, highEstimate, { plus = false } = {}) {
  return `${proseAmount(lowEstimate.budgetLow)}–${proseAmount(highEstimate.customHigh)}${plus ? '+' : ''}`
}

/** An exact "$A–$B" (a table cell) re-stated for a sentence. */
export function proseOf(exactRange) {
  const [low, high] = dollarAmounts(exactRange)
  return high === undefined ? proseAmount(low) : `${proseAmount(low)}–${proseAmount(high)}${/\+\s*$/.test(exactRange) ? '+' : ''}`
}

/**
 * A service's whole dollar table (its common projects and pricing tiers), low
 * to high, prose-rounded — what an FAQ answer should say where the headline
 * says the same range displayRound()-ed. "+" if the headline carries one.
 */
export function proseSpan(service) {
  const rows = [...(service.commonProjects ?? []).map((p) => p.cost), ...(service.pricingTiers ?? []).map((t) => t.range)]
    .filter((text) => text && !perSqFt(text))
  const amounts = rows.flatMap(dollarAmounts)
  const plus = /\+/.test(service.stats?.costRange ?? '')
  return `${proseAmount(Math.min(...amounts))}–${proseAmount(Math.max(...amounts))}${plus ? '+' : ''}`
}

/**
 * Dollar figures in a sentence that are prices, not rates: "$72K" counts as
 * 72,000; anything per sq ft, per hour or per month is a rate and is skipped.
 */
export function proseDollarFigures(text) {
  const out = []
  const re = /\$([0-9][0-9,]*(?:\.\d+)?)(K)?(?:\+)?(?:\s*(?:[-–]|to)\s*\$?([0-9][0-9,]*(?:\.\d+)?)(K)?)?(\+)?(\s*(?:\/\s*(?:sq|hr|hour|mo|month)|per\s+(?:sq|square|hour|month)))?/g
  for (const m of String(text).matchAll(re)) {
    if (m[6]) continue
    const n = (v, k) => Number(v.replace(/,/g, '')) * (k ? 1000 : 1)
    out.push(n(m[1], m[2]))
    if (m[3]) out.push(n(m[3], m[4]))
  }
  return out
}

/**
 * Every price in a service's prose must be proseRound() of a figure in that
 * service's own tables, or a declared cited figure. This is how a hand-typed
 * number gets caught: it will not be the rounding of anything the page prices.
 * Returns the problems as sentences; empty if none.
 */
export function proseAgreesWithTable(service, proseTexts, cited = []) {
  const table = [
    ...(service.commonProjects ?? []).map((p) => p.cost),
    ...(service.pricingTiers ?? []).map((t) => t.range),
    ...(service.additionalCosts ?? []).map((c) => c.cost),
  ].flatMap(dollarAmounts)
  if (!table.length) return []
  const allowed = new Set([...table.map(proseRound), ...cited])
  const problems = []
  for (const [where, text] of proseTexts) {
    for (const amount of proseDollarFigures(text)) {
      if (!allowed.has(amount)) problems.push(`${where}: $${amount.toLocaleString()} is not proseRound() of any figure in this service's tables, and is not a declared cited figure`)
    }
  }
  return problems
}

/**
 * An owner-quoted typical range (QUOTED_RATES.<key>: { low, high }), shaped
 * like a projectEstimate(). Pass the calculator's own priciest estimate for
 * the same work: if it exceeds the quoted high, the range reads with a "+" —
 * the calculator keeps its math and the page says the typical job.
 */
export function quotedTypical(key, calculatorMax) {
  const { low, high } = QUOTED_RATES[key]
  return { budgetLow: low, customHigh: high, plus: Boolean(calculatorMax && calculatorMax.customHigh > high) }
}

/** quotedTypical() as a table cell: "$60,000–$350,000+". */
export function quotedTypicalString(key, calculatorMax) {
  const t = quotedTypical(key, calculatorMax)
  return `${formatCurrency(t.budgetLow)}–${formatCurrency(t.customHigh)}${t.plus ? '+' : ''}`
}
