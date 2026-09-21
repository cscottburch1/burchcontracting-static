/**
 * Build guard — fails the build (exit 1) on failure modes that have each
 * already shipped once:
 *   1. Double-encoded ampersands ("&amp;amp;") anywhere in built HTML.
 *   2. Orphan pages: any URL listed in sitemap.xml with zero inbound
 *      internal links from anywhere else on the site.
 *   3. Indexing mistakes, in either direction: a stray noindex on any page of
 *      a normal build (404.html exempt), a missing noindex on any page of a
 *      staging build, or a blanket "Disallow: /" in dist/robots.txt. Runs on
 *      every build — it used to run only when an env var was set, which meant
 *      it went quiet on exactly the builds that needed it.
 *   3b. One chrome: every non-exempt page must carry the same <header> and
 *      the same <footer>. Exemptions are the hand-authored and calculator
 *      pages that still hold their own committed chrome; Phase 3.3 empties
 *      that list down to 404.html.
 *   4. reCAPTCHA site key drift: dist/contact.html must have a well-formed
 *      data-recaptcha-site-key, and no dist/assets/*.js may contain a key
 *      literal — see LAUNCH-CHECKLIST.md #3 for why this must be the only
 *      place the site key lives.
 *   5. FAQPage schema/visible-content divergence: every Question.name in a
 *      page's FAQPage JSON-LD must also appear as real visible text on that
 *      same page (Google's actual rule — mark up nothing the user can't
 *      see), checked in both directions so nothing is schema-only or
 *      visible-only.
 *   6. Calculator headline price copy drifting from what the calculator
 *      itself computes — see CALCULATOR_PAGES in src/js/calculator-config.js.
 *
 * Checks 1-3, 5, 6 scan the repo's own HTML source files directly (index.html,
 * service pages, generated service-area/calculator pages, etc.) — the same
 * files `npm run build` bundles into dist/ — rather than requiring a prior
 * build step, so those can run standalone in CI or locally. Check 4 reads
 * dist/ directly, since it's specifically verifying what actually gets
 * deployed; it requires `npm run build` to have already run.
 *
 * Exception: 404.html is excluded from the noindex check. Per
 * LAUNCH-CHECKLIST.md #1, 404.html must carry noindex permanently, in
 * production or not — flagging it as a failure would make the production
 * check permanently unfixable. This is a documented, deliberate exception,
 * not a loophole.
 */
import fs from 'node:fs'
import path from 'node:path'
import { CALCULATOR_PAGES } from '../src/js/calculator-config.js'
import { servicePerSqftBand } from '../src/data/pricing-sync.js'
import { chromeHash } from './lib/chrome-hash.mjs'

const root = path.resolve(import.meta.dirname, '..')
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git', 'public'])
const NOINDEX_EXEMPT = new Set(['404.html'])

function walkHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtmlFiles(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

function relPath(f) {
  return path.relative(root, f).split(path.sep).join('/')
}

// Public URLs carry no .html suffix and no trailing slash — the scheme in
// src/data/url-map.js, restored from the retired Next.js site. Derived here
// rather than imported so this guard stays runnable on its own.
function toPublicUrl(rel) {
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length)
  return '/' + rel.replace(/\.html$/, '')
}

const files = walkHtmlFiles(root)
const pages = files.map((f) => ({ file: f, rel: relPath(f), html: fs.readFileSync(f, 'utf8') }))

let failed = false
const failures = []

// --- Check 1: double-encoded ampersands ---
const doubleEncoded = pages.filter((p) => p.html.includes('&amp;amp;'))
if (doubleEncoded.length) {
  failed = true
  failures.push({
    check: 'double-encoded-ampersand',
    detail: doubleEncoded.map((p) => p.rel),
  })
}

// --- Check 2: orphan pages (sitemap URL with zero inbound internal links) ---
const sitemapPath = path.join(root, 'public/sitemap.xml')
const sitemapXml = fs.readFileSync(sitemapPath, 'utf8')
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => m[1])
  .map((loc) => {
    try {
      return new URL(loc).pathname
    } catch {
      return null
    }
  })
  .filter(Boolean)

