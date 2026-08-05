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
import { GLOBAL_FAQS } from '../src/data/geo-aeo.js'

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

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [SCOTT_PERSON_SCHEMA, article],
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
  let extraFaqs = []
  const answersAlreadyPresent = html.includes(ANSWERS_START)
  if (answersAlreadyPresent) {
    // Idempotent re-run: the block is already there (and, for the
    // accordion-promotion pages, its source <details> entries were already
    // removed on the first run) — nothing to recompute.
  } else if (faqSourceId) {
    extraFaqs = (SERVICE_FAQS[faqSourceId] ?? []).slice(1, 4).map((f) => ({ ...f, alreadyEscaped: false }))
  } else if (relFile === 'calculator/estimate.html') {
    extraFaqs = ESTIMATE_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (relFile === 'about.html') {
    extraFaqs = ABOUT_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (relFile === 'contact.html') {
    extraFaqs = CONTACT_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (relFile === 'projects.html') {
    extraFaqs = PROJECTS_FAQ_INDICES.map((i) => ({ ...GLOBAL_FAQS[i], alreadyEscaped: false }))
  } else if (PROMOTE_FROM_OWN_ACCORDION[relFile]) {
    for (const q of PROMOTE_FROM_OWN_ACCORDION[relFile]) {
      const result = promoteFromAccordion(html, q)
      html = result.html
      if (result.promoted) extraFaqs.push({ ...result.promoted, alreadyEscaped: true })
      else console.warn(`  ! ${relFile}: could not find accordion entry "${q}" to promote — skipped`)
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

  fs.writeFileSync(filePath, html, 'utf-8')
  patched++
  console.log(`✓ Patched ${relFile}`)
}

console.log(`✅ Trust layer applied to ${patched} hand-authored pages.`)
