/**
 * The trust layer — byline, answer sections, methodology box, comparison
 * tables, parent-service link, and the Article/Person/FAQPage schema graph —
 * for the pages the other generators do not own.
 *
 * WHAT THIS USED TO BE, AND WHY IT CHANGED
 *
 * scripts/generate-trust-layer.mjs read sixteen committed .html files, injected
 * these blocks between <!-- TRUST-LAYER-*:START/END --> marker comments, and
 * wrote the files back. That made the committed HTML both a source and an
 * output, which is the single habit this cleanup exists to end: the repo held
 * two copies of every fact, and whichever one you edited, the other could win.
 *
 * It also had a one-way step. The promoted-FAQ branch took its Q&A out of the
 * page's own <details> accordion and deleted the source, so a second run found
 * nothing and silently skipped — the section froze at whatever the first run
 * produced and could never pick up an edit. Those answers live in
 * src/data/promoted-faqs.js now, and every branch here is a pure lookup.
 *
 * WHAT IT IS NOW
 *
 * trustRender() takes a page's <main> body and its metadata and returns
 * { main, blocks, schema }. It reads nothing and writes nothing. The caller
 * places each block on a named {{trust.*}} placeholder in src/templates/ and
 * hands `schema` to documentHead(). A block with no placeholder is a build
 * failure, not a silently dropped section.
 */
import { SCOTT_PERSON_SCHEMA, ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA, WEBSITE_SCHEMA, articleSchema, webPageSchema } from '../data/site-schema.js'
import { SERVICE_FAQS } from '../data/service-faqs.js'
import { GLOBAL_FAQS, faqPageSchema } from '../data/geo-aeo.js'
import { SERVICES, SITE, servicesByTier } from '../data/services.js'
import { SITE_ORIGIN, pageUrl } from '../data/url-map.js'
import { PROMOTED_FAQS } from '../data/promoted-faqs.js'
import { CHOOSE_IF, PERMIT_REQUIRED } from '../data/service-comparison.js'

// services.html already has its own hand-placed "Written by" byline further
// down the page (not right after the H1 like the other 15) — inserting a
// second one near the top would duplicate it. This page gets the Article
// JSON-LD only; Phase 4 rebuilds services.html's layout anyway, at which
// point its byline placement gets revisited along with everything else.
const SCHEMA_ONLY_FILES = ['services.html']

// Maps each calculator to the SERVICE_FAQS (service-faqs.js) entry whose
// Q&A content applies to it. Index 0 of each array is always the cost
// question — already covered by the calculator's own AEO-table H2 (see
// src/build/calculator-tables.mjs), so it's skipped here to avoid a
// duplicate heading; indices 1-3 (timeline, comparison/material, permit —
// see service-faqs.js's own ordering) get promoted instead. This is the
// same "answer-block breadth" gap called out in Phase 0 recon: calculators
// already had one strong Q&A pair and nothing else.
// Hub-and-spoke (Phase 7): prominent link from each calculator back to its
// parent service page. Built from SERVICES[].calculator /.calculators
// directly rather than hand-typed, so it can't drift if a service's
// calculator assignment ever changes. estimate.html has no single parent
// (it's the all-in-one calculator) — links to /services.html instead.
// A calculator can be claimed twice: bathroom-remodeling claims bath-remodel
// through its own `calculator` field, and remodeling (whole-home) claims the
// same one through its `calculators` list. The specific claim wins.
//
// This used to be decided by array order — Object.fromEntries keeps the last
// entry, so whichever service happened to sit later in services.js became the
// breadcrumb parent. Reordering SERVICES by tier in Phase 6.1 flipped it, and
// /calculator/bath-remodel started telling Google its parent was "Home
// Remodeling" instead of "Bathroom Remodeling". Nothing failed; the graph was
// still valid, just wrong.
//
// The generic claims are laid down first and the specific ones overwrite them,
// so the result no longer depends on the order of the list.
const CALCULATOR_PARENT_SERVICE_URL = {
  ...Object.fromEntries(
    SERVICES.flatMap((s) =>
      (s.calculators ?? []).map((c) => [`calculator/${c.id}.html`, pageUrl(`${s.slug}/index.html`)])
    )
  ),
  ...Object.fromEntries(
    SERVICES.filter((s) => s.calculator).map((s) => [
      `calculator/${s.calculator}.html`,
      pageUrl(`${s.slug}/index.html`),
    ])
  ),
  'calculator/estimate.html': pageUrl('services.html'),
}