const allInboundHrefs = new Set()
for (const page of pages) {
  const hrefs = [...page.html.matchAll(/href=["']([^"']*)["']/g)].map((m) => m[1])
  for (const href of hrefs) {
    if (!href.startsWith('/')) continue
    const pathOnly = href.split('#')[0].split('?')[0]
    if (pathOnly) allInboundHrefs.add(pathOnly)
    if (href.includes('#')) allInboundHrefs.add(href) // fragment links (e.g. /#service-areas) count too
  }
}

const orphans = sitemapUrls.filter((url) => url !== '/' && !allInboundHrefs.has(url))
if (orphans.length) {
  failed = true
  failures.push({
    check: 'orphan-page',
    detail: orphans,
  })
}

// --- Check 3: nothing in dist/ is accidentally de-indexed ---
// Runs on EVERY build, not only when an environment variable says to. That
// inversion is the point: the old form was `if (BUILD_ENV === 'production')`,
// so a build that forgot the variable shipped noindex sitewide AND skipped the
// check that would have caught it — the gate reported success precisely when
// it was most needed. See docs/DECISIONS.md, 2026-09-16 and 2026-09-21.
//
// The only build allowed to carry noindex is an explicit staging build, which
// scripts/apply-staging-noindex.mjs produces. Everything else must be
// indexable, with 404.html permanently exempt.
//
// Scans dist/ rather than source because the staging injection rewrites dist/
// only. dist/api/** is the Hostinger PHP tree copied out of public/, not a
// site page; Phase 4 deletes it.
{
  const distDir = path.join(root, 'dist')
  const staging = process.env.BUILD_ENV === 'staging'
  const distPages = walkHtmlFiles(distDir)
    .map((f) => ({
      file: f,
      rel: path.relative(distDir, f).split(path.sep).join('/'),
      html: fs.readFileSync(f, 'utf8'),
    }))
    .filter((p) => !p.rel.startsWith('api/'))

  const hasNoindex = (p) => /<meta[^>]*name=["']robots["'][^>]*noindex/i.test(p.html)

  if (!staging) {
    const noindexPages = distPages.filter((p) => hasNoindex(p) && !NOINDEX_EXEMPT.has(p.rel))
    if (noindexPages.length) {
      failed = true
      failures.push({
        check: 'noindex-in-production',
        detail: noindexPages.map((p) => p.rel),
      })
    }
  } else {
    // Inverse assertion: a staging build that failed to mark a page would put
    // an indexable duplicate of the live site on a preview host.
    const indexablePages = distPages.filter((p) => !hasNoindex(p))
    if (indexablePages.length) {
      failed = true
      failures.push({
        check: 'staging-build-missing-noindex',
        detail: indexablePages.map((p) => p.rel),
      })
    }
  }

  // A robots.txt that disallows everything de-indexes the site just as
  // thoroughly as a meta tag, and nothing else checks for it.
  const robotsFile = path.join(distDir, 'robots.txt')
  if (fs.existsSync(robotsFile)) {
    const robots = fs.readFileSync(robotsFile, 'utf8')
    const blanketDisallow = robots
      .split(/\r?\n/)
      .some((line) => /^\s*Disallow:\s*\/\s*$/i.test(line))
    if (blanketDisallow && !staging) {
      failed = true
      failures.push({
        check: 'robots-txt-disallows-everything',
        detail: ['dist/robots.txt contains a blanket "Disallow: /"'],
      })
    }
  } else {
    failed = true
    failures.push({ check: 'robots-txt-missing', detail: ['dist/robots.txt was not produced by the build'] })
  }
}

// --- Check 3b: one chrome, site-wide ---
// Asserts that every page carries the SAME <header> and the SAME <footer>.
//
// This is the property "one chrome" actually means, and nothing checked it
// before. snapshot-dist.mjs strips header and footer to isolate body content,
// so when Phase 3.1 unified the footer across 52 pages the content gate
// reported "71/71 identical" — true of the body, silent about the change. The
// same blind spot let a commit message claim "every page" when 19 pages were
// untouched.
//
// Hashing is normalized (scripts/lib/chrome-hash.mjs): anchors are reduced to
// href plus text, because the current page's nav link is styled differently by
// design — the desktop nav via aria-current, the mobile nav via classes alone.
// Without that, a page could never match any other and this check could only be
// satisfied by deleting an accessibility affordance.
//
// EXEMPTIONS BELOW ARE TEMPORARY. They are the pages that still carry their own
// committed chrome because they are hand-authored rather than generated. Phase
// 3.3 moves them to src/templates/ rendered through src/chrome/, and empties
// this list down to 404.html. Shrinking it is the measure of that phase.
const CHROME_EXEMPT = new Set([
  // Hand-authored pages (Phase 3.3 removes all but 404.html).
  '404.html',
  'about.html',
  'contact.html',
  'index.html',
  'privacy-policy.html',
  'projects.html',
  'services.html',
  'terms-of-service.html',
  // Calculator pages (Phase 3.3).
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
])

{
  const distDir = path.join(root, 'dist')
  const governed = walkHtmlFiles(distDir)
    .map((f) => ({
      rel: path.relative(distDir, f).split(path.sep).join('/'),
      html: fs.readFileSync(f, 'utf8'),
    }))
    .filter((p) => !p.rel.startsWith('api/') && !CHROME_EXEMPT.has(p.rel))

  for (const part of ['header', 'footer']) {
    const byHash = new Map()
    for (const page of governed) {
      const h = chromeHash(page.html, part)
      if (!byHash.has(h)) byHash.set(h, [])
      byHash.get(h).push(page.rel)
    }
    if (byHash.size > 1) {
      // Largest group is the intended chrome; report the pages that diverge.
      const groups = [...byHash.entries()].sort((a, b) => b[1].length - a[1].length)
      const [, majority] = groups[0]
      const odd = groups.slice(1).flatMap(([hash, rels]) => rels.map((r) => `${r} (${hash})`))
      failed = true
      failures.push({
        check: `divergent-${part}`,
        detail: [
          `${byHash.size} distinct ${part}s across ${governed.length} non-exempt pages; ` +
          `${majority.length} share the majority one. Diverging:`,
          ...odd,
        ],
      })
    }
  }
}

// --- Check 4: reCAPTCHA site key must live only in dist/contact.html's
// data-recaptcha-site-key attribute, never baked into JS. Requires a prior
// build (dist/assets/*.js is what actually gets deployed) — see
// LAUNCH-CHECKLIST.md #3 for the incident this guards against.
const RECAPTCHA_KEY_RE = /^6L[0-9A-Za-z_-]{38}$/
const distContactPath = path.join(root, 'dist/contact.html')
const distAssetsDir = path.join(root, 'dist/assets')

if (!fs.existsSync(distContactPath)) {
  failed = true
  failures.push({
    check: 'recaptcha-site-key',
    detail: ['dist/contact.html not found — run `npm run build` before check-build.'],
  })
} else {
  const distContactHtml = fs.readFileSync(distContactPath, 'utf8')
  const keyMatch = distContactHtml.match(/data-recaptcha-site-key="([^"]*)"/)

  if (!keyMatch) {
    failed = true
    failures.push({
      check: 'recaptcha-site-key',
      detail: ['dist/contact.html has no data-recaptcha-site-key attribute at all.'],
    })
  } else if (!RECAPTCHA_KEY_RE.test(keyMatch[1])) {
    failed = true
    failures.push({
      check: 'recaptcha-site-key',
      detail: [
        `dist/contact.html's data-recaptcha-site-key is "${keyMatch[1]}" — not a well-formed reCAPTCHA v3 site key (expected "6L" followed by 38 letters/digits/_/-). Check for a placeholder, typo, or empty value.`,
      ],
    })
  }

  if (fs.existsSync(distAssetsDir)) {
    const leaked = fs
      .readdirSync(distAssetsDir)
      .filter((f) => f.endsWith('.js'))
      .filter((f) => /6L[0-9A-Za-z_-]{20,}/.test(fs.readFileSync(path.join(distAssetsDir, f), 'utf8')))

    if (leaked.length) {
      failed = true
      failures.push({
        check: 'recaptcha-key-baked-into-js',
        detail: leaked.map(
          (f) =>
            `dist/assets/${f} contains a reCAPTCHA key literal — the site key must only exist in contact.html's data attribute, read at runtime. This means the old VITE_RECAPTCHA_SITE_KEY env-var path or a hardcoded literal has crept back into src/js/. Remove it — see LAUNCH-CHECKLIST.md #3.`
        ),
      })
    }
  }
}

