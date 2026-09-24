/**
 * The intro paragraph of each calculator page (PR #28).
 *
 * These were typed twice — once in CALCULATOR_PAGES in calculator-config.js,
 * once in each src/templates/calculator/*.html — identical, and every dollar
 * figure in them hand-computed. Now each figure is computed here from the
 * same scenario the words describe, and rendered once: into the page's hero
 * (the {{calculator.intro}} placeholder) and as the answer under the page's
 * pricing table (calculator-tables.mjs). check-build's check 6 reads the
 * per-square-foot band from here.
 *
 * Dollar totals go through proseRound() — a sentence is not a table. The
 * per-square-foot bands are rates and stay whole dollars, as the calculator
 * computes them. Plain text: nothing here needs HTML escaping.
 *
 * Keyed like CALCULATOR_PAGES.
 */
import { SERVICES } from './services.js'
import { projectEstimate, proseAmount, proseCost, proseRange, proseSpan, servicePerSqftBand } from './pricing-sync.js'

/** "$39–$92", the calculator's own per-sq-ft band for a service. */
function band(serviceKey) {
  const { min, max } = servicePerSqftBand(serviceKey)
  return `$${Math.round(min)}–$${Math.round(max)}`
}

const porch = SERVICES.find((s) => s.id === 'screened-porches')
const bathSmall = projectEstimate('bathRemodel', 'basicRefresh', 35)

export const CALCULATOR_INTROS = {
  decks: `Decks in Upstate SC typically cost ${band('decks')} per square foot installed — a 12×16 deck (192 sqft) runs ${proseCost('decks', 'pressureTreated', 192)} in pressure-treated lumber or ${proseCost('decks', 'compositeLowMaintenance', 192)} in composite. Size, height, railing, and stairs are the biggest cost drivers.`,
  garages: `A standard two-car detached garage (24×24, 576 sqft) in Upstate SC costs ${proseCost('garages', 'detachedStandard', 576)} fully finished — slab, framing, roof, doors, and basic electrical. A comparable attached garage runs ${proseCost('garages', 'attachedBasic', 576)}, and workshop upgrades or larger 3-car footprints (900 sqft) commonly run ${proseCost('garages', 'upgradedWorkshop', 900)}.`,
  porch: `Screened porches in Upstate SC typically run ${proseSpan(porch)} depending on size, roof structure, and finishes. Converting an existing deck can save 50–70% versus new construction since the framing and floor are already in place.`,
  additions: `Room additions in Upstate SC typically cost ${band('homeAdditions')} per square foot depending on finishes, HVAC, plumbing, and structural complexity — a 400 sqft addition typically runs ${proseRange(projectEstimate('homeAdditions', 'basicFinish', 400), projectEstimate('homeAdditions', 'premiumCustom', 400))}. Use this calculator for a realistic planning range.`,
  kitchen: `Kitchen remodels in Greenville and Laurens County SC typically cost ${band('kitchenRemodel')} per square foot — a 200 sqft kitchen runs ${proseRange(projectEstimate('kitchenRemodel', 'standardRefresh', 200), projectEstimate('kitchenRemodel', 'premiumCustom', 200))} depending on cabinetry, counters, and layout changes.`,
  bath: `Bathroom remodels in Greenville and Laurens County SC typically run ${proseRange(bathSmall, projectEstimate('bathRemodel', 'fullGutRenovation', 150))} depending on scope — a small 35 sq ft powder room refresh starts around ${proseAmount(bathSmall.budgetLow)}, while a full 150 sq ft primary bath gut renovation with premium finishes can run ${proseCost('bathRemodel', 'fullGutRenovation', 150)}+.`,
  wholeHome: `Whole-home remodels in Greenville and Laurens County SC typically cost ${band('wholeHomeRemodel')} per square foot — a 2,000 sqft home runs ${proseRange(projectEstimate('wholeHomeRemodel', 'standardRefresh', 2000), projectEstimate('wholeHomeRemodel', 'highEndRenovation', 2000))} depending on scope and finish level.`,
  coveredPatios: `Covered patios in Upstate SC typically cost ${band('coveredPatios')} per square foot — a 320 sqft mid-range outdoor room with decorative columns and lighting runs ${proseCost('coveredPatios', 'midRangeOutdoorRoom', 320)}. Roof structure, columns, and finish level are the biggest cost drivers.`,
  basement: `Basement finishing in Upstate SC typically costs ${band('basementFinishing')} per square foot — a 1,000 sqft basement runs ${proseRange(projectEstimate('basementFinishing', 'basicFinish', 1000), projectEstimate('basementFinishing', 'premiumBuildOut', 1000))} depending on scope, from a basic finished space to a full living suite with bedroom and bath, up to a premium build-out with wet bar and media room.`,
}
