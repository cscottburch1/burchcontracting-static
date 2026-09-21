/**
 * Content-loss gate for the cleanup refactor.
 *
 * Captures what every built page *says* — not how it is spelled — so a
 * generator refactor can be proven not to have dropped anything. Run it once
 * before the work starts and again after each phase, then diff:
 *
 *   node scripts/snapshot-dist.mjs <out.json>     # default: <tmp>/snapshot-dist.json
 *   node scripts/snapshot-dist.mjs --diff <before.json> <after.json>
 *
 * Requires `npm run build` first; it reads dist/, never source.
 *
 * What is deliberately NOT captured, because the refactor is allowed to change
 * it and capturing it would make the gate cry wolf on every run:
 *   - whitespace, indentation, line endings (normalized away)
 *   - attribute order, and key order inside JSON-LD (deep-sorted)
 *   - the ORDER of internal links (compared as a set; Phase 6 reorders the nav)
 *   - <head> assets, hashed bundle filenames, <script>/<style> bodies
 *
 * What IS captured, because losing any of it is the failure this gate exists
 * to catch: visible body text with nav/footer stripped, the full set of JSON-LD
 * blocks, title/canonical/robots/description, internal links as BOTH a set and
 * a per-page total, and the page chrome as a link set plus a normalized hash.
 *
 * The chrome fields exist because of a miss. visibleText() strips <header> and
 * <footer>, so when Phase 3.1 rewrote the footer on 52 pages this gate reported
 * "71/71 identical" — correct about the body, silent about the only thing that
 * had changed. headerLinks/footerLinks/headerHash/footerHash close that, and
 * check-build asserts separately that every page carries the SAME chrome.
 *
 * Both link measures are kept because either alone has a blind spot. The set
 * ignores order, so a deliberate nav reordering passes — but it cannot see a
 * link lost in one place and re-added in another, since the set is unchanged.
 * The total catches that. Added after review, before Phase 3 rewrites every
 * generator, on the principle that the gate must be at full strength before the
 * risky phase rather than after it.
 *
 * Keyed by public URL from src/data/url-map.js rather than by file path, so the
 * Phase 1 flatten (which moves every file) does not invalidate the baseline.
 * 404.html is keyed as "unlisted:404.html" since it has no public URL by design.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { PAGE_URLS, UNLISTED_FILES } from '../src/data/url-map.js'
import { chromeHash, chromeSource } from './lib/chrome-hash.mjs'

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')

// --- extraction helpers -----------------------------------------------------

/** Strip a paired tag and everything inside it, repeatedly. */
function stripBlock(html, tag) {
  return html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi'), ' ')
}

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&middot;': '·', '&mdash;': '—', '&ndash;': '–',
}

function decodeEntities(text) {
  return text
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => {
      if (ENTITIES[m]) return ENTITIES[m]
      const num = /^&#(\d+);$/.exec(m)
      return num ? String.fromCodePoint(Number(num[1])) : m
    })
}

/**
 * Visible body text with the page chrome removed. Every generated page has
 * exactly one <header> and one <footer> (verified across all 71 dist pages), so
 * removing those plus <head> leaves the page's own content — including anything
 * that sits outside <main>, which taking <main> alone would silently drop.
 */
function visibleText(html) {
  let s = html
  for (const tag of ['head', 'header', 'footer', 'script', 'style', 'noscript', 'svg']) {
    s = stripBlock(s, tag)
  }
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  s = s.replace(/<[^>]+>/g, ' ')
  return decodeEntities(s).replace(/\s+/g, ' ').trim()
}

/** Recursively sort object keys so attribute order never shows up as a diff. */
function deepSort(value) {
  if (Array.isArray(value)) return value.map(deepSort)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, deepSort(value[k])]))
  }
  return value
}

function jsonLdBlocks(html, rel, problems) {
  const blocks = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html))) {
    try {
      blocks.push(deepSort(JSON.parse(decodeEntities(m[1]).trim())))
    } catch (err) {
      problems.push(`${rel}: JSON-LD block failed to parse — ${err.message}`)
    }
  }
  // Sorted by serialized form so block order in the document is not a diff.
  return blocks.map((b) => JSON.stringify(b)).sort()
}

function attr(html, re) {
  const m = re.exec(html)
  return m ? decodeEntities(m[1]).trim() : null
}

/**
 * Internal hrefs only: site-relative or same-origin.
 *
 * Returns both the deduped sorted SET and the raw TOTAL. The set is what keeps
 * the gate insensitive to link order, which Phase 6 changes on purpose when it
 * reorders the nav. But a set alone cannot see a link lost in one place and
 * re-added in another, or a repeated link that disappears — the count catches
 * exactly that. Kept as two fields so a deliberate reordering still passes
 * while a net loss does not.
 */