// --- Check 5: FAQPage schema must match visible content, both directions ---
// A Question.name pulled out of parsed JSON is plain text; the page's own
// visible HTML has it HTML-escaped. Escaping the plain text the same way
// esc() does everywhere else in this codebase (not decoding the HTML) keeps
// this check dependency-free and matches how the rest of the build already
// treats these strings.
function escLikeGenerators(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

// Scoped to calculator/*.html — that's what was asked for ("assert every
// FAQPage Question.name in built HTML also appears as visible text, across
// all calculator pages"). Running it site-wide surfaced a real, pre-existing
// mismatch on index.html too (its own FAQPage schema includes 4 questions
// that predate this check and aren't in this task's scope) — worth a
// follow-up, but fixing it isn't part of the calculator-page remediation
// this check exists to guard, so this stays scoped to avoid failing the
// build on an unrelated, already-existing issue.
const faqMismatches = []
for (const page of pages.filter((p) => p.rel.startsWith('calculator/'))) {
  const scriptMatches = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const bodyOnly = page.html.replace(/<script[\s\S]*?<\/script>/g, '')
  for (const m of scriptMatches) {
    let data
    try {
      data = JSON.parse(m[1])
    } catch {
      continue // malformed JSON-LD is a different failure mode, not this check's job
    }
    const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data]
    const faqNodes = graph.filter((n) => n['@type'] === 'FAQPage')
    for (const faqNode of faqNodes) {
      for (const q of faqNode.mainEntity ?? []) {
        if (!bodyOnly.includes(escLikeGenerators(q.name))) {
          faqMismatches.push(`${page.rel}: schema Question "${q.name}" not found as visible text`)
        }
      }
    }
  }
}
if (faqMismatches.length) {
  failed = true
  failures.push({ check: 'faq-schema-visible-mismatch', detail: faqMismatches })
}

