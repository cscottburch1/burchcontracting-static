/**
 * Injects a byline + Article/Person JSON-LD into the hand-authored pages
 * that generate-services.mjs / generate-geo-aeo.mjs don't own: index.html,
 * about.html, contact.html, projects.html, and all 11 calculator/*.html
 * pages. Those already got Article schema and a "Written by" byline
 * because they're built by the generators — see this repo's
 * CITABILITY-FACTS-NEEDED.md Phase 1 notes for the full before/after.
 *
 * Same pattern as generate-calculator-tables.mjs: content between marker
 * comments is fully owned by this script and safe to re-run; everything
 * else in these files is untouched. Two separate marker pairs — one in
 * <head> for the JSON-LD (added as a *second* <script type="application/
 * ld+json"> tag rather than merged into the existing one, since these files'
 * existing schema is a hand-typed JSON string, not a JS object this script
 * can safely parse-and-rewrite) and one in <main> for the visible byline.
 *
 * Headline/description/canonical are read from each file's own <h1>,
 * <meta name="description">, and <link rel="canonical"> rather than
 * hand-typed here, so this can't drift from what's actually on the page.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCOTT_PERSON_SCHEMA, ORGANIZATION_SCHEMA, articleSchema } from '../src/data/site-schema.js'
import { CONTENT_DATES } from '../src/data/content-dates.js'
import { SERVICE_FAQS } from '../src/data/service-faqs.js'
import { GLOBAL_FAQS, faqPageSchema } from '../src/data/geo-aeo.js'
import { SERVICES, SITE } from '../src/data/services.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const FALLBACK_DATES = { datePublished: '2026-07-19', dateModified: '2026-07-19' }

const FILES = [
  'index.html',
  'about.html',
  'contact.html',
  'projects.html',
  'calculator/ada-bath-shower.html',
  'calculator/additions.html',
  'calculator/basement-finishing.html',
  'calculator/bath-remodel.html',
  'calculator/covered-patios.html',
  'calculator/decks.html',
  'calculator/estimate.html',
  'calculator/garages.html',
  'calculator/kitchen-remodel.html',
  'calculator/porch.html',
  'calculator/whole-home-remodel.html',
]

// services.html already has its own hand-placed "Written by" byline further
// down the page (not right after the H1 like the other 15) — inserting a
// second one near the top would duplicate it. This page gets the Article
// JSON-LD only; Phase 4 rebuilds services.html's layout anyway, at which
// point its byline placement gets revisited along with everything else.
const SCHEMA_ONLY_FILES = ['services.html']

// Maps each calculator to the SERVICE_FAQS (service-faqs.js) entry whose
// Q&A content applies to it. Index 0 of each array is always the cost
// question — already covered by the calculator's own AEO-table H2 (see
// generate-calculator-tables.mjs), so it's skipped here to avoid a
// duplicate heading; indices 1-3 (timeline, comparison/material, permit —
// see service-faqs.js's own ordering) get promoted instead. This is the
// same "answer-block breadth" gap called out in Phase 0 recon: calculators
// already had one strong Q&A pair and nothing else.
// Hub-and-spoke (Phase 7): prominent link from each calculator back to its
// parent service page. Built from SERVICES[].calculator /.calculators
// directly rather than hand-typed, so it can't drift if a service's
// calculator assignment ever changes. estimate.html has no single parent
// (it's the all-in-one calculator) — links to /services.html instead.
const CALCULATOR_PARENT_SERVICE_URL = {
  ...Object.fromEntries(
    SERVICES.flatMap((s) => {
      if (s.calculator) return [[`calculator/${s.calculator}.html`, `/${s.slug}`]]
      if (s.calculators) return s.calculators.map((c) => [`calculator/${c.id}.html`, `/${s.slug}`])
      return []
    })
  ),
  'calculator/estimate.html': '/services.html',
}

const CALCULATOR_FAQ_SOURCE = {
  'calculator/decks.html': 'decks',
  'calculator/garages.html': 'garages',
  'calculator/porch.html': 'screened-porches',
  'calculator/additions.html': 'additions',
  'calculator/covered-patios.html': 'covered-patios',
  'calculator/basement-finishing.html': 'basement-finishing',
  'calculator/ada-bath-shower.html': 'ada-bath-to-shower',
  // The three remodeling calculators share one SERVICE_FAQS entry
  // ('remodeling') — it isn't kitchen/bath/whole-home-specific, but every
  // sentence in it is still accurate for all three, so this is real reuse,
  // not padding.
  'calculator/kitchen-remodel.html': 'remodeling',
  'calculator/bath-remodel.html': 'remodeling',
  'calculator/whole-home-remodel.html': 'remodeling',
}

// index.html and services.html already have their own hand-typed FAQ
// accordions (not driven by service-faqs.js/geo-aeo.js) — for these, the
// promotion pulls the real <details> block straight out of the page's own
// accordion (by matching its visible question text) rather than reaching
// for a second copy of the same content from a data file. The block is
// removed from the accordion and re-rendered as an H2, so nothing ends up
// duplicated on the page.
const PROMOTE_FROM_OWN_ACCORDION = {
  'index.html': [
    'Is Burch Contracting a licensed general contractor?',
    'What areas does Burch Contracting serve?',
    'How much does a deck cost in Upstate SC?',
  ],
  'services.html': [
    'How do I get a free consultation and ballpark estimate?',
    'Is Burch Contracting licensed and insured?',
  ],
}

// Phase 6: FAQPage schema for calculators, built from whatever H2+<p>
// question/answer pairs are already visibly rendered on the page (its own
// AEO-table question plus the 3 promoted from service-faqs.js in Phase 2)
// — not a second, separately-typed copy. This guarantees the schema can
// never say something the visible page doesn't, which is the actual
// Google requirement FAQPage schema has to satisfy.
function extractH2QAPairs(html) {
  const pairs = []
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/g
  let m
  while ((m = re.exec(html))) {
    pairs.push({ question: stripTags(m[1]), answer: stripTags(m[2]) })
  }
  return pairs
}

function promoteFromAccordion(html, questionText) {
  const idx = html.indexOf(`<span>${questionText}</span>`)
  if (idx === -1) return { html, promoted: null }
  const detailsStart = html.lastIndexOf('<details', idx)
  const detailsEndTagIdx = html.indexOf('</details>', idx)
  if (detailsStart === -1 || detailsEndTagIdx === -1) return { html, promoted: null }
  const detailsEnd = detailsEndTagIdx + '</details>'.length
  const block = html.slice(detailsStart, detailsEnd)
  const answerMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/)
  const answer = answerMatch ? answerMatch[1] : ''
  const newHtml = html.slice(0, detailsStart) + html.slice(detailsEnd)
  return { html: newHtml, promoted: { question: questionText, answer } }
}

// estimate.html covers all project types at once, so no single
// SERVICE_FAQS entry fits — these 3 are pulled from GLOBAL_FAQS by index
// (licensing, permits/inspections, project types — see geo-aeo.js) since
// none of them duplicate the calculator's own "How much do home
// improvement projects cost" H2.
const ESTIMATE_FAQ_INDICES = [0, 9, 4]

// about.html / contact.html have no existing FAQ accordion to promote from
// (unlike index.html/services.html) and aren't calculators, so these pull
// straight from GLOBAL_FAQS by index, picking whichever entries fit the
// page's purpose and, where possible, haven't already been promoted
// elsewhere (0 licensing + 1 service-area on index.html; 0 licensing + 9
// permits + 4 project-types on estimate.html) to keep sitewide repetition
// down. Some overlap is fine — a company's own licensing/rating facts
// legitimately belong on more than one page — this just avoids piling all
// the reuse onto one pair of facts.
const ABOUT_FAQ_INDICES = [11, 3] // years in business; works the job site personally
const CONTACT_FAQ_INDICES = [2, 10, 9, 1] // free consultation; BBB/Google rating; permits; service area

// projects.html gets a light touch only (2, not 4) — it's slated for a
// full rebuild in Phase 4 as a real case-study index, so writing four
// permanent question headings into a page whose structure is about to be
// replaced would be wasted, and is called out as an intentional partial
// exception in the Phase 2 report rather than silently under-delivered.
const PROJECTS_FAQ_INDICES = [2, 1] // free consultation; service area

const SCHEMA_START = '    <!-- TRUST-LAYER-SCHEMA:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const SCHEMA_END = '    <!-- TRUST-LAYER-SCHEMA:END -->'
const BYLINE_START = '      <!-- TRUST-LAYER-BYLINE:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const BYLINE_END = '      <!-- TRUST-LAYER-BYLINE:END -->'
const ANSWERS_START = '    <!-- TRUST-LAYER-ANSWERS:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const ANSWERS_END = '    <!-- TRUST-LAYER-ANSWERS:END -->'
const TABLE_START = '    <!-- TRUST-LAYER-TABLE:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const TABLE_END = '    <!-- TRUST-LAYER-TABLE:END -->'
const CASE_STUDIES_START = '    <!-- TRUST-LAYER-CASE-STUDIES:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const CASE_STUDIES_END = '    <!-- TRUST-LAYER-CASE-STUDIES:END -->'
const METHODOLOGY_START = '    <!-- TRUST-LAYER-METHODOLOGY:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const METHODOLOGY_END = '    <!-- TRUST-LAYER-METHODOLOGY:END -->'
const PARENT_LINK_START = '    <!-- TRUST-LAYER-PARENT-LINK:START (generated by scripts/generate-trust-layer.mjs — do not hand-edit between markers) -->'
const PARENT_LINK_END = '    <!-- TRUST-LAYER-PARENT-LINK:END -->'
const allFactsNeeded = []
let methodologyFactLogged = false

// Original Phase 1 spec asked for this box on every calculator, immediately
// below the price range — missed in the actual Phase 1 pass, added here.
// The one real fact this needs (what real-world data backs the numbers —
// Scott's own invoices? supplier quotes? both?) is asked ONCE, not once per
// calculator, since it's the same underlying question for all 11.
function parentServiceLinkHtml(serviceUrl) {
  const label = serviceUrl === '/services.html' ? 'See All Services & Pricing' : 'View Full Service Details'
  return `      <section class="bg-blue-50 border-b border-blue-100 py-4 print:hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="${esc(serviceUrl)}" class="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold text-sm">&larr; ${esc(label)}</a>
        </div>
      </section>`
}

function methodologyBoxHtml(dates) {
  if (!methodologyFactLogged) {
    allFactsNeeded.push({ project: 'All calculator pages (one answer covers all 11)', field: 'What real-world data backs the calculator price ranges — Burch Contracting\'s own completed-project invoices (which years?), supplier/material quotes, permit costs by county, or some mix?' })
    methodologyFactLogged = true
  }
  return `      <section class="bg-blue-50 border-y border-blue-100 py-8 print:hidden">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white border border-blue-200 rounded-xl p-6">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-2">How We Price This</p>
            <p class="text-slate-600 text-sm leading-relaxed">These ranges are computed from Burch Contracting's own pricing formula (base cost per square foot, adjusted for material, complexity, and site conditions, plus a fixed 20% overhead &amp; profit — see <a href="/services.html" class="text-blue-700 hover:text-blue-800 underline">services.html</a> for the full comparison). <span class="text-slate-400 italic">The real-world data source behind the base rates themselves is not yet published.</span> Updated <time datetime="${dates.dateModified}">${dates.dateModified}</time> by C. Scott Burch.</p>
          </div>
        </div>
      </section>`
}

// Phase 3 structure bar: every page needs >=1 real <table>. index.html and
// services.html get a "typical cost" table built from SERVICES[].stats
// (already computed via pricing-sync.js per PRICING.md — nothing invented
// here); about.html and contact.html get a credentials/contact table from
// SITE. projects.html is deliberately skipped — same Phase 4 rebuild
// deferral as its Phase 2 answer-block treatment.
function costOverviewTableHtml(heading) {
  const rows = SERVICES.filter((s) => s.stats?.costRange && s.stats.costRange !== 'Custom Quote')
    .map(
      (s) => `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">${esc(s.title)}</th>
                  <td class="px-4 py-3 text-blue-700 font-semibold whitespace-nowrap">${esc(s.stats.costRange)}</td>
                  <td class="px-4 py-3 text-sm">${s.calculator ? `<a href="/calculator/${esc(s.calculator)}.html" class="text-blue-700 hover:text-blue-800 underline">Calculate your cost &rarr;</a>` : `<a href="/${esc(s.slug)}" class="text-blue-700 hover:text-blue-800 underline">Learn more &rarr;</a>`}</td>
                </tr>`
    )
    .join('\n')
  return `      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">${esc(heading)}</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Typical project cost ranges — Upstate SC</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Service</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Typical Cost Range</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900"></th>
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

function credentialsTableHtml() {
  return `      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Credentials at a Glance</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Burch Contracting licensing and standing</caption>
              <tbody>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">SC General Contractor License</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">#${esc(SITE.license)}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">NC General Contractor License (Limited)</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">#${esc(SITE.licenseNC)}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">In business since</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(SITE.established)}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">BBB Rating</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(SITE.bbb)}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Google Rating</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(SITE.rating)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>`
}

function contactTableHtml() {
  return `      <section class="bg-white py-12 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Ways to Reach Us</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Burch Contracting contact information</caption>
              <tbody>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Phone</th>
                  <td class="px-4 py-3 text-sm"><a href="tel:${esc(SITE.phoneLink)}" class="text-blue-700 hover:text-blue-800 underline">${esc(SITE.phone)}</a></td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Email</th>
                  <td class="px-4 py-3 text-sm"><a href="mailto:${esc(SITE.email)}" class="text-blue-700 hover:text-blue-800 underline">${esc(SITE.email)}</a></td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Office</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(SITE.address)}, ${esc(SITE.city)}, ${esc(SITE.state)} ${esc(SITE.zip)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>`
}

// "Choose this if" one-liners: editorial framing, not factual claims beyond
// what each service's own intro/description (services.js) already says —
// no new capability or number asserted here.
const CHOOSE_IF = {
  'outdoor-living/decks': 'you want outdoor entertaining space and can choose your budget tier (PT lumber to premium composite).',
  'outdoor-living/screened-porches': 'you want bug-free outdoor living, from a basic screened enclosure to a climate-controlled room.',
  'outdoor-living/covered-patios': 'you want an open-air, roofed outdoor space rather than a fully screened-in one.',
  garages: 'you need vehicle storage, workshop space, or a garage apartment for rental/guest use.',
  additions: 'you need more square footage — a bedroom, suite, or multi-generational space — without moving.',
  'adu-builder': 'you want a separate income-producing or in-law living space on your existing lot.',
  remodeling: 'your kitchen, bath, basement, or whole home needs updating rather than expanding.',
  'commercial-upfits': 'you are building out a leased commercial space for your business.',
  'commercial-roofing': 'you need commercial roof installation, repair, or a maintenance/inspection agreement.',
  'basement-finishing': 'you have unfinished basement square footage you want converted to living space.',
  'insurance-restoration': 'you have storm or water damage and need documentation plus repairs.',
  'ada-compliance': 'you need ramps, doorway widening, or other ADA modifications for a home or business.',
  'ada-bath-to-shower': 'you specifically need a tub converted to a curbless, accessible roll-in shower.',
  handyman: 'you need one or a few small tasks done, not a full construction project.',
}

// Permit-required column: only asserts "Yes" where a SERVICE_FAQS or
// GLOBAL_FAQS answer on the site already says so explicitly (see
// service-faqs.js) — everything else gets an honest "Case-by-case" rather
// than a guessed yes/no, per the ground rule against inventing facts.
const PERMIT_REQUIRED = {
  'outdoor-living/decks': 'Yes',
  garages: 'Yes',
  additions: 'Yes',
  'adu-builder': 'Depends on zoning',
  'commercial-upfits': 'Yes',
  'ada-compliance': 'Case-by-case',
}

function servicesComparisonTableHtml() {
  const rows = SERVICES.map((s) => {
    const permit = PERMIT_REQUIRED[s.slug] ?? 'Case-by-case'
    const chooseIf = CHOOSE_IF[s.slug] ?? ''
    const linkHtml = s.calculator
      ? `<a href="/calculator/${esc(s.calculator)}.html" class="text-blue-700 hover:text-blue-800 underline">Calculator</a> &middot; <a href="/${esc(s.slug)}" class="text-blue-700 hover:text-blue-800 underline">Details</a>`
      : `<a href="/${esc(s.slug)}" class="text-blue-700 hover:text-blue-800 underline">Details</a>`
    return `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left align-top whitespace-nowrap">${esc(s.title)}</th>
                  <td class="px-4 py-4 text-blue-700 font-semibold align-top whitespace-nowrap">${esc(s.stats.costRange)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top whitespace-nowrap">${esc(s.stats.timeline)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top whitespace-nowrap">${esc(permit)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top">Choose this if ${esc(chooseIf)}</td>
                  <td class="px-4 py-4 text-sm align-top whitespace-nowrap">${linkHtml}</td>
                </tr>`
  }).join('\n')

  return `      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Compare All Services</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Every Burch Contracting service — cost, timeline, and permit status at a glance</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Service</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Cost Range</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Timeline</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Permit Required</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Choose This If</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Links</th>
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

// Fixes a real, pre-existing bug: every card in services.html's "What We
// Build" grid hardcoded "Typical Budget: Custom Quote", even for services
// (decks, garages, additions, ...) that have had a real computed cost
// range in SERVICES[].stats.costRange all along. Matches each card by its
// href (SERVICES[].slug), so the 3 services where "Custom Quote" actually
// is the right answer (commercial-roofing, insurance-restoration,
// ada-compliance — all custom-quoted, no fixed range) are left unchanged.
function fixServiceGridBudgets(html) {
  let updated = html
  for (const s of SERVICES) {
    // The same href (e.g. "/outdoor-living/decks") also appears in the
    // header's nav dropdown and mobile menu, both of which come before the
    // "What We Build" grid in document order — indexOf() alone would find
    // one of those first and never reach the actual card. Scan every
    // occurrence of the href and fix the one whose <a>...</a> block
    // actually contains the placeholder text.
    const hrefAttr = `href="/${s.slug}"`
    let searchFrom = 0
    while (true) {
      const cardStart = updated.indexOf(hrefAttr, searchFrom)
      if (cardStart === -1) break
      const cardEnd = updated.indexOf('</a>', cardStart)
      if (cardEnd === -1) break
      const card = updated.slice(cardStart, cardEnd)
      if (card.includes('Typical Budget: Custom Quote')) {
        const fixedCard = card.replace('Typical Budget: Custom Quote', `Typical Budget: ${esc(s.stats.costRange)}`)
        updated = updated.slice(0, cardStart) + fixedCard + updated.slice(cardEnd)
        break
      }
      searchFrom = cardEnd + 4
    }
  }
  return updated
}

// projects.html already has 14 real project cards (real photos, real
// cities on 7 of them) — Phase 4's case-study template doesn't need
// invented projects, it needs the real ones enhanced with the fields the
// audit specifically wants (size, materials, duration, cost band, a
// problem solved) that the cards don't currently carry. Only the 7 cards
// with a specific city (not "Upstate SC"/"South Carolina" placeholders)
// are promoted to case studies here — the other 7 stay as photo cards
// only, since a generic city can't anchor a real case study. Keyed by
// "title|city" (not title alone) since two cards share the title
// "Detached Two-Car Garage" with different cities.
//
// Materials pulled straight from each card's own existing description
// where it already states a material (see the console.warn cross-check
// below) — never invented. null means the description doesn't say, so
// it's FACT-NEEDED like the rest.
const CASE_STUDY_MATERIALS = {
  'Custom Multi-Level Deck|Greenville, SC': 'Wood decking',
  'Screened Porch Addition|Fountain Inn, SC': null,
  'Detached Two-Car Garage|Simpsonville, SC': 'Gray siding, white trim',
  'Detached Two-Car Garage|Greenville County, SC': null,
  'Room Addition|Fountain Inn, SC': null,
  'Bath-to-Shower Conversion|Woodruff, SC': 'Tile walk-in shower surround',
  'Walk-In Shower Remodel|Woodruff, SC': 'Glass enclosure, wall tile',
}

function buildProjectsCaseStudySection(html) {
  const articles = [...html.matchAll(/<article data-project-category="([^"]*)"[\s\S]*?<\/article>/g)]
  const cases = []
  for (const m of articles) {
    const block = m[0]
    const city = block.match(/uppercase tracking-wide mb-1">([^<]*)</)?.[1]
    const title = block.match(/<h2[^>]*>([^<]*)</)?.[1]
    const description = block.match(/leading-relaxed mb-4">([^<]*)</)?.[1]
    if (!city || !title || city === 'Upstate SC' || city === 'South Carolina') continue
    const key = `${title}|${city}`
    if (!(key in CASE_STUDY_MATERIALS)) continue
    cases.push({ title, city, description, materials: CASE_STUDY_MATERIALS[key] })
  }

  const factsNeeded = []
  const cardsHtml = cases
    .map((c) => {
      const fields = []
      const addField = (label, value, factLabel) => {
        if (value) {
          fields.push(`                <div><dt class="text-slate-500 text-xs uppercase tracking-wide">${esc(label)}</dt><dd class="text-slate-900 font-medium">${esc(value)}</dd></div>`)
        } else {
          fields.push(`                <div><dt class="text-slate-500 text-xs uppercase tracking-wide">${esc(label)}</dt><dd class="text-slate-400 italic">Not yet published</dd></div>`)
          factsNeeded.push({ project: `${c.title} — ${c.city}`, field: factLabel })
        }
      }
      addField('Location', c.city, null)
      addField('Scope', c.title, null)
      addField('Materials', c.materials, 'Materials used (if not already implied by the description)')
      addField('Size', null, 'Project size in sq ft')
      addField('Duration', null, 'How long the project took, start to finish')
      addField('Cost Band', null, 'Final cost band (a range is fine, doesn\'t need to be exact)')
      addField('Challenge Solved', null, 'One problem encountered on this job and how it was solved')

      return `            <div class="bg-white border border-slate-200 rounded-xl p-6">
              <h3 class="font-bold text-slate-900 text-lg mb-1">${esc(c.title)}</h3>
              <p class="text-blue-700 text-sm font-semibold mb-4">${esc(c.city)}</p>
              <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
${fields.join('\n')}
              </dl>
            </div>`
    })
    .join('\n')

  const factsCommentBlock = factsNeeded
    .map((f) => `      <!-- FACT-NEEDED: ${f.field} | Needed to complete the "${f.project}" case study for AI-citability project data | projects.html case studies -->`)
    .join('\n')

  const sectionHtml = `      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-3">Project Case Studies</h2>
          <p class="text-slate-600 mb-8 max-w-2xl">Real completed projects with the details AI search and homeowners both look for. Fields marked "Not yet published" are being finalized with the project owner.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${cardsHtml}
          </div>
        </div>
      </section>
${factsCommentBlock}`

  return { sectionHtml, factsNeeded }
}

const EXTRA_TABLE_BUILDERS = {
  'index.html': () => costOverviewTableHtml('What Does Your Project Cost?'),
  'services.html': () => servicesComparisonTableHtml(),
  'about.html': () => credentialsTableHtml(),
  'contact.html': () => contactTableHtml(),
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceOrInsertAfter(html, startMarker, endMarker, block, anchorRegex, anchorLabel) {
  const full = `${startMarker}\n${block}\n${endMarker}`
  if (html.includes(startMarker)) {
    const re = new RegExp(`${escRe(startMarker)}[\\s\\S]*?${escRe(endMarker)}`)
    return html.replace(re, full)
  }
  const m = html.match(anchorRegex)
  if (!m) throw new Error(`could not find anchor (${anchorLabel}) to insert after`)
  const insertAt = m.index + m[0].length
  return html.slice(0, insertAt) + '\n' + full + html.slice(insertAt)
}

let patched = 0
for (const relFile of [...FILES, ...SCHEMA_ONLY_FILES]) {
  const filePath = path.join(root, relFile)
  let html = fs.readFileSync(filePath, 'utf8')

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/i)
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/i)
  if (!h1Match || !descMatch || !canonicalMatch) {
    throw new Error(`${relFile}: missing h1, meta description, or canonical link — cannot build Article schema`)
  }
  const headline = stripTags(h1Match[1])
  const description = descMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  const canonical = canonicalMatch[1]

  const dates = CONTENT_DATES[relFile] ?? FALLBACK_DATES

  const article = articleSchema({
    headline,
    description,
    url: canonical,
    datePublished: dates.datePublished,
    dateModified: dates.dateModified,
  })

  // Phase 6: calculators get FAQPage schema. Deliberately NOT built from
  // all 4 visible H2 blocks — 3 of those 4 (Phase 2's promoted timeline/
  // material/permit questions) are the same SERVICE_FAQS entries already
  // promoted onto that calculator's parent service page, so including them
  // here too would put the identical Q&A in two pages' FAQPage schema,
  // which Phase 6's own ground rules flag as damaging to uniqueness. Only
  // the calculator's own AEO-table question (extractH2QAPairs()[0], unique
  // per calculator, authored in generate-calculator-tables.mjs) plus 2 new
  // methodology questions — genuinely calculator-specific, naming the
  // service and reusing each page's own already-computed numbers — go in
  // the schema. The 3 visible-but-schema-excluded blocks stay on the page
  // exactly as Phase 2 left them; this only changes what's in the JSON-LD.
  const graph = [SCOTT_PERSON_SCHEMA, article]
  if (relFile.startsWith('calculator/')) {
    const qaPairs = extractH2QAPairs(html)
    const ownQuestion = qaPairs[0]
    const serviceName = headline.replace(/\s*Cost Calculator\s*$/i, '').trim() || 'this project'
    const methodologyFaqs = ownQuestion
      ? [
          ownQuestion,
          {
            question: `Is this ${serviceName} cost estimate accurate?`,
            answer: `This is a planning estimate based on typical Upstate SC ${serviceName.toLowerCase()} costs, size, and the tier you select — actual pricing depends on your site conditions and finish selections. Every Burch Contracting quote includes a transparent 20% overhead and profit, the same formula used sitewide, with no hidden markup.`,
          },
          {
            question: `What would push my ${serviceName.toLowerCase()} project to the high end of this range?`,
            answer: `Site access, structural complexity, premium materials, and custom features push a project toward the high end of the range shown above; a straightforward scope in standard materials lands toward the low end. Scott confirms exactly where your project falls during a free consultation.`,
          },
        ]
      : []
    if (methodologyFaqs.length) graph.push(faqPageSchema(methodologyFaqs))
  }

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  })
  const schemaBlock = `    <script type="application/ld+json">${schemaJson}</script>`

  // Anchor: right after the page's existing (first) JSON-LD script tag.
  html = replaceOrInsertAfter(
    html,
    SCHEMA_START,
    SCHEMA_END,
    schemaBlock,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    'existing JSON-LD script tag'
  )

  if (relFile === 'services.html') html = fixServiceGridBudgets(html)

  const isSchemaOnly = SCHEMA_ONLY_FILES.includes(relFile)

  const bylineBlock = `      <section class="bg-white py-8 border-b border-slate-100 print:hidden">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside class="bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name"><a href="/about.html" class="hover:text-blue-700 transition-colors">C. Scott Burch</a></h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #CLG118679 | NC Licensed (Limited) #107292 | 35+ years serving Upstate SC.</p>
            <p class="text-slate-500 text-xs mt-3">Published: <time datetime="${dates.datePublished}">${dates.datePublished}</time> &middot; Last reviewed: <time datetime="${dates.dateModified}">${dates.dateModified}</time></p>
          </aside>
        </div>
      </section>`

  // Anchor: right after the first </section> inside <main> — every one of
  // these 16 pages opens <main> with a hero section, so this places the
  // byline (and, on schema-only services.html, the answer block) directly
  // beneath the hero without needing a page-specific anchor.
  const mainMatch = html.match(/<main[^>]*>/)
  if (!mainMatch) throw new Error(`${relFile}: no <main> tag found`)
  const afterMain = html.slice(mainMatch.index + mainMatch[0].length)
  const sectionCloseInMain = afterMain.match(/<\/section>/)
  if (!sectionCloseInMain) throw new Error(`${relFile}: no </section> found inside <main>`)
  const absoluteAnchorEnd = mainMatch.index + mainMatch[0].length + sectionCloseInMain.index + sectionCloseInMain[0].length

  if (!isSchemaOnly) {
    if (html.includes(BYLINE_START)) {
      const re = new RegExp(`${escRe(BYLINE_START)}[\\s\\S]*?${escRe(BYLINE_END)}`)
      html = html.replace(re, `${BYLINE_START}\n${bylineBlock}\n${BYLINE_END}`)
    } else {
      html = html.slice(0, absoluteAnchorEnd) + '\n' + `${BYLINE_START}\n${bylineBlock}\n${BYLINE_END}` + html.slice(absoluteAnchorEnd)
    }
  }

  // Recomputed rather than reused: absoluteAnchorEnd above was measured
  // before the byline insertion, which shifts every offset after it. For
  // pages that just got a byline, anchor the answer block after that
  // instead — otherwise (services.html, schema-only) absoluteAnchorEnd is
  // still accurate since nothing before it changed.
  const afterHeroAnchor = isSchemaOnly ? absoluteAnchorEnd : html.indexOf(BYLINE_END) + BYLINE_END.length

  // Calculators: promote 3 more real Q&A pairs (already published in
  // service-faqs.js / geo-aeo.js — nothing invented here) into visible H2
  // question headings, so every calculator has 4+ question-form headings
  // total (its own AEO-table H2 plus these 3), not just the one.
  //
  // index.html / services.html: pull real <details> Q&A blocks straight out
  // of the page's own existing accordion (see promoteFromAccordion above)
  // instead of reaching for a data-file copy, so nothing ends up duplicated
  // on the page — the accordion entry is removed as it's promoted.
  const faqSourceId = CALCULATOR_FAQ_SOURCE[relFile]
  // alreadyEscaped: true for text pulled out of existing HTML (its entities
  // are already encoded — re-escaping would double-encode, exactly what
  // check-build.mjs's double-encoded-ampersand check exists to catch);
  // false for raw strings straight from a .js data file, which still need
  // esc().
  // Lookup-sourced pages (calculators, estimate, about, contact, projects)
  // always recompute from their data-file source, even if ANSWERS_START is
  // already present — they're pure lookups, so re-running safely picks up
  // an edit to service-faqs.js/geo-aeo.js instead of silently going stale.
  // Only PROMOTE_FROM_OWN_ACCORDION is gated on "already present": it's
  // destructive (removes the source <details> from the accordion as it
  // promotes it), so re-running it after the accordion entry is already
  // gone would just fail to find it.
  let extraFaqs = []
  const answersAlreadyPresent = html.includes(ANSWERS_START)
  if (faqSourceId) {
    extraFaqs = (SERVICE_FAQS[faqSourceId] ?? []).slice(1, 4).map((f) => ({ ...f, alreadyEscaped: false }))
  } else if (relFile === 'calculator/estimate.html') {
    extraFaqs = ESTIMATE_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (relFile === 'about.html') {
    extraFaqs = ABOUT_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (relFile === 'contact.html') {
    extraFaqs = CONTACT_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (relFile === 'projects.html') {
    extraFaqs = PROJECTS_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (answersAlreadyPresent) {
    // Idempotent re-run of an accordion-promotion page: its source
    // <details> entries were already removed on the first run — nothing to
    // recompute.
  } else if (PROMOTE_FROM_OWN_ACCORDION[relFile]) {
    for (const q of PROMOTE_FROM_OWN_ACCORDION[relFile]) {
      const result = promoteFromAccordion(html, q)
      html = result.html
      if (result.promoted) extraFaqs.push({ ...result.promoted, alreadyEscaped: true })
      else console.warn(`  ! ${relFile}: could not find accordion entry "${q}" to promote — skipped`)
    }
  }

  if (relFile.startsWith('calculator/')) {
    const aeoEndMarker = '    <!-- AEO-PRICING-TABLE:END -->'
    const methodologyBlock = methodologyBoxHtml(dates)
    if (html.includes(METHODOLOGY_START)) {
      const re = new RegExp(`${escRe(METHODOLOGY_START)}[\\s\\S]*?${escRe(METHODOLOGY_END)}`)
      html = html.replace(re, `${METHODOLOGY_START}\n${methodologyBlock}\n${METHODOLOGY_END}`)
    } else if (html.includes(aeoEndMarker)) {
      html = html.replace(aeoEndMarker, `${aeoEndMarker}\n${METHODOLOGY_START}\n${methodologyBlock}\n${METHODOLOGY_END}`)
    } else {
      throw new Error(`${relFile}: no AEO-PRICING-TABLE end marker found for methodology box insertion`)
    }
  }

  if (extraFaqs.length) {
    const answerBlock = `      <section class="bg-white py-16 lg:py-20 border-t border-slate-100 print:hidden">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
${extraFaqs
      .map(
        (faq) => `          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">${faq.alreadyEscaped ? faq.question : esc(faq.question)}</h2>
            <p class="text-slate-600 leading-relaxed">${faq.alreadyEscaped ? faq.answer : esc(faq.answer)}</p>
          </div>`
      )
      .join('\n')}
        </div>
      </section>`

    const aeoEndMarker = '    <!-- AEO-PRICING-TABLE:END -->'
    if (html.includes(ANSWERS_START)) {
      const re = new RegExp(`${escRe(ANSWERS_START)}[\\s\\S]*?${escRe(ANSWERS_END)}`)
      html = html.replace(re, `${ANSWERS_START}\n${answerBlock}\n${ANSWERS_END}`)
    } else if (html.includes(aeoEndMarker)) {
      // Calculators: right after the AEO pricing table.
      html = html.replace(aeoEndMarker, `${aeoEndMarker}\n${ANSWERS_START}\n${answerBlock}\n${ANSWERS_END}`)
    } else if (!relFile.startsWith('calculator/')) {
      // Every non-calculator page here (index, about, contact, projects,
      // services): right after the byline if one was just inserted
      // (afterHeroAnchor accounts for it), otherwise right after the hero.
      html = html.slice(0, afterHeroAnchor) + '\n' + `${ANSWERS_START}\n${answerBlock}\n${ANSWERS_END}` + html.slice(afterHeroAnchor)
    } else if (html.includes('    </main>')) {
      html = html.replace('    </main>', `${ANSWERS_START}\n${answerBlock}\n${ANSWERS_END}\n    </main>`)
    } else {
      throw new Error(`${relFile}: no anchor found for answer block insertion`)
    }
  }

  // Phase 3 structure bar: add a real <table> for the pages that don't
  // already get one from the AEO pricing table (calculators) or the
  // promoted-Q&A/accordion sections above. Anchored on </main> — simplest
  // stable anchor, and table placement near the bottom (a reference table)
  // reads fine there without needing byline/answer-block offset math.
  if (relFile === 'projects.html') {
    const { sectionHtml, factsNeeded } = buildProjectsCaseStudySection(html)
    allFactsNeeded.push(...factsNeeded)
    const ctaAnchor = '      <section class="bg-blue-700 text-white py-16">'
    if (html.includes(CASE_STUDIES_START)) {
      const re = new RegExp(`${escRe(CASE_STUDIES_START)}[\\s\\S]*?${escRe(CASE_STUDIES_END)}`)
      html = html.replace(re, `${CASE_STUDIES_START}\n${sectionHtml}\n${CASE_STUDIES_END}`)
    } else if (html.includes(ctaAnchor)) {
      html = html.replace(ctaAnchor, `${CASE_STUDIES_START}\n${sectionHtml}\n${CASE_STUDIES_END}\n${ctaAnchor}`)
    } else {
      throw new Error(`projects.html: CTA anchor not found for case-study section insertion`)
    }
  }

  // Hub-and-spoke parent link — inserted last (not alongside the earlier
  // byline/answers/methodology anchoring) so it can do a fresh regex match
  // against <main> right before writing, rather than reusing an anchor
  // offset computed before those insertions shifted everything after it.
  const parentServiceUrl = CALCULATOR_PARENT_SERVICE_URL[relFile]
  if (parentServiceUrl) {
    const linkBlock = parentServiceLinkHtml(parentServiceUrl)
    if (html.includes(PARENT_LINK_START)) {
      const re = new RegExp(`${escRe(PARENT_LINK_START)}[\\s\\S]*?${escRe(PARENT_LINK_END)}`)
      html = html.replace(re, `${PARENT_LINK_START}\n${linkBlock}\n${PARENT_LINK_END}`)
    } else {
      const freshMainMatch = html.match(/<main[^>]*>/)
      if (!freshMainMatch) throw new Error(`${relFile}: no <main> tag found for parent-link insertion`)
      const insertAt = freshMainMatch.index + freshMainMatch[0].length
      html = html.slice(0, insertAt) + '\n' + `${PARENT_LINK_START}\n${linkBlock}\n${PARENT_LINK_END}` + html.slice(insertAt)
    }
  }

  const tableBuilder = EXTRA_TABLE_BUILDERS[relFile]
  if (tableBuilder) {
    const tableBlock = tableBuilder()
    if (html.includes(TABLE_START)) {
      const re = new RegExp(`${escRe(TABLE_START)}[\\s\\S]*?${escRe(TABLE_END)}`)
      html = html.replace(re, `${TABLE_START}\n${tableBlock}\n${TABLE_END}`)
    } else if (html.includes('    </main>')) {
      html = html.replace('    </main>', `${TABLE_START}\n${tableBlock}\n${TABLE_END}\n    </main>`)
    } else {
      throw new Error(`${relFile}: no </main> found for table insertion`)
    }
  }

  fs.writeFileSync(filePath, html, 'utf-8')
  patched++
  console.log(`✓ Patched ${relFile}`)
}

console.log(`✅ Trust layer applied to ${patched} hand-authored pages.`)
if (allFactsNeeded.length) {
  console.log(`\n${allFactsNeeded.length} FACT-NEEDED item(s) from projects.html case studies (add to CITABILITY-FACTS-NEEDED.md):`)
  for (const f of allFactsNeeded) console.log(`  - [${f.project}] ${f.field}`)
}
