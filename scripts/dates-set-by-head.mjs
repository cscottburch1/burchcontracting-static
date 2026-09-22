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
 * If the list is wrong, either add `Content-Change: none` to the commit message
 * (amend, if it is not pushed) or add the hash to `mechanicalCommits` in
 * src/data/content-date-overrides.json with a reason.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { contentDates, readOverrides } from '../src/build/content-dates.mjs'

const root = resolve(import.meta.dirname, '..')

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
 * The URLs those keys actually reach, read from the sitemap the last build
 * produced.
 *
 * Reporting keys alone understates the damage, and understating it is how this
 * gets waved through: the defect that prompted this script showed up as one key,
 * __datafile__src/data/geo-aeo.js, which is nine live URLs. A person skims "1
 * entry" and moves on. They do not skim nine URLs.
 */
const builtSitemap = resolve(root, '.build/sitemap.xml')
function urlsClaiming(date) {
  if (!existsSync(builtSitemap)) return null
  const xml = readFileSync(builtSitemap, 'utf-8')
  const out = []
  for (const m of xml.matchAll(/<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>/gs)) {
    if (m[2] === date) out.push(m[1])
  }
  return out
}
const affectedUrls = urlsClaiming(headDate)

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

if (affectedUrls === null) {
  console.log('Run `npm run prebuild` for the list of URLs these reach — a __datafile__ entry')
  console.log('is one line here and can be dozens of live pages.')
} else if (affectedUrls.length) {
  console.log(`${affectedUrls.length} URL(s) will carry lastmod ${headDate}:`)
  for (const url of affectedUrls) console.log(`  ${url}`)
}
console.log()

if (hasTrailer || seeded) {
  console.log('Marked mechanical, so these dates come from an earlier commit, not this one.')
} else {
  console.log(
    'Nothing marks this commit mechanical, so each of the above will tell Google it changed\n' +
      `on ${headDate}. If that is not true, add a "Content-Change: none" trailer to the commit\n` +
      'message, or add the hash to mechanicalCommits in src/data/content-date-overrides.json.'
  )
}