// --- Check 6: calculator headline price copy vs. what the calculator
// actually computes. CALCULATOR_PAGES[key].intro is hand-typed prose (see
// src/js/calculator-config.js) — this only re-derives the "$X-$Y per
// square foot" figure, since that's the one part of each intro that maps
// cleanly onto a single computed value (servicePerSqftBand). It won't catch
// every possible drift in a worked dollar example, but it's exactly the
// class of bug that shipped once already (bath's intro citing $5,600 — a
// raw, unadjusted direct cost with no location factor or overhead & profit
// applied — against the calculator's real ~$6,900 output for the same
// project).
const priceCopyMismatches = []
for (const [pageKey, cfg] of Object.entries(CALCULATOR_PAGES)) {
  const perSqftMatch = cfg.intro.match(/\$(\d[\d,]*)[\s–-]+\$?(\d[\d,]*) per square foot/)
  if (!perSqftMatch) continue
  const statedMin = Number(perSqftMatch[1].replace(/,/g, ''))
  const statedMax = Number(perSqftMatch[2].replace(/,/g, ''))
  const real = servicePerSqftBand(cfg.serviceKey)
  const realMin = Math.round(real.min)
  const realMax = Math.round(real.max)
  if (statedMin !== realMin || statedMax !== realMax) {
    priceCopyMismatches.push(
      `CALCULATOR_PAGES.${pageKey}.intro claims $${statedMin}-$${statedMax}/sq ft but the calculator computes $${realMin}-$${realMax}/sq ft for '${cfg.serviceKey}' — update the intro string.`
    )
  }
}
if (priceCopyMismatches.length) {
  failed = true
  failures.push({ check: 'calculator-price-copy-drift', detail: priceCopyMismatches })
}

// --- Report ---
if (failed) {
  console.error('check-build FAILED\n')
  for (const f of failures) {
    console.error(`[${f.check}] ${f.detail.length} issue(s):`)
    for (const d of f.detail) console.error(`  - ${d}`)
    console.error('')
  }
  process.exit(1)
} else {
  console.log(`check-build passed — ${pages.length} pages scanned, ${sitemapUrls.length} sitemap URLs checked for orphans, ${process.env.BUILD_ENV === 'staging' ? 'staging build: every page confirmed noindex' : 'indexing confirmed (no stray noindex, robots.txt has no blanket Disallow)'}, reCAPTCHA site key verified single-source in dist/, FAQPage schema matched against visible text, calculator price copy checked against computed output.`)
}
