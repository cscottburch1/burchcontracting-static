/**
 * The server-rendered pricing table + question heading on each calculator page.
 *
 * Why it exists: the interactive calculators render entirely client-side (an
 * empty <div id="calculator-app"> filled in by src/js/calculator.js), so a
 * crawler that does not execute JS sees no pricing and no H2 on these pages.
 * This builds real, crawlable markup from the same PRICING_CONFIG numbers the
 * live calculator computes from — nothing here is hand-typed, so the two cannot
 * drift (see PRICING.md).
 *
 * Phase 3.3b. This was scripts/generate-calculator-tables.mjs, which read each
 * calculator/*.html, replaced the span between <!-- AEO-PRICING-TABLE --> marker
 * comments, and wrote the file back — the last place in the build where a
 * committed page was both a source and an output. It returns strings now; the
 * table lands on a {{calculator.table}} placeholder in the page's template.
 */
import { PRICING_CONFIG, CALCULATOR_PAGES, ADA_BATH_SHOWER_ITEMS, defaultSquareFootage, formatCurrency } from '../js/calculator-config.js'
import { projectCostString, tierPerSqftString, servicePerSqftString } from '../data/pricing-sync.js'

/**
 * Keyed by the page's repo-relative path. Built once at module load: this is
 * pure computation over the pricing config, with no I/O, which is what lets
 * src/build/index.mjs import it at all. The old script could not be imported by
 * anything, because importing it wrote eleven files.
 */
const TABLES = {}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function tableSection({ question, answer, captionLabel, columns, rows }) {
  return `      <section class="bg-white py-16 lg:py-20 border-t border-slate-100 print:hidden">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">${esc(question)}</h2>
          <p class="text-slate-600 leading-relaxed mb-8">${esc(answer)}</p>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">${esc(captionLabel)}</caption>
              <thead class="bg-slate-50">
                <tr>
${columns.map((c) => `                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">${esc(c)}</th>`).join('\n')}
                </tr>
              </thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
}

function tierRow(cells) {
  const [head, ...rest] = cells
  return `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left">${esc(head)}</th>
${rest.map((cell, i) => `                  <td class="px-4 py-4 ${i === rest.length - 1 ? 'text-slate-600 text-sm leading-relaxed' : 'text-blue-700 font-semibold whitespace-nowrap'}">${esc(cell)}</td>`).join('\n')}
                </tr>`
}

// --- Standard sqft-based calculator pages -----------------------------
const STANDARD_PAGES = [
  { file: 'decks.html', calcKey: 'decks', question: 'How much does a deck cost in Upstate SC?' },
  { file: 'garages.html', calcKey: 'garages', question: 'How much does a garage cost in Upstate SC?' },
  { file: 'porch.html', calcKey: 'porch', question: 'How much does a screened porch cost in Upstate SC?' },
  { file: 'additions.html', calcKey: 'additions', question: 'How much does a room addition cost in Upstate SC?' },
  { file: 'kitchen-remodel.html', calcKey: 'kitchen', question: 'How much does a kitchen remodel cost in Greenville & Laurens County?' },
  { file: 'bath-remodel.html', calcKey: 'bath', question: 'How much does a bathroom remodel cost in Greenville & Laurens County?' },
  { file: 'whole-home-remodel.html', calcKey: 'wholeHome', question: 'How much does a whole-home remodel cost in Greenville & Laurens County?' },
  { file: 'basement-finishing.html', calcKey: 'basement', question: 'How much does basement finishing cost in Upstate SC?' },
  { file: 'covered-patios.html', calcKey: 'coveredPatios', question: 'How much does a covered patio cost in Upstate SC?' },
]

for (const page of STANDARD_PAGES) {
  const cfg = CALCULATOR_PAGES[page.calcKey]
  const serviceKey = cfg.serviceKey
  const service = PRICING_CONFIG.services[serviceKey]
  const sqft = extractSqftFromIntro(cfg.intro) ?? defaultSquareFootage(serviceKey)

  const rows = Object.entries(service.baseRates)
    .map(([rateId, rate]) =>
      tierRow([rate.label, tierPerSqftString(serviceKey, rateId), projectCostString(serviceKey, rateId, sqft), rate.description])
    )
    .join('\n')

  const html = tableSection({
    question: page.question,
    answer: cfg.intro,
    captionLabel: `${cfg.title} pricing tiers — ${cfg.marketArea}`,
    columns: ['Tier', 'Price Range', `Typical at ${sqft} sq ft`, "What's Included"],
    rows,
  })

  TABLES['calculator/' + page.file] = html
}

