/**
 * Per-page datePublished / dateModified, computed from git at build time.
 *
 * These feed Article schema and sitemap lastmod, so they are load-bearing
 * content claims, not decoration. A wrong lastmod on every URL is how a site
 * teaches Google to stop trusting the field.
 *
 * WHAT THIS REPLACES
 *
 * scripts/compute-content-dates.mjs ran by hand on a developer machine and
 * wrote a committed src/data/content-dates.js, because CI checked out with
 * fetch-depth 1 and a live `git log` there would have stamped today on all 70
 * pages. The cost of that workaround was staleness: nobody re-runs a script
 * that no gate asks for. At the start of Phase 3 the committed file was stale
 * on 41 URLs and actively wrong on 27 more. CI now checks out with
 * fetch-depth 0 and this runs every build.
 *
 * THREE THINGS GIT CANNOT TELL YOU, AND WHAT IS DONE ABOUT EACH
 *
 * 1. WHERE A PAGE'S HISTORY LIVES. `git log -- <path>` only reaches back to
 *    this repo's Phase 1 flatten, because every file moved then. `--follow`
 *    traces through it, but takes a single path and decides renames by content
 *    similarity — which failed for most templates in 3.3a-ii/3.3b, where a
 *    24-line <main> was extracted out of a 300-line page. Left to git,
 *    calculator/decks.html would claim it was published the day it was
 *    extracted. Lowering the rename threshold does not fix it: at -M05% git
 *    matched decks.html to something dated 2026-06-01, which is confidently
 *    wrong rather than obviously wrong.
 *
 *    So lineage is declared, not detected. `history` in the overrides file
 *    lists the earlier paths, each queried with --follow, results unioned by
 *    commit hash. Verified: this reproduces the correct datePublished for all
 *    eighteen hand-authored pages.
 *
 * 2. WHETHER A COMMIT CHANGED THE SUBSTANCE. dateModified is supposed to mean
 *    "when did the content change", not "when did a script last touch this
 *    file". Nothing in a diff distinguishes them, and the conventional-commit
 *    type is not enough either: in this repo's own history `fix(seo): make
 *    index,follow the default` edited a meta tag on every page and changed
 *    nothing a reader sees, while `fix: 30+ years, not 35+` is exactly the
 *    kind of edit dateModified exists to report. Both are `fix`.
 *
 *    So it is declared too. A commit is mechanical if it carries the trailer
 *    `Content-Change: none`, or if it is listed in `mechanicalCommits`. The
 *    trailer is the mechanism going forward; the list seeds the commits made
 *    before the trailer existed. Forgetting to mark one makes a dateModified
 *    newer than ideal — never older, and never a wrong datePublished.
 *
 * 3. WHETHER A SERVICE CHANGED, AS OPPOSED TO services.js. Git tracks files,
 *    not the objects inside them, so all sixteen services share one date pair.
 *    kitchen-remodeling has claimed services.js's creation date as its own
 *    datePublished since it was added (docs/archive/FINDINGS.md #7). Per-object
 *    history is not something this can derive, so `dates` in the overrides file
 *    carries the correction, per entry, with a reason.
 *
 * WHY THESE ARE PASSED IN RATHER THAN IMPORTED
 *
 * See docs/DECISIONS.md, 2026-09-22. Briefly: an imported module would have to
 * be generated into src/ before the build could read it, which is the build
 * artifact in the source tree, and the prebuild ordering constraint, that
 * Phase 3 spent four commits removing.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { CALCULATOR_PAGES_META } from '../data/calculators.js'
import { HAND_AUTHORED_PAGES } from '../data/pages.js'
import { SERVICES } from '../data/services.js'

const root = resolve(import.meta.dirname, '../..')
const overridesPath = resolve(root, 'src/data/content-date-overrides.json')

/** The data files whose history stands in for the pages they generate. */
const DATA_FILES = [
  'src/data/services.js',
  'src/data/geo-aeo.js',
  'src/data/guides-cost.js',
  'src/data/guides-articles.js',
]

const SEP = String.fromCharCode(1)

function gitLog(args) {
  return execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 }).toString()
}

/**
 * Every commit touching one path, renames followed.
 *
 * --follow takes exactly one path, which is why callers union several calls
 * rather than passing a list. A path git has never heard of yields nothing,
 * which is not an error: a page with no history yet is a page added in the
 * working tree.
 */