function internalLinks(html) {
  const unique = new Set()
  let total = 0
  const re = /href=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html))) {
    let href = decodeEntities(m[1]).trim()
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    if (href.startsWith('https://burchcontracting.com')) href = href.slice('https://burchcontracting.com'.length) || '/'
    if (/^[a-z]+:\/\//i.test(href)) continue
    // Build artifacts, not content links: vite content-hashes everything under
    // /assets/, so these change whenever the bundle does and say nothing about
    // whether a page lost a link. The header comment already promised these
    // were ignored; captured via href, they were not.
    if (href.startsWith('/assets/')) continue
    total++
    unique.add(href.split('#')[0] || '/')
  }
  return { unique: [...unique].sort(), total }
}

// --- walk -------------------------------------------------------------------

/**
 * dist/api/** is not part of the site. It is the legacy PHP tree (contact
 * handler, mailer library, the old admin panel, an email template) that vite copies
 * out of public/ wholesale. It reaches Cloudflare in the asset bundle but is
 * unreachable there: worker.js intercepts every /api/* request before any asset
 * lookup and api.js 404s unknown routes. Phase 4 deletes public/api/ outright.
 * Excluded here so the content gate tracks pages, not an email template.
 */
const EXCLUDED_PREFIXES = ['api/']

function walk(dir) {
  const found = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walk(full))
    else if (entry.name.endsWith('.html')) found.push(full)
  }
  return found
}

function snapshot() {
  if (!fs.existsSync(distDir)) {
    console.error('snapshot-dist: dist/ not found — run `npm run build` first.')
    process.exit(1)
  }
  const problems = []
  const pages = {}
  const unlisted = new Set(UNLISTED_FILES)

  for (const file of walk(distDir).sort()) {
    const rel = path.relative(distDir, file).split(path.sep).join('/')
    if (EXCLUDED_PREFIXES.some((p) => rel.startsWith(p))) continue
    const html = fs.readFileSync(file, 'utf8')

    let key = PAGE_URLS[rel]
    if (!key) {
      if (unlisted.has(rel)) key = `unlisted:${rel}`
      else {
        problems.push(`${rel}: no entry in PAGE_URLS and not in UNLISTED_FILES — cannot key this page`)
        continue
      }
    }
    if (pages[key]) problems.push(`${key}: two dist files map to the same public URL`)

    const linkInfo = internalLinks(html)
    const headBlock = chromeSource(html, 'header')
    const footBlock = chromeSource(html, 'footer')
    pages[key] = {
      file: rel,
      title: attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      canonical: attr(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i),
      robots: attr(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i),
      description: attr(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i),
      jsonLd: jsonLdBlocks(html, rel, problems),
      links: linkInfo.unique,
      linkCount: linkInfo.total,
      headerLinks: headBlock ? internalLinks(headBlock).unique : [],
      headerHash: chromeHash(html, 'header'),
      footerLinks: footBlock ? internalLinks(footBlock).unique : [],
      footerHash: chromeHash(html, 'footer'),
      text: visibleText(html),
    }
  }
  return { pages, problems }
}

// --- diff -------------------------------------------------------------------

const FIELDS = ['title', 'canonical', 'robots', 'description', 'text']