const CALCULATOR_FAQ_SOURCE = {
  'calculator/decks.html': 'decks',
  'calculator/garages.html': 'garages',
  'calculator/porch.html': 'screened-porches',
  'calculator/additions.html': 'additions',
  'calculator/covered-patios.html': 'covered-patios',
  'calculator/basement-finishing.html': 'basement-finishing',
  'calculator/ada-bath-shower.html': 'ada-bath-to-shower',
  // The kitchen and whole-home calculators still share the generic
  // 'remodeling' SERVICE_FAQS entry — every sentence in it is accurate for
  // both, so this is real reuse, not padding. The bath calculator now has
  // its own dedicated, bath-specific FAQ set (see 'bathroom-remodeling' in
  // service-faqs.js) since /bathroom-remodeling shipped as its own pillar
  // page rather than sharing /remodeling's generic answers.
  'calculator/kitchen-remodel.html': 'remodeling',
  'calculator/bath-remodel.html': 'bathroom-remodeling',
  'calculator/whole-home-remodel.html': 'remodeling',
}

// index.html and services.html already have their own hand-typed FAQ
// accordions (not driven by service-faqs.js/geo-aeo.js) — for these, the
// promotion pulls the real <details> block straight out of the page's own
// accordion (by matching its visible question text) rather than reaching
// for a second copy of the same content from a data file. The block is
// removed from the accordion and re-rendered as an H2, so nothing ends up
// duplicated on the page.

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

// Original Phase 1 spec asked for this box on every calculator, immediately
// below the price range — missed in the actual Phase 1 pass, added here.
// The one real fact this needs (what real-world data backs the numbers —
// Scott's own invoices? supplier quotes? both?) is asked ONCE, not once per
// calculator, since it's the same underlying question for all 11.
function parentServiceLinkHtml(serviceUrl) {
  const label = serviceUrl === '/services' ? 'See All Services & Pricing' : 'View Full Service Details'
  return `      <section class="bg-blue-50 border-b border-blue-100 py-4 print:hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="${esc(serviceUrl)}" class="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold text-sm">&larr; ${esc(label)}</a>
        </div>
      </section>`
}

