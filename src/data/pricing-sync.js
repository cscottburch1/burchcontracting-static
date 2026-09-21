/**
 * Derives display-ready pricing strings for the standalone service pages
 * (src/data/services.js) directly from src/js/calculator-config.js, so the
 * two can never drift out of sync again. calculator-config.js is the single
 * source of truth for all pricing on this site — this module never invents
 * a number, it only formats what calculateEstimate() already produces.
 */
import { PRICING_CONFIG, calculateEstimate, formatCurrency } from '../js/calculator-config.js'

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