function commitsFor(path) {
  let out
  try {
    out = gitLog(['log', '--follow', `--format=%H${SEP}%aI${SEP}%B%x00`, '--', path]).trim()
  } catch {
    return []
  }
  if (!out) return []
  return out
    .split('\u0000')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, iso, body] = entry.split(SEP)
      return { hash, date: iso.slice(0, 10), body: body ?? '' }
    })
}

function isMechanical(commit, mechanicalCommits) {
  if (/^Content-Change:\s*none\s*$/im.test(commit.body)) return true
  return Object.keys(mechanicalCommits).some((h) => commit.hash.startsWith(h))
}

/**
 * datePublished is the oldest commit on any of the page's paths; dateModified
 * the newest that is not mechanical.
 *
 * datePublished deliberately counts mechanical commits. The day a file was
 * created is when it was created, whatever the commit did afterwards, and a
 * page whose every commit is mechanical still has a real first appearance.
 */
function datesFrom(paths, mechanicalCommits) {
  const byHash = new Map()
  for (const p of paths) for (const c of commitsFor(p)) byHash.set(c.hash, c)
  const commits = [...byHash.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  if (!commits.length) return null

  const substantive = commits.filter((c) => !isMechanical(c, mechanicalCommits))
  return {
    datePublished: commits[0].date,
    // Every commit mechanical: report the first appearance rather than a date
    // implying an edit nobody made.
    dateModified: (substantive.length ? substantive[substantive.length - 1] : commits[0]).date,
  }
}

export function readOverrides() {
  const raw = JSON.parse(readFileSync(overridesPath, 'utf-8'))
  return {
    history: raw.history ?? {},
    mechanicalCommits: raw.mechanicalCommits ?? {},
    dates: raw.dates ?? {},
  }
}

/**
 * Every page key the generators look up, plus the __datafile__ keys.
 *
 * Fails rather than falling back. Each consumer used to carry its own `??`
 * default — three different ones, one of them the site relaunch date — so a
 * missing entry produced a plausible date instead of a failure. That is the
 * same silent-default class as the og:type and PERMIT_REQUIRED defaults this
 * phase removed.
 */
const SERVICE_PREFIX = '__service__'

/** One service page's dates: its own override if it has one, else services.js's. */
export function serviceDates(dates, service) {
  return dates[`${SERVICE_PREFIX}${service.id}`] ?? dates['__datafile__src/data/services.js']
}

export function contentDates() {
  const { history, mechanicalCommits, dates: literal } = readOverrides()
  const result = {}
  const missing = []

  const pageKeys = [...HAND_AUTHORED_PAGES, ...CALCULATOR_PAGES_META].map((p) => p.file)
  for (const key of pageKeys) {
    if (literal[key]) {
      result[key] = { datePublished: literal[key].datePublished, dateModified: literal[key].dateModified }
      continue
    }
    const paths = [`src/templates/${key}`, ...(history[key] ?? [])]
    const d = datesFrom(paths, mechanicalCommits)
    if (!d) missing.push(`${key} (looked in ${paths.join(', ')})`)
    else result[key] = d
  }

  for (const dataFile of DATA_FILES) {
    const key = `__datafile__${dataFile}`
    if (literal[key]) {
      result[key] = { datePublished: literal[key].datePublished, dateModified: literal[key].dateModified }
      continue
    }
    const d = datesFrom([dataFile, ...(history[key] ?? [])], mechanicalCommits)
    if (!d) missing.push(`${key}`)
    else result[key] = d
  }

  // Per-service dates (Phase 6.3). See the header, point 3: git cannot tell
  // which service inside services.js changed, so all sixteen share one pair.
  // A `__service__<id>` entry in the overrides file corrects one service; a
  // field it leaves out falls back to the shared pair. Read them through
  // serviceDates(), never by key.
  const shared = result[`__datafile__src/data/services.js`]
  const ids = new Set(SERVICES.map((s) => s.id))
  for (const [key, value] of Object.entries(literal)) {
    if (!key.startsWith(SERVICE_PREFIX)) continue
    const id = key.slice(SERVICE_PREFIX.length)
    if (!ids.has(id)) missing.push(`${key} (no service has id '${id}')`)
    else if (shared) result[key] = { datePublished: value.datePublished ?? shared.datePublished, dateModified: value.dateModified ?? shared.dateModified }
  }

  if (missing.length) {
    throw new Error(
      'content-dates: git returned no history for:\n  ' +
        missing.join('\n  ') +
        '\n\nIf this is CI, the checkout is shallow — actions/checkout needs fetch-depth: 0. ' +
        'If a page is genuinely new, add it to "dates" in src/data/content-date-overrides.json.'
    )
  }

  return result
}