function methodologyBoxHtml(dates) {
  // Previously ended on "the real-world data source behind the base rates
  // themselves is not yet published" — reads as an unfinished TODO on a
  // page whose whole pitch is pricing transparency. The interactive
  // calculator's own "How We Calculate Your Estimate" card already states
  // the actual basis (BLS labor data plus local supplier and subcontractor
  // pricing — see howWeCalculateCard() / the "Pricing data updated" banner
  // in src/js/calculator.js); this box now states that as policy instead
  // of flagging it as a gap, and reuses the same wording rather than
  // introducing a third phrasing of the same fact.
  return `      <section class="bg-blue-50 border-y border-blue-100 py-8 print:hidden">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white border border-blue-200 rounded-xl p-6">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-2">How We Price This</p>
            <p class="text-slate-600 text-sm leading-relaxed">These ranges are computed from Burch Contracting's own pricing formula: a base direct cost per square foot — built from current Upstate SC market data, BLS labor statistics combined with local supplier and subcontractor pricing — adjusted for material, complexity, and site conditions, plus a fixed 20% overhead &amp; profit (see <a href="/services" class="text-blue-700 hover:text-blue-800 underline">services.html</a> for the full comparison). Base rates are reviewed as material and labor costs shift; this page was last updated <time datetime="${dates.dateModified}">${dates.dateModified}</time> by C. Scott Burch.</p>
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
                  <td class="px-4 py-3 text-sm">${s.calculator ? `<a href="${pageUrl(`calculator/${s.calculator}.html`)}" class="text-blue-700 hover:text-blue-800 underline">Calculate your cost &rarr;</a>` : `<a href="${pageUrl(`${s.slug}/index.html`)}" class="text-blue-700 hover:text-blue-800 underline">Learn more &rarr;</a>`}</td>
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


// Five columns, rows in tier order (Tier 1 first). The Calculator and Details
// links sit under the service name rather than in a sixth "Links" column: with
// six, the table scrolled sideways at 1280px and the links were the part cut off.
function servicesComparisonTableHtml() {
  const rows = servicesByTier().map((s) => {
    // No fallbacks. check-build asserts both maps cover every slug, so a
    // missing entry is a failed build rather than a blank cell on /services.
    const permit = PERMIT_REQUIRED[s.slug]
    const chooseIf = CHOOSE_IF[s.slug]
    const linkHtml = s.calculator
      ? `<a href="${pageUrl(`calculator/${s.calculator}.html`)}" class="text-blue-700 hover:text-blue-800 underline">Calculator</a> &middot; <a href="${pageUrl(`${s.slug}/index.html`)}" class="text-blue-700 hover:text-blue-800 underline">Details</a>`
      : `<a href="${pageUrl(`${s.slug}/index.html`)}" class="text-blue-700 hover:text-blue-800 underline">Details</a>`
    return `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left align-top min-w-[12rem]">${esc(s.title)}<span class="mt-1 block text-sm font-normal whitespace-nowrap">${linkHtml}</span></th>
                  <td class="px-4 py-4 text-blue-700 font-semibold align-top whitespace-nowrap">${esc(s.stats.costRange)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top whitespace-nowrap">${esc(s.stats.timeline)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top whitespace-nowrap">${esc(permit)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top min-w-[18rem]">Choose this if ${esc(chooseIf)}</td>
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
    const hrefAttr = `href="${pageUrl(`${s.slug}/index.html`)}"`
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

// Named entities used anywhere in this codebase's hand-typed or esc()'d
// HTML (see esc() in this file and the sibling generators) — kept in sync
// with what actually gets written, not a general-purpose HTML decoder.
const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&rarr;': '→',
  '&middot;': '·',
  '&#10003;': '✓',
  '&nbsp;': ' ',
}

function decodeEntities(s) {
  return s
    .replace(/&(?:amp|lt|gt|quot|#39|apos|rarr|middot|#10003|nbsp);/g, (m) => HTML_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
}

// Pulls plain text out of already-rendered (HTML-escaped) markup. Anything
// built from this function's output is either re-escaped on its way back
// into HTML (fine either way) or serialized straight into JSON-LD via
// JSON.stringify — which does NOT decode HTML entities, so failing to
// decode here was leaving literal "&amp;" inside JSON-LD string values
// (see extractH2QAPairs / the Article headline extraction below).
function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
}

// Single source for these 2 calculator-specific questions — used to build
// both the visible FAQ block and the matching FAQPage schema entries, so
// the two can't independently drift the way they did before (see the
// FAQPage-schema comment near where this is called from the schema side).
function calculatorMethodologyFaqs(serviceName) {
  return [
    {
      question: `Is this ${serviceName} cost estimate accurate?`,
      answer: `This is a planning estimate based on typical Upstate SC ${serviceName.toLowerCase()} costs, size, and the tier you select — actual pricing depends on your site conditions and finish selections. Every Burch Contracting quote includes a transparent 20% overhead and profit, the same formula used sitewide, with no hidden markup.`,
    },
    {
      question: `What would push my ${serviceName.toLowerCase()} project to the high end of this range?`,
      answer: `Site access, structural complexity, premium materials, and custom features push a project toward the high end of the range shown above; a straightforward scope in standard materials lands toward the low end. Scott confirms exactly where your project falls during a free consultation.`,
    },
  ]
}

/**
 * The trust layer for one page, as data rather than a side effect.
 *
 * Takes the page's <main> body and its metadata; returns a possibly-transformed
 * body, the blocks to place into it, and the schema graph to hand to
 * documentHead(). It writes nothing.
 *
 * TWO OF THESE ARE TRANSFORMS, NOT BLOCKS, AND THAT IS WHY `main` COMES BACK
 *
 * Most of what this produces is additive and lands on a placeholder. Two things
 * are not: fixServiceGridBudgets() repairs placeholder budget text already in
 * the body, and the promoted-FAQ step removes a <details> the answers block
 * replaces. Neither can be expressed as a placeholder, so they are applied to
 * `main` here and named explicitly, rather than happening invisibly the way the
 * old in-place patcher did.
 *
 * description, canonical and image are parameters now. The patcher scraped them
 * out of the page's own <head>, which a template does not have.
 */
export function trustRender({ relFile, main, description, canonical, image, dates }) {
  let html = main
  const blocks = {}

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!h1Match) {
    throw new Error(`${relFile}: no <h1> found in the template — cannot build Article schema`)
  }
  const headline = stripTags(h1Match[1])


  const article = articleSchema({
    headline,
    description,
    url: canonical,
    datePublished: dates.datePublished,
    dateModified: dates.dateModified,
    image,
  })

  // FAQPage schema for calculators — single source of truth shared with the
  // visible FAQ blocks below (the promoted-answers section and the AEO
  // table's own H2). This used to deliberately hold back the 3 promoted
  // SERVICE_FAQS questions from the schema on the theory that duplicate
  // Q&A across this page and its parent service page would hurt schema
  // "uniqueness" — that's not a real Google requirement (their actual rule
  // is "don't mark up content that isn't visible on THIS page"; the same
  // facts appearing, and being marked up, on more than one page is normal
  // and not penalized) and it's exactly what let the schema and the visible
  // page drift apart: 2 of these questions were schema-only and 3 were
  // visible-only. Every question below is rendered as real, visible page
  // content further down, so all of them belong in the schema too.
  const graph = [SCOTT_PERSON_SCHEMA, article]
  if (relFile.startsWith('calculator/')) {
    const qaPairs = extractH2QAPairs(html)
    const ownQuestion = qaPairs[0]
    const serviceName = headline.replace(/\s*Cost Calculator\s*$/i, '').trim() || 'this project'
    const methodologyFaqs = ownQuestion ? calculatorMethodologyFaqs(serviceName) : []

    // Same lookup the visible-answers block further down uses (faqSourceId
    // / ESTIMATE_FAQ_INDICES) — recomputed here rather than hoisting that
    // whole block, since it's pure data lookup (no side effects) and this
    // keeps the schema and visible-block code paths independently readable.
    const faqSourceId = CALCULATOR_FAQ_SOURCE[relFile]
    const promotedFaqs = faqSourceId
      ? (SERVICE_FAQS[faqSourceId] ?? []).slice(1, 4)
      : relFile === 'calculator/estimate.html'
        ? ESTIMATE_FAQ_INDICES.map((i) => GLOBAL_FAQS[i])
        : []

    const calculatorFaqs = [...(ownQuestion ? [ownQuestion] : []), ...methodologyFaqs, ...promotedFaqs].map(
      ({ question, answer }) => ({ question, answer })
    )
    if (calculatorFaqs.length) graph.push(faqPageSchema(calculatorFaqs))

    // WebPage + WebSite + LocalBusiness + Organization + Breadcrumb used to
    // be a hand-typed <script> per calculator page (11 independently-
    // maintained copies — see the breadcrumb-URL and business/org-linking
    // bugs this replaces). Generated here instead, from the same canonical
    // data every other page generator uses, so it can't drift per-page again.
    // CALCULATOR_PARENT_SERVICE_URL already holds final URLs from
    // src/data/url-map.js, so there are no .html or trailing-slash special
    // cases left and structured data never points at a redirect.
    const parentPath = CALCULATOR_PARENT_SERVICE_URL[relFile]
    const parentUrl = `${SITE_ORIGIN}${parentPath}`
    const parentName =
      parentPath === pageUrl('services.html')
        ? 'Services'
        : (SERVICES.find((s) => pageUrl(`${s.slug}/index.html`) === parentPath)?.title ?? 'Services')
    const calculatorName = `${serviceName} Calculator`

    graph.push(
      LOCAL_BUSINESS_SCHEMA,
      ORGANIZATION_SCHEMA,
      WEBSITE_SCHEMA,
      webPageSchema({ url: canonical, name: calculatorName, articleId: article['@id'] }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}${pageUrl('services.html')}` },
          { '@type': 'ListItem', position: 3, name: parentName, item: parentUrl },
          { '@type': 'ListItem', position: 4, name: calculatorName, item: canonical },
        ],
      }
    )
  }

  // Returned, not injected. documentHead() emits every page's JSON-LD from one
  // place, so a page can no longer end up with the hand-written block and this
  // one disagreeing about the same facts.
  const schema = { '@context': 'https://schema.org', '@graph': graph }

  // TRANSFORM 1 of 2. Rewrites budget text already present in the body, so it
  // cannot be a placeholder. Idempotent, and a no-op on the current template —
  // the committed page was already repaired — but kept because the repair
  // belongs with the data it derives from, not frozen into the markup.
  if (relFile === 'services.html') html = fixServiceGridBudgets(html)

  const isSchemaOnly = SCHEMA_ONLY_FILES.includes(relFile)

  const bylineBlock = `      <section class="bg-white py-8 border-b border-slate-100 print:hidden">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside class="bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name"><a href="/about" class="hover:text-blue-700 transition-colors">C. Scott Burch</a></h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #CLG118679 | NC Licensed (Limited) #107292 | 30+ years serving Upstate SC.</p>
            <p class="text-slate-500 text-xs mt-3">Published: <time datetime="${dates.datePublished}">${dates.datePublished}</time> &middot; Last reviewed: <time datetime="${dates.dateModified}">${dates.dateModified}</time></p>
          </aside>
        </div>
      </section>`

  // services.html carries the schema and nothing visible: its hero already has
  // an author credit, and a second byline under it was the one place reviewers
  // consistently flagged as duplicated.
  if (!isSchemaOnly) blocks.byline = bylineBlock

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
  // The promoted entries used to be the exception here: they were scraped out
  // of the page's own accordion, which destroyed the source, so they could not
  // be recomputed. They come from src/data/promoted-faqs.js now, so every
  // branch below is a pure lookup and nothing in this function is one-way.
  let extraFaqs = []
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
  } else if (PROMOTED_FAQS[relFile]) {
    // Read from data, not scraped out of the page.
    //
    // This used to call promoteFromAccordion() for each question, which takes
    // the Q&A from the page's own <details> and DELETES the source. That works
    // exactly once: on a re-run the source is gone, so the branch above used to
    // detect an existing answers block and skip, leaving the section frozen at
    // whatever the first run produced. It could never pick up an edit.
    //
    // Harmless while this generator patched committed HTML in place. Fatal the
    // moment these pages render from a template, because the sources are
    // already absent from src/templates/ — a regeneration would find nothing
    // and silently drop the section. See src/data/promoted-faqs.js.
    extraFaqs = PROMOTED_FAQS[relFile].map((f) => ({ ...f, alreadyEscaped: true }))

    // TRANSFORM 2 of 2. Removes the <details> accordion entry that the answers
    // block replaces, so the same Q&A does not appear twice. It removes rather
    // than adds, so it cannot be a placeholder. A no-op on the current
    // templates — those entries went when the pages were first patched — and
    // now safe rather than lossy, because the answers no longer come from it.
    for (const { question } of PROMOTED_FAQS[relFile]) {
      html = promoteFromAccordion(html, question).html
    }
  }

  if (relFile.startsWith('calculator/')) {
    // These 2 are also in this page's FAQPage schema (see the calculator
    // block above) — added here too so they're real visible content, not
    // schema-only. Order: calculator-specific methodology questions first
    // (right below the AEO table's own cost Q&A), then the 3 promoted
    // SERVICE_FAQS ones.
    const serviceName = headline.replace(/\s*Cost Calculator\s*$/i, '').trim() || 'this project'
    extraFaqs = [
      ...calculatorMethodologyFaqs(serviceName).map((f) => ({ ...f, alreadyEscaped: false })),
      ...extraFaqs,
    ]

    blocks.methodology = methodologyBoxHtml(dates)
  }

  if (extraFaqs.length) {
    const answerBlock = `      <section class="bg-white py-16 lg:py-20 border-t border-slate-100 print:hidden">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
${extraFaqs
      .map(
        // contact.html only, first item (the "how do I get a free
        // consultation" question): pair it with a real jump-to-form button
        // rather than leaving the reader to scroll and find the form
        // themselves. #request-form is the id on the form card in
        // contact.html's hand-authored markup.
        (faq, i) => `          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">${faq.alreadyEscaped ? faq.question : esc(faq.question)}</h2>
            <p class="text-slate-600 leading-relaxed">${faq.alreadyEscaped ? faq.answer : esc(faq.answer)}</p>${
              relFile === 'contact.html' && i === 0
                ? `
            <a href="#request-form" class="mt-5 inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              Jump to the Contact Form
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </a>`
                : ''
            }
          </div>`
      )
      .join('\n')}
        </div>
      </section>`

    blocks.answers = answerBlock
  }

  // Hub-and-spoke parent link. A separate block rather than part of the answers
  // section: only the calculators have one, and the template decides where it
  // goes. (It used to be injected last, with a fresh regex match against <main>,
  // because the earlier injections had shifted every offset computed before
  // them. Nothing is injected now, so that ordering constraint is gone.)
  const parentServiceUrl = CALCULATOR_PARENT_SERVICE_URL[relFile]
  if (parentServiceUrl) blocks.parentLink = parentServiceLinkHtml(parentServiceUrl)

  const tableBuilder = EXTRA_TABLE_BUILDERS[relFile]
  if (tableBuilder) blocks.table = tableBuilder()

  return { main: html, blocks, schema }
}
