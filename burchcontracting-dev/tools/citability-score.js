#!/usr/bin/env node
/**
 * Local AI-citability scorer — a rough, repeatable proxy for the SEOmator
 * GEO audit's "AI Citability" score (see CITABILITY-REPORT.md). Not a
 * replacement for the real audit; it exists so we can iterate locally
 * between the expensive external re-runs (see Part 4 of the plan: "re-run
 * SEOmator after Phase 4, not after every phase").
 *
 * Scores 5 sub-dimensions per page (0-100 each), weighted into a single
 * 0-100 score:
 *   - Answer Quality      25%  — question heading -> direct-answer paragraph
 *   - Self-Containment    20%  — sections readable without prior context
 *   - Structure           20%  — tables/lists/FAQ blocks, section length
 *   - Statistical Density 20%  — numeric tokens per 100 words
 *   - Uniqueness          15%  — proper nouns, first-person voice, and
 *                                 cross-page n-gram overlap
 *
 * Uniqueness deliberately scores only the content inside <main>...</main>,
 * with <header>/<nav>/<footer> and the sticky nav menus stripped out first.
 * Those are byte-identical on every one of the 41 pages by design (same
 * header partial, same footer partial) — counting them would make every
 * page's uniqueness score collapse toward the sitewide-boilerplate ratio
 * rather than measuring the page's actual prose. This matches Phase 5's own
 * acceptance check ("no two service-area pages share more than 30% of their
 * non-navigational text").
 *
 * Usage: node tools/citability-score.js [--json-only]
 * Writes citability-baseline.json and CITABILITY-REPORT.md at repo root.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// --- Page inventory -----------------------------------------------------
// Hand-listed rather than directory-walked: we want a stable, known set of
// 41 pages matching the audit's page count (see CITABILITY-REPORT.md notes
// on how this was reconciled), not whatever happens to exist under the repo
// root today (node_modules, migration/, dist/, .claude/ all live there too).

const SERVICE_DIRS = [
  'ada-bath-to-shower', 'ada-compliance', 'additions', 'adu-builder',
  'basement-finishing', 'commercial-roofing', 'commercial-upfits',
  'garages', 'handyman', 'insurance-restoration', 'remodeling',
]
const OUTDOOR_LIVING = ['decks', 'screened-porches', 'covered-patios']
const SERVICE_AREAS = [
  'five-forks', 'fountain-inn', 'gray-court', 'greenville',
  'laurens', 'mauldin', 'simpsonville', 'woodruff',
]
const CALCULATORS = [
  'ada-bath-shower', 'additions', 'basement-finishing', 'bath-remodel',
  'covered-patios', 'decks', 'estimate', 'garages', 'kitchen-remodel',
  'porch', 'whole-home-remodel',
]

const PAGES = [
  { id: 'index', file: 'index.html', url: '/' },
  { id: 'services', file: 'services.html', url: '/services.html' },
  { id: 'about', file: 'about.html', url: '/about.html' },
  { id: 'contact', file: 'contact.html', url: '/contact.html' },
  { id: 'projects', file: 'projects.html', url: '/projects.html' },
  { id: 'faqs', file: 'faqs.html', url: '/faqs.html' },
  ...SERVICE_DIRS.map((d) => ({ id: d, file: `${d}/index.html`, url: `/${d}` })),
  ...OUTDOOR_LIVING.map((d) => ({ id: `outdoor-living-${d}`, file: `outdoor-living/${d}/index.html`, url: `/outdoor-living/${d}` })),
  ...SERVICE_AREAS.map((a) => ({ id: `area-${a}`, file: `service-areas/${a}.html`, url: `/service-areas/${a}.html` })),
  ...CALCULATORS.map((c) => ({ id: `calc-${c}`, file: `calculator/${c}.html`, url: `/calculator/${c}.html` })),
  { id: 'privacy-policy', file: 'privacy-policy.html', url: '/privacy-policy.html', lowPriority: true },
  { id: 'terms-of-service', file: 'terms-of-service.html', url: '/terms-of-service.html', lowPriority: true },
]

// --- HTML helpers ---------------------------------------------------------

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;|&ndash;/g, '-')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  return m ? m[1] : html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
}

// Strips the sticky header/nav and footer partials so uniqueness scoring
// isn't dominated by the ~250 lines of identical markup every page shares
// (see file header comment). Both partials are self-contained and closed
// before <main> opens / after it closes in every page generator, so this
// is safe even though extractMain() already usually excludes them.
function stripChrome(html) {
  return html
    .replace(/<header[\s\S]*?<\/header>/i, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/i, ' ')
}

function headings(html) {
  const out = []
  const re = /<h([12])[^>]*>([\s\S]*?)<\/h\1>/gi
  let m
  while ((m = re.exec(html))) {
    out.push({ level: Number(m[1]), text: stripTags(m[2]), index: m.index, raw: m[0] })
  }
  return out
}

function paragraphsAfter(html, fromIndex, maxChars = 500) {
  const slice = html.slice(fromIndex, fromIndex + maxChars)
  const m = slice.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  return m ? stripTags(m[1]) : ''
}

function allParagraphs(html) {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1])).filter((t) => t.length > 0)
}

const QUESTION_RE = /^(how|what|why|when|where|which|do|does|is|are|can|will|should)\b.*\?$|.*\?$/i

function isQuestionHeading(text) {
  const t = text.trim()
  if (t.endsWith('?')) return true
  return /^(how|what|why|when|where|which|do|does|is|are|can|will|should)\b/i.test(t)
}

const PRONOUN_OPENERS = /^(this|these|that|those|it|they|as mentioned|as discussed|as noted|as we discussed|as shown above|as described above)\b/i

function wordCount(text) {
  return (text.match(/\S+/g) || []).length
}

// --- Sub-scores ------------------------------------------------------------

function scoreAnswerQuality(main) {
  const hs = headings(main).filter((h) => h.level <= 2)
  const qHeadings = hs.filter((h) => isQuestionHeading(h.text))
  if (qHeadings.length === 0) return { score: 25, detail: '0 question-form H1/H2 headings' }

  let qualifying = 0
  for (const h of qHeadings) {
    const p = paragraphsAfter(main, h.index + h.raw.length, 600)
    const wc = wordCount(p)
    const hasNumber = /\$[\d,]+|\d+\s?(sq ?ft|%|years?|weeks?|days?)|\b\d{2,}\b/i.test(p)
    if (wc >= 25 && wc <= 100 && hasNumber) qualifying++
  }
  const qualityRatio = qualifying / qHeadings.length
  // Coverage: Phase 2's own acceptance bar is "no fewer than 4 question-form
  // headings" per page. A page with only the one hero Q&A (typical of the
  // calculators today) shouldn't max out just because that one answer is
  // well-formed — it's thin breadth, and that's exactly what the audit
  // penalizes on the calculator pages despite their strong single answer.
  const coverage = Math.min(qHeadings.length, 4) / 4
  const score = Math.round(25 + 65 * qualityRatio * coverage + 10 * coverage)
  return {
    score: Math.max(0, Math.min(100, score)),
    detail: `${qHeadings.length} question headings (coverage ${Math.round(coverage * 100)}%), ${qualifying} with a qualifying direct-answer paragraph`,
  }
}

function scoreSelfContainment(main) {
  const paras = allParagraphs(main).filter((p) => wordCount(p) >= 8)
  if (paras.length === 0) return { score: 50, detail: 'no substantial paragraphs found' }
  const bad = paras.filter((p) => PRONOUN_OPENERS.test(p.trim()))
  const score = Math.round(100 - (bad.length / paras.length) * 100)
  return { score, detail: `${bad.length}/${paras.length} paragraphs open with an unresolved reference` }
}

function scoreStructure(main) {
  const tables = (main.match(/<table[\s>]/gi) || []).length
  const dls = (main.match(/<dl[\s>]/gi) || []).length
  const ols = (main.match(/<ol[\s>]/gi) || []).length
  const faqBlocks = (main.match(/<details[\s>]/gi) || []).length
  const h2h3 = (main.match(/<h[23][\s>]/gi) || []).length
  const structuralElements = tables + dls + ols + (faqBlocks > 0 ? 1 : 0)

  // Section-length reward: split on H2 boundaries, check word counts land
  // near the audit's 134-167 word "self-contained section" target.
  const h2Indices = [...main.matchAll(/<h2[^>]*>/gi)].map((m) => m.index)
  let bandedSections = 0
  for (let i = 0; i < h2Indices.length; i++) {
    const start = h2Indices[i]
    const end = i + 1 < h2Indices.length ? h2Indices[i + 1] : main.length
    const wc = wordCount(stripTags(main.slice(start, end)))
    if (wc >= 100 && wc <= 220) bandedSections++
  }
  const bandRatio = h2Indices.length ? bandedSections / h2Indices.length : 0

  let score = 40
  score += Math.min(30, structuralElements * 12) // tables/lists/FAQ
  score += Math.min(15, h2h3 * 2) // heading density
  score += Math.round(bandRatio * 15) // section-length discipline
  return {
    score: Math.min(100, score),
    detail: `${tables} table(s), ${dls} dl, ${ols} ol, ${faqBlocks} FAQ blocks, ${h2h3} H2/H3, ${bandedSections}/${h2Indices.length || 0} sections in 100-220wd band`,
  }
}

function scoreStatisticalDensity(main) {
  const text = stripTags(main)
  const wc = wordCount(text)
  if (wc === 0) return { score: 0, detail: 'no text content' }
  const numTokens = (text.match(/\$[\d,]+(\.\d+)?|\b\d+(\.\d+)?%|\b\d{1,4}\s?(sq ?ft|sqft|x\s?\d|×\s?\d)|\b(19|20)\d{2}\b|\b\d+[-–]\d+\b|\b\d+\+?\b/gi) || []).length
  const per100 = (numTokens / wc) * 100
  const score = Math.round(Math.min(100, (per100 / 4) * 100))
  return { score, detail: `${numTokens} numeric tokens / ${wc} words (${per100.toFixed(1)} per 100w, target 4+)` }
}

const PLACE_NAMES = ['Simpsonville', 'Fountain Inn', 'Mauldin', 'Greenville', 'Five Forks', 'Woodruff', 'Laurens', 'Gray Court', 'Upstate SC', 'Spartanburg', 'South Carolina']

function scoreUniqueness(main, allShingles, pageId) {
  const text = stripTags(main)
  const wc = wordCount(text) || 1
  const properNouns = (text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []).length
  const properPer100 = (properNouns / wc) * 100
  const placeHits = PLACE_NAMES.filter((p) => text.includes(p)).length
  const licenseHits = (text.match(/CLG118679|#?107292/g) || []).length
  const firstPerson = /\bI've\b|\bI'm\b|\bI have\b|\bI started\b|\bmy own\b|\bI've built\b|\bI\s/i.test(text)

  const shingles = shingleSet(text)
  let maxOverlap = 0
  for (const [otherId, otherShingles] of allShingles) {
    if (otherId === pageId) continue
    // Containment (intersection / smaller set), not Jaccard: a short
    // boilerplate block (e.g. the identical "BBB A+ / Google 5.0 / 35+
    // years / 100% Licensed" credentials strip on every calculator page)
    // copy-pasted inside an otherwise-long, otherwise-unique page barely
    // moves a union-based Jaccard score, but it's exactly the kind of
    // templated repetition the audit's uniqueness dimension is penalizing.
    // Containment surfaces "a real chunk of this page is identical to a
    // real chunk of that page" regardless of how long either page is.
    const overlap = overlapCoefficient(shingles, otherShingles)
    if (overlap > maxOverlap) maxOverlap = overlap
  }

  let score = 22
  score += Math.min(15, properPer100 * 0.9)
  score += Math.min(10, placeHits * 3)
  score += licenseHits > 0 ? 6 : 0
  score += firstPerson ? 12 : 0
  score -= Math.round(maxOverlap * 100 * 0.9) // heavy penalty for cross-page overlap
  score = Math.max(0, Math.min(100, Math.round(score)))
  return { score, detail: `${placeHits} place names, ${licenseHits} license mentions, first-person=${firstPerson}, max cross-page containment overlap ${(maxOverlap * 100).toFixed(0)}%` }
}

function shingleSet(text, n = 8) {
  const words = text.toLowerCase().match(/[a-z0-9$%]+/g) || []
  const set = new Set()
  for (let i = 0; i + n <= words.length; i++) set.add(words.slice(i, i + n).join(' '))
  return set
}

function overlapCoefficient(a, b) {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  const [small, big] = a.size < b.size ? [a, b] : [b, a]
  for (const s of small) if (big.has(s)) intersection++
  return intersection / small.size
}

// --- Main --------------------------------------------------------------

function loadPage(page) {
  const filePath = path.join(root, page.file)
  if (!fs.existsSync(filePath)) return null
  const html = fs.readFileSync(filePath, 'utf8')
  const main = stripChrome(extractMain(html))
  return { ...page, html, main }
}

const loaded = PAGES.map(loadPage).filter(Boolean)
const missing = PAGES.filter((p) => !fs.existsSync(path.join(root, p.file)))

// Pre-compute shingle sets for cross-page overlap comparison.
const allShingles = loaded.map((p) => [p.id, shingleSet(stripTags(p.main))])

const WEIGHTS = { answer: 0.25, selfContainment: 0.2, structure: 0.2, stats: 0.2, uniqueness: 0.15 }

const results = loaded.map((p) => {
  const answer = scoreAnswerQuality(p.main)
  const selfContainment = scoreSelfContainment(p.main)
  const structure = scoreStructure(p.main)
  const stats = scoreStatisticalDensity(p.main)
  const uniqueness = scoreUniqueness(p.main, allShingles, p.id)

  const total = Math.round(
    answer.score * WEIGHTS.answer +
      selfContainment.score * WEIGHTS.selfContainment +
      structure.score * WEIGHTS.structure +
      stats.score * WEIGHTS.stats +
      uniqueness.score * WEIGHTS.uniqueness
  )

  return {
    id: p.id,
    url: p.url,
    file: p.file,
    total,
    subScores: {
      answerQuality: answer.score,
      selfContainment: selfContainment.score,
      structure: structure.score,
      statisticalDensity: stats.score,
      uniqueness: uniqueness.score,
    },
    detail: {
      answerQuality: answer.detail,
      selfContainment: selfContainment.detail,
      structure: structure.detail,
      statisticalDensity: stats.detail,
      uniqueness: uniqueness.detail,
    },
  }
})

results.sort((a, b) => a.total - b.total)

const avg = Math.round(results.reduce((s, r) => s + r.total, 0) / results.length)

// --- Write outputs -------------------------------------------------------

const baselineJson = {
  generatedAt: new Date().toISOString(),
  pageCount: results.length,
  missingFiles: missing.map((m) => m.file),
  averageScore: avg,
  pages: results,
}

fs.writeFileSync(path.join(root, 'citability-baseline.json'), JSON.stringify(baselineJson, null, 2))

const reportLines = []
reportLines.push('# Citability Report')
reportLines.push('')
reportLines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`)
reportLines.push(`Pages scored: ${results.length}${missing.length ? ` (${missing.length} listed pages missing on disk: ${missing.map((m) => m.file).join(', ')})` : ''}`)
reportLines.push(`**Average citability score: ${avg}/100**`)
reportLines.push('')
reportLines.push('Sorted worst-first. Sub-scores are 0-100; overall = 25% Answer + 20% Self-Containment + 20% Structure + 20% Stats + 15% Uniqueness.')
reportLines.push('')
reportLines.push('## Calibration notes (Phase 0)')
reportLines.push('')
reportLines.push(
  'This is a local heuristic proxy for the SEOmator GEO audit, not a reproduction of it — it exists ' +
    'for fast iteration between real audit re-runs. After two tuning passes (Answer Quality now requires ' +
    'breadth — 4+ question headings — not just one well-formed answer; Uniqueness now measures cross-page ' +
    '*containment* of 8-word shingles rather than Jaccard, so a short boilerplate block copy-pasted into an ' +
    'otherwise-long page still gets caught) it tracks the audit\'s shape on most of the floor: ' +
    '`/projects.html` and all 8 service-area pages cluster at the bottom in both, and calculators moved ' +
    'from this scorer\'s top-ranked pages to mid-pack, matching the audit\'s "calculators score respectably ' +
    'but not at the top" pattern. It does **not** reproduce the audit ranking `/` and `/services.html` as ' +
    'the single worst pages on the site — both land mid-pack here (71) instead of at the floor (audit: 45, ' +
    '43). Likely cause: those two pages are mostly service/FAQ card grids with light connective prose, which ' +
    'this heuristic does not penalize as heavily as SEOmator evidently does. Treat this tool\'s *ranking ' +
    'shape* and *relative before/after deltas* as signal; treat any single absolute score, and especially ' +
    'this gap on `/` and `/services.html`, with skepticism until the real audit re-runs (planned after Phase 4).')
reportLines.push('')
reportLines.push('| Page | Total | Answer | Self-Cont. | Structure | Stats | Unique |')
reportLines.push('|---|---|---|---|---|---|---|')
for (const r of results) {
  reportLines.push(
    `| ${r.url} | **${r.total}** | ${r.subScores.answerQuality} | ${r.subScores.selfContainment} | ${r.subScores.structure} | ${r.subScores.statisticalDensity} | ${r.subScores.uniqueness} |`
  )
}
reportLines.push('')
reportLines.push('## Detail (worst 10 pages)')
reportLines.push('')
for (const r of results.slice(0, 10)) {
  reportLines.push(`### ${r.url} — ${r.total}/100`)
  for (const [k, v] of Object.entries(r.detail)) reportLines.push(`- **${k}**: ${v}`)
  reportLines.push('')
}

fs.writeFileSync(path.join(root, 'CITABILITY-REPORT.md'), reportLines.join('\n'))

if (!process.argv.includes('--json-only')) {
  console.log(`Scored ${results.length} pages. Average: ${avg}/100`)
  console.log('Worst 10:')
  for (const r of results.slice(0, 10)) {
    console.log(`  ${r.total.toString().padStart(3)} — ${r.url}  (A:${r.subScores.answerQuality} SC:${r.subScores.selfContainment} St:${r.subScores.structure} Sd:${r.subScores.statisticalDensity} U:${r.subScores.uniqueness})`)
  }
  console.log('Best 5:')
  for (const r of results.slice(-5).reverse()) {
    console.log(`  ${r.total.toString().padStart(3)} — ${r.url}  (A:${r.subScores.answerQuality} SC:${r.subScores.selfContainment} St:${r.subScores.structure} Sd:${r.subScores.statisticalDensity} U:${r.subScores.uniqueness})`)
  }
  if (missing.length) console.log('Missing files:', missing.map((m) => m.file).join(', '))
}