// --- estimate.html: summary across the 4 core project types ------------
{
  const CORE = [
    { calcKey: 'decks', label: 'Decks', url: '/calculator/decks' },
    { calcKey: 'garages', label: 'Garages', url: '/calculator/garages' },
    { calcKey: 'porch', label: 'Screened Porches', url: '/calculator/porch' },
    { calcKey: 'additions', label: 'Room Additions', url: '/calculator/additions' },
  ]
  const rows = CORE.map(({ calcKey, label, url }) => {
    const cfg = CALCULATOR_PAGES[calcKey]
    // cfg.description sometimes embeds its own hand-typed $/sq ft figure,
    // which can go stale against the live servicePerSqftString() computed
    // just above it in the same row — strip any sentence with a dollar
    // sign so this cell never cites a second, conflicting number.
    const details = cfg.description
      .split(/(?<=\. )/)
      .filter((sentence) => !sentence.includes('$'))
      .join('')
      .trim()
    return tierRow([label, servicePerSqftString(cfg.serviceKey), details])
  }).join('\n')

  const html = tableSection({
    question: 'How much do home improvement projects cost in Upstate SC?',
    answer:
      'Every project we build is priced from the same transparent formula: base cost per square foot for your project type, adjusted for material, complexity, and site conditions, plus a fixed 20% overhead & profit. Typical ranges below cover the most common scopes we build in Simpsonville, Fountain Inn, Gray Court, and Greenville County.',
    captionLabel: 'Typical project costs by type — Upstate SC',
    columns: ['Project Type', 'Typical Cost Range', 'Details'],
    rows,
  })

  TABLES['calculator/estimate.html'] = html
}

// --- ada-bath-shower.html: itemized, not sqft-based ---------------------
{
  const location = PRICING_CONFIG.locationFactors.fountainInnArea
  const defaultState = { finish: 'fiberglass', grabBars: true, thermostatic: false }
  const included = []
  let directLow = 0
  let directHigh = 0

  for (const item of ADA_BATH_SHOWER_ITEMS) {
    let low = item.low
    let high = item.high
    let isIncluded = Boolean(item.always)
    if (item.group === 'finish') isIncluded = defaultState.finish === item.groupValue
    if (item.optional) isIncluded = item.id === 'grabBars' ? defaultState.grabBars : isIncluded
    if (item.hasThermostatic) {
      isIncluded = true
      low = item.low
      high = item.low
    }
    if (isIncluded) {
      directLow += low
      directHigh += high
      included.push({ ...item, low, high })
    }
  }

  const finalLow = directLow * location.factor * (1 + PRICING_CONFIG.defaultOverheadAndProfit)
  const finalHigh = directHigh * location.factor * (1 + PRICING_CONFIG.defaultOverheadAndProfit)

  const rows = included
    .map((item) =>
      tierRow([
        item.label,
        item.low === item.high ? formatCurrency(item.low) : `${formatCurrency(item.low)}–${formatCurrency(item.high)}`,
        item.note ?? '',
      ])
    )
    .join('\n')

  const html = tableSection({
    question: 'How much does an ADA bath-to-shower conversion cost?',
    answer: `A standard fiberglass ADA roll-in shower conversion with grab bars typically runs ${formatCurrency(finalLow)}–${formatCurrency(finalHigh)} in the Fountain Inn / Greenville County area, including demo, plumbing, waterproofing, the shower base, and labor. Tile surrounds and a thermostatic valve cost more — see the itemized breakdown below.`,
    captionLabel: 'ADA bath-to-shower conversion costs — fiberglass finish, standard tub, Fountain Inn area pricing',
    columns: ['Item', 'Typical Cost', 'Note'],
    rows,
  })

  TABLES['calculator/ada-bath-shower.html'] = html
}


/**
 * Pulls the square footage out of a calculator intro's own worked example
 * (e.g. "a 12×16 deck (192 sqft) runs $7,400–$8,950") so the table's
 * "Typical at N sq ft" column always matches the size already cited in the
 * prose right above it, instead of introducing a second, unrelated size
 * reference on the same page.
 */
function extractSqftFromIntro(intro) {
  const match = intro.match(/(\d[\d,]*)\s*sq ?ft/i)
  return match ? Number(match[1].replace(/,/g, '')) : null
}


/**
 * The pricing table for one calculator page.
 *
 * Throws on an unknown page rather than returning nothing: a calculator whose
 * table quietly vanished would still render, still validate, and simply stop
 * showing prices to crawlers — the exact failure this module exists to prevent.
 */
export function calculatorTable(relFile) {
  const html = TABLES[relFile]
  if (!html) {
    throw new Error(`${relFile}: no pricing table is defined for this page in src/build/calculator-tables.mjs`)
  }
  return html
}

/** The pages this module builds a table for, for the renderer to assert against. */
export function tabledPages() {
  return Object.keys(TABLES).sort()
}
