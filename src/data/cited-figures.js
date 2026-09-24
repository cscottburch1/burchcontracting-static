/**
 * Dollar figures in a service page's prose that are NOT Burch Contracting
 * prices, and so must not be prose-rounded from a table (PR #28).
 *
 * check-build's check 12 requires every price in a service's prose to be
 * proseRound() of a figure in that service's own tables. A cited statistic is
 * not one: rounding "$15,586" to fit our pricing would misquote This Old House.
 * Each entry names where the figure comes from; anything not listed here, and
 * not the rounding of a table figure, fails the build as a hand-typed number.
 */
import { QUOTED_RATES } from '../js/calculator-config.js'
import { adaBathRange } from './pricing-sync.js'

// The ADA bath-to-shower range, as the owner states it ($100 rounding — see
// adaBathRange()). The bathroom page quotes it when it points readers to the
// ADA page; the bathroom page's own tables do not contain it.
const adaRange = [...adaBathRange().matchAll(/\$([0-9,]+)/g)].map((m) => Number(m[1].replace(/,/g, '')))

export const CITED_FIGURES = {
  'bathroom-remodeling': [
    { amount: 15586, source: 'This Old House, 2026 national bathroom remodel average' },
    { amount: 6456, source: 'This Old House, 2026 national common range (low)' },
    { amount: 24715, source: 'This Old House, 2026 national common range (high)' },
    { amount: 70, source: 'This Old House, 2026 national per-square-foot range (low)' },
    { amount: 250, source: 'This Old House, 2026 national per-square-foot range (high)' },
    { amount: 400000, source: 'Simpsonville median home price, mid-2026, as the market note states it' },
    { amount: 5000, source: 'Greenville County permit flag for bathroom remodels over $5,000; Remodeling Cost vs. Value "cosmetic refresh under $5,000"' },
    ...adaRange.map((amount) => ({ amount, source: 'ADA bath-to-shower range, owner-stated (adaBathRange)' })),
  ],
  // The two-hour minimum is an exact owner-quoted charge (QUOTED_RATES.handyman),
  // not a price to round: $130 is not $100.
  handyman: [{ amount: QUOTED_RATES.handyman.hourly * QUOTED_RATES.handyman.minimumHours, source: 'Owner-quoted two-hour minimum (QUOTED_RATES.handyman)' }],
}

export function citedAmounts(serviceId) {
  return (CITED_FIGURES[serviceId] ?? []).map((f) => f.amount)
}
