/**
 * Which pages will tell Google they changed today, because of HEAD.
 *
 * Run it before pushing. It prints every page whose dateModified is set by the
 * current HEAD commit, so the author can answer one question while they still
 * can: did these pages actually change?
 *
 * WHY THIS EXISTS
 *
 * dateModified comes from git, and git cannot tell a real edit from a
 * mechanical one. The declared answer is a `Content-Change: none` trailer on
 * the commit, or an entry in src/data/content-date-overrides.json. Both depend
 * on someone remembering, and the very first commit to use the mechanism forgot:
 * db21e9c renamed a path in three comment lines of src/data/geo-aeo.js, which
 * made it the newest substantive touch on that data file, and /faqs plus all
 * eight service-area pages shipped claiming they changed that morning.
 *
 * It is deliberately NOT a gate. check-build's check 9 catches the shape of a
 * shallow clone — most of the site claiming today — and nine pages out of
 * seventy is under that threshold for good reason: nine genuinely edited pages
 * is an ordinary day. There is no threshold that separates "nine pages changed"
 * from "nine pages did not change", because the difference is not in the data.
 * So this reports, and a person decides.
 *
 *   node scripts/dates-set-by-head.mjs
 *
 * It inspects HEAD and nothing else, and takes no arguments. Asking about an
 * older commit would mean recomputing every date as of that commit, which is a
 * different question from the one this answers: what is about to be pushed.
 *
 * If the list is wrong, either add `Content-Change: none` to the commit message
 * (amend, if it is not pushed) or add the hash to `mechanicalCommits` in
 * src/data/content-date-overrides.json with a reason. Note that a date can
 * resolve to today from an EARLIER commit than HEAD — that is the case this is
 * most useful for, and the report says so rather than treating HEAD's own
 * trailer as the end of the matter.
 */
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

import { contentDates, readOverrides } from '../src/build/content-dates.mjs'
import { sitemapEntries } from '../src/build/geo.mjs'

const root = resolve(import.meta.dirname, '..')

// HEAD only, deliberately. contentDates() reads the history reachable from the
// working tree, so asking about an older commit would mean recomputing every
// date as of that commit — a different and much larger question than the one
// this answers, which is "what is about to be pushed".
if (process.argv.length > 2) {
  console.error('dates-set-by-head: takes no arguments; it inspects HEAD only.')
  process.exit(2)
}

function git(args) {
  return execFileSync('git', args, { cwd: root }).toString().trim()
}

const head = git(['rev-parse', 'HEAD'])
const shortHead = head.slice(0, 7)
const subject = git(['log', '-1', '--format=%s'])
const body = git(['log', '-1', '--format=%B'])

const hasTrailer = /^Content-Change:\s*none\s*$/im.test(body)
const { mechanicalCommits } = readOverrides()
const seeded = Object.keys(mechanicalCommits).some((h) => head.startsWith(h))

const dates = contentDates()
const headDate = git(['log', '-1', '--format=%aI']).slice(0, 10)

// A page is "set by HEAD" when its dateModified equals HEAD's date. That is one
// commit's worth of resolution, which is all this needs: the question is only
// ever about the commit about to be pushed.
const affectedKeys = Object.entries(dates)
  .filter(([, d]) => d.dateModified === headDate)
  .map(([key]) => key)
  .sort()

/**
 * The URLs those keys actually reach.
 *
 * Reporting keys alone understates the damage, and understating it is how this
 * gets waved through: the defect that prompted this script showed up as one key,
 * __datafile__src/data/geo-aeo.js, which is nine live URLs. A person skims "1
 * entry" and moves on. They do not skim nine URLs.
 *
 * Computed through the same sitemapEntries() the sitemap itself uses, not read
 * from the last build's output. The first version read .build/sitemap.xml,
 * which meant a stale or absent artifact answered "no URLs" and the expansion
 * silently did nothing — the failure mode this whole script exists to report.
 */
const entries = sitemapEntries(dates)
const affectedUrls = entries.filter(([, d]) => d.dateModified === headDate).map(([path]) => path)

console.log(`HEAD ${shortHead}  ${headDate}  ${subject}`)
console.log(
  `marked mechanical: ${hasTrailer ? 'yes (Content-Change: none)' : seeded ? 'yes (listed in content-date-overrides.json)' : 'NO'}`
)
console.log()

if (!affectedKeys.length) {
  console.log('No page takes its dateModified from this commit.')
  process.exit(0)
}

console.log(`${affectedKeys.length} date entr${affectedKeys.length === 1 ? "y resolves" : "ies resolve"} to ${headDate}:`)
for (const key of affectedKeys) console.log(`  ${key}`)
console.log()

if (affectedUrls.length) {
  console.log(`${affectedUrls.length} URL(s) will carry lastmod ${headDate}:`)
  for (const url of affectedUrls) console.log(`  ${url}`)
  console.log()
}

if (hasTrailer || seeded) {
  // Not reassurance. HEAD is marked, so something EARLIER set these dates to
  // today — and if that commit was mechanical too, it is unmarked and these
  // pages are about to lie. This is the path that catches the previous commit's
  // mistake, which is when anyone would actually be running this.
  console.log('HEAD is marked mechanical, so an EARLIER commit set the dates above.')
  console.log(`Check what that commit was: git log --since=${headDate} --format='%h %s'`)
  console.log('If it did not change what a reader sees, add its hash to mechanicalCommits.')
} else {
  console.log(
    'Nothing marks this commit mechanical, so each of the above will tell Google it changed\n' +
      `on ${headDate}. If that is not true, add a "Content-Change: none" trailer to the commit\n` +
      'message, or add the hash to mechanicalCommits in src/data/content-date-overrides.json.'
  )
}