function diff(beforeFile, afterFile) {
  const before = JSON.parse(fs.readFileSync(beforeFile, 'utf8')).pages
  const after = JSON.parse(fs.readFileSync(afterFile, 'utf8')).pages
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()

  const changes = []
  let identical = 0

  for (const key of keys) {
    const b = before[key]
    const a = after[key]
    if (!b) { changes.push(`+ ${key}: page ADDED`); continue }
    if (!a) { changes.push(`- ${key}: page REMOVED`); continue }

    const fieldDiffs = []
    for (const f of FIELDS) {
      if (b[f] === a[f]) continue
      if (f === 'text') {
        // Report size and a first divergence point rather than dumping the page.
        const at = [...b.text].findIndex((c, i) => c !== a.text[i])
        fieldDiffs.push(
          `text: ${b.text.length} -> ${a.text.length} chars; first difference at ~${at < 0 ? 'end' : at}\n` +
          `      before: ...${b.text.slice(Math.max(0, at - 60), at + 60)}...\n` +
          `      after:  ...${a.text.slice(Math.max(0, at - 60), at + 60)}...`
        )
      } else {
        fieldDiffs.push(`${f}:\n      before: ${b[f]}\n      after:  ${a[f]}`)
      }
    }
    const lost = b.jsonLd.filter((x) => !a.jsonLd.includes(x))
    const gained = a.jsonLd.filter((x) => !b.jsonLd.includes(x))
    if (lost.length) fieldDiffs.push(`jsonLd: ${lost.length} block(s) LOST — ${lost.map((s) => s.slice(0, 90)).join(' | ')}`)
    if (gained.length) fieldDiffs.push(`jsonLd: ${gained.length} block(s) added — ${gained.map((s) => s.slice(0, 90)).join(' | ')}`)

    const linksLost = b.links.filter((x) => !a.links.includes(x))
    const linksGained = a.links.filter((x) => !b.links.includes(x))
    if (linksLost.length) fieldDiffs.push(`links LOST (${linksLost.length}): ${linksLost.join(', ')}`)
    // Chrome, compared separately: visibleText() strips header and footer, so
    // without these a chrome change reads as "identical".
    for (const part of ['header', 'footer']) {
      // Same rule as linkCount: a baseline recorded before these fields existed
      // has nothing to compare, and treating "absent" as "empty" would report
      // every chrome link on every page as newly added. Re-record instead.
      if (!b[`${part}Links`] || !a[`${part}Links`]) continue
      const bl = b[`${part}Links`]
      const al = a[`${part}Links`]
      const lost = bl.filter((x) => !al.includes(x))
      const gained = al.filter((x) => !bl.includes(x))
      if (lost.length) fieldDiffs.push(`${part} links LOST (${lost.length}): ${lost.join(', ')}`)
      if (gained.length) fieldDiffs.push(`${part} links added (${gained.length}): ${gained.join(', ')}`)
      const bh = b[`${part}Hash`]
      const ah = a[`${part}Hash`]
      if (bh && ah && bh !== ah && !lost.length && !gained.length) {
        fieldDiffs.push(`${part} changed (same links): ${bh} -> ${ah}`)
      }
    }
    if (linksGained.length) fieldDiffs.push(`links added (${linksGained.length}): ${linksGained.join(', ')}`)
    // The set above is order-insensitive by design; the total catches a link
    // lost in one place and re-added in another, which the set cannot see.
    //
    // Compared only when BOTH sides have it. A baseline recorded before
    // linkCount existed has no total to compare, and falling back to
    // links.length would compare a UNIQUE count against a TOTAL and report a
    // difference on every page that repeats any link — a false alarm on the
    // one gate that must not cry wolf. Re-record the baseline instead.
    if (typeof b.linkCount === 'number' && typeof a.linkCount === 'number' && b.linkCount !== a.linkCount) {
      const delta = a.linkCount - b.linkCount
      fieldDiffs.push(`link COUNT: ${b.linkCount} -> ${a.linkCount} (${delta > 0 ? '+' : ''}${delta})`)
    }

    if (fieldDiffs.length) changes.push(`~ ${key}\n    ${fieldDiffs.join('\n    ')}`)
    else identical++
  }

  console.log(`snapshot-diff: ${keys.length} page(s); ${identical} identical, ${changes.length} changed.`)
  if (changes.length) {
    console.log(`\n${changes.join('\n')}`)
    process.exit(1)
  }
  console.log('No differences in text, JSON-LD, title, canonical, robots, description, or internal links.')
}

// --- main -------------------------------------------------------------------

const args = process.argv.slice(2)

if (args[0] === '--diff') {
  if (args.length < 3) {
    console.error('usage: node scripts/snapshot-dist.mjs --diff <before.json> <after.json>')
    process.exit(1)
  }
  diff(args[1], args[2])
} else {
  const outFile = args[0] ?? path.join(os.tmpdir(), 'snapshot-dist.json')
  const { pages, problems } = snapshot()
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify({ takenAt: new Date().toISOString(), pages }, null, 2))

  const counts = Object.values(pages)
  console.log(
    `snapshot-dist: ${counts.length} page(s) -> ${outFile}\n` +
    `  ${counts.reduce((n, p) => n + p.jsonLd.length, 0)} JSON-LD blocks, ` +
    `${counts.reduce((n, p) => n + p.links.length, 0)} unique internal links ` +
    `(${counts.reduce((n, p) => n + (p.linkCount ?? 0), 0)} total), ` +
    `${counts.reduce((n, p) => n + p.text.length, 0).toLocaleString()} chars of visible text`
  )
  if (problems.length) {
    console.error(`\nsnapshot-dist: ${problems.length} problem(s):\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
}
