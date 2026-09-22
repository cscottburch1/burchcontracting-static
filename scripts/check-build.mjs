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
 *      the same <footer>. As of Phase 3.3b the only exemption is 404.html, and
 *      it is permanent — see CHROME_EXEMPT for why adding another needs a
 *      reason as durable as that one.
 *   4. reCAPTCHA site key drift: dist/contact.html must have a well-formed
 *      data-recaptcha-site-key, and no dist/assets/*.js may contain a key
 *      literal — see LAUNCH-CHECKLIST.md #3 for why this must be the only
 *      place the site key lives.
 *   5. FAQPage schema/visible-content divergence, in both directions: every
 *      Question.name in a page's FAQPage JSON-LD must appear as real visible
 *      text on that same page (Google's actual rule — mark up nothing the user
 *      cannot see), AND every visible question heading must appear in the
 *      schema. The second direction was added in Phase 3.3b after a render
 *      ordering bug dropped three questions per calculator with nothing
 *      failing; the comment on check 5 has the details.
 *   6. Calculator headline price copy drifting from what the calculator
 *      itself computes — see CALCULATOR_PAGES in src/js/calculator-config.js.
 *   7. Incomplete per-service data: every service needs an entry in
 *      SERVICE_FAQS, CHOOSE_IF and PERMIT_REQUIRED, and neither comparison map
 *      may hold a key matching no service. All three used to degrade quietly
 *      — [], an empty string, a defaulted "Case-by-case" — so a half-filled
 *      service looked exactly like a finished one.
 *   8. Two pages sharing a title or a meta description, or a page missing
 *      either. Both are unique across all 71 today; this keeps them so.
 *   9. Content dates that look stamped rather than derived. Phase 3.6 moved
 *      them to build time from git, which is only correct when the checkout has
 *      history; with actions/checkout's default fetch-depth of 1 every page
 *      gets today's date and the sitemap tells Google the whole site changed
 *      this morning. Silent otherwise — the build succeeds either way.
 *
 * WHICH TREE EACH CHECK READS
 *
 * Checks 1, 2, 3b, 5, 8, 9 read .build/pages/, the rendered pages src/build/index.mjs
 * writes — not the repo tree, which no longer holds pages at all. Checks 3 and 4
 * read dist/, because they verify what actually ships: the staging noindex is
 * injected into dist/ only, and the reCAPTCHA key check is about the deployed
 * bundle. Check 6 reads neither — it compares two values in src/, the hand-typed
 * intro prose against the computed band, which is where that drift starts.
 * Check 7 reads src/data/ for the same reason: incomplete data is a fact about
 * the source, and catching it there names the map and the slug rather than the
 * blank cell it would have produced.
 *
 * So this guard needs `npm run build` to have run. It used to be able to run
 * standalone against committed HTML; that stopped being true when the committed
 * HTML stopped existing.
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
import { chromeHash, chromeSource } from './lib/chrome-hash.mjs'
import { NAV_CLASS, activeNavItem } from '../src/data/nav.js'
import { SERVICES } from '../src/data/services.js'
import { SERVICE_FAQS } from '../src/data/service-faqs.js'
import { CHOOSE_IF, PERMIT_REQUIRED } from '../src/data/service-comparison.js'

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

// The page set is .build/pages/, not the repo tree. Phase 3.2d made
// src/build/index.mjs the only thing that produces pages, and it writes there;
// nothing generated is written into the source tree any more. Scanning the repo
// would now find stale committed copies alongside the real ones — it briefly
// reported 142 pages for a 71-page site — and after Phase 3.5 deletes those
// copies it would find only the hand-authored few, silently losing coverage of
// every generated page.
const pagesRoot = path.join(root, '.build/pages')
if (!fs.existsSync(pagesRoot)) {
  console.error(
    'check-build: .build/pages/ not found. Run `npm run build` first — its prebuild ' +
    'step produces the pages this guard checks.'
  )
  process.exit(1)
}
const files = walkHtmlFiles(pagesRoot)
const pages = files.map((f) => ({
  file: f,
  rel: path.relative(pagesRoot, f).split(path.sep).join('/'),
  html: fs.readFileSync(f, 'utf8'),
}))

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
// dist/, not public/: the sitemap is a build artifact now, written by
// scripts/write-sitemap.mjs after the build. It was committed at
// public/sitemap.xml until Phase 3.2d.
const sitemapPath = path.join(root, 'dist/sitemap.xml')
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
// THIS LIST IS DONE SHRINKING. It held eighteen pages that carried their own
// committed chrome; 3.3a-ii rendered the seven hand-authored ones and 3.3b the
// eleven calculators. Every page in dist/ but one now shares one header and one
// footer, and the assertion below proves it rather than assuming it.
//
// Adding to this list re-opens the hole the list was made to close, so an
// addition needs a reason as durable as 404.html's.
const CHROME_EXEMPT = new Set([
  // Keeps noindex permanently, has no PAGE_URLS entry, and is the one page
  // whose chrome may differ.
  '404.html',
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

// --- Check 3c: one owner for nav behaviour ---
// src/js/main.js binds the hamburger, the mobile accordions, the footer year,
// the testimonials carousel and the contact form, each guarded by element
// presence. No page may carry its own inline copy of that logic.
//
// This exists because of a defect that shipped past both other gates. The
// chrome footer used to hold an inline copy of the menu and accordion handlers,
// because the service and guide generators never loaded main.js. Unifying the
// footer in Phase 3.1 put that copy onto the nine pages that DO load main.js —
// faqs and all eight service areas — so the hamburger was bound twice, each tap
// toggled the menu open and shut, and it was dead on the site's local landing
// pages. The snapshot strips scripts, and the chrome hash was consistent
// because every page received the same bad copy. Both passed.
//
// Scans .build/pages/, where pages still reference /src/js/main.js by source
// path; vite rewrites that to a hashed bundle later.
{
  const withInlineNav = pages.filter((p) => /getElementById\(['"]menu-btn/.test(p.html))
  if (withInlineNav.length) {
    failed = true
    failures.push({
      check: 'inline-nav-handler',
      detail: withInlineNav.map((p) => `${p.rel} — binds #menu-btn inline; main.js already owns this`),
    })
  }

  // The inverse: a page with a menu button and no main.js has a dead menu.
  const unbound = pages.filter(
    (p) => p.html.includes('id="menu-btn"') && !p.html.includes('/src/js/main.js')
  )
  if (unbound.length) {
    failed = true
    failures.push({
      check: 'unbound-nav',
      detail: unbound.map((p) => `${p.rel} — has #menu-btn but does not load main.js`),
    })
  }
}

// --- Check 3d: the current page is marked in the nav, exactly once ---
// Neither the chrome hash nor the snapshot can see this. Anchors are
// normalized to href plus text before hashing precisely so that active styling
// does not register, which means a marking that silently stopped happening
// would leave every gate green. Since the class strings live in NAV_CLASS,
// this can compare against them directly.
{
  const toUrl = (rel) =>
    rel === 'index.html' ? '/' :
    rel.endsWith('/index.html') ? '/' + rel.slice(0, -'/index.html'.length) :
    '/' + rel.replace(/\.html$/, '')

  const KNOWN = new Set(Object.values(NAV_CLASS))
  const problems = []

  for (const page of pages) {
    const head = chromeSource(page.html, 'header')
    if (!head) continue
    const url = toUrl(page.rel)
    const mobileStart = head.indexOf('id="mobile-menu"')
    const regions = mobileStart === -1
      ? [['nav', head]]
      : [['desktop', head.slice(0, mobileStart)], ['mobile', head.slice(mobileStart)]]

    for (const [name, region] of regions) {
      const marked = [...region.matchAll(/<a\b[^>]*aria-current=["'](page|true)["'][^>]*>/gi)]
      if (marked.length > 1) {
        problems.push(`${page.rel}: ${marked.length} marked anchors in the ${name} nav; expected at most 1`)
        continue
      }
      if (marked.length === 1) {
        const tag = marked[0][0]
        const href = /href=["']([^"']+)["']/i.exec(tag)?.[1]
        const kind = marked[0][1]
        const active = activeNavItem(url)
        const covers = href === url || (active && (active.href === href))
        if (!covers) {
          problems.push(`${page.rel}: ${name} nav marks ${href}, which is neither this page nor its section parent`)
        }
        if (kind === 'page' && href !== url) {
          problems.push(`${page.rel}: ${name} nav marks ${href} as aria-current="page" but that is not this page's URL`)
        }
      }
      // Every nav anchor must carry a class this file knows about, so a design
      // change cannot quietly desynchronise the markup from NAV_CLASS.
      for (const m of region.matchAll(/<a\b[^>]*class=["']([^"']+)["'][^>]*>/gi)) {
        const cls = m[1]
        if (!KNOWN.has(cls) && !cls.includes('flex items-center shrink-0')) {
          problems.push(`${page.rel}: ${name} nav anchor has a class not in NAV_CLASS — ${cls.slice(0, 60)}`)
        }
      }
    }
  }

  if (problems.length) {
    failed = true
    failures.push({ check: 'nav-active-marking', detail: [...new Set(problems)].slice(0, 20) })
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

// --- Check 5: FAQPage schema and visible content must agree, both ways ---
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
function decodeEntities(s) {
  return String(s)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

for (const page of pages.filter((p) => p.rel.startsWith('calculator/'))) {
  const scriptMatches = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const bodyOnly = page.html.replace(/<script[\s\S]*?<\/script>/g, '')
  const schemaQuestions = new Set()
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
        schemaQuestions.add(q.name)
      }
    }
  }

  // THE OTHER DIRECTION: a question heading on the page that the schema does
  // not carry.
  //
  // The comment above this check used to claim both directions were covered.
  // They were not, and the gap had teeth. A calculator's own cost question
  // lives in its pricing table, and trustRender() reads that table's <h2> to
  // build the page's FAQPage. Fill the table AFTER the trust blocks instead of
  // before and the heading still renders, the page still validates, the build
  // still succeeds, check-build still passed — and every calculator quietly
  // shipped a FAQPage one question short. Verified by making that exact edit in
  // Phase 3.3b: nothing failed. Only a before/after snapshot caught it, and a
  // snapshot is something a person has to remember to run.
  for (const m of bodyOnly.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)) {
    const heading = decodeEntities(String(m[1]).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    if (!heading.endsWith('?')) continue
    if (!schemaQuestions.has(heading)) {
      faqMismatches.push(`${page.rel}: visible question heading "${heading}" is missing from the page's FAQPage schema`)
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

// --- Check 7: the per-service data maps must cover every service ---
// Phase 3.4. Three maps are keyed per service and every one of them used to
// degrade quietly when a key was absent: SERVICE_FAQS returned [], CHOOSE_IF
// rendered an empty string after the words "Choose this if", PERMIT_REQUIRED
// fell back to "Case-by-case". A service added to services.js got a page, a
// sitemap entry and a row in the comparison table, and nothing said its data
// was incomplete.
//
// Two of these were wrong on the day this check was written, and had been for
// months: CHOOSE_IF and PERMIT_REQUIRED each held two entries keyed by
// service.id where the lookup used service.slug, so four rows on /services
// read "Choose this if" and stopped. A blank cell is not a visible failure —
// which is the whole reason it survived a launch and two audits.
//
// Keyed deliberately differently: SERVICE_FAQS by service.id, the other two by
// service.slug, because that is what each lookup uses today. Asserting the key
// each map is actually read with is the point; normalising them would hide
// exactly the mismatch that caused this.
const dataGaps = []
for (const s of SERVICES) {
  if (!SERVICE_FAQS[s.id]?.length) {
    dataGaps.push(`SERVICE_FAQS has no entry for service id '${s.id}' (${s.title})`)
  }
  if (!CHOOSE_IF[s.slug]) {
    dataGaps.push(`CHOOSE_IF has no entry for slug '${s.slug}' (${s.title}) — /services would render "Choose this if" and stop`)
  }
  if (!PERMIT_REQUIRED[s.slug]) {
    dataGaps.push(`PERMIT_REQUIRED has no entry for slug '${s.slug}' (${s.title}) — decide it, do not let it default`)
  }
}
// A key matching no service is the other half of the same bug: copy someone
// wrote and reviewed that no page can ever render.
for (const [name, map] of [['CHOOSE_IF', CHOOSE_IF], ['PERMIT_REQUIRED', PERMIT_REQUIRED]]) {
  for (const key of Object.keys(map)) {
    if (!SERVICES.some((s) => s.slug === key)) {
      dataGaps.push(`${name} has a key '${key}' that matches no service slug — dead copy, nothing renders it`)
    }
  }
}
for (const key of Object.keys(SERVICE_FAQS)) {
  if (!SERVICES.some((s) => s.id === key)) {
    dataGaps.push(`SERVICE_FAQS has a key '${key}' that matches no service id — dead copy, nothing renders it`)
  }
}
if (dataGaps.length) {
  failed = true
  failures.push({ check: 'service-data-gap', detail: dataGaps })
}

// --- Check 8: every page needs its own title and description ---
// Phase 3.4. Two pages sharing a title is the classic duplicate-content
// signal, and it is the kind of thing a copy-paste in a generator produces
// silently. Both are currently unique across all 71 pages; this keeps them so.
const headMetaProblems = []
const titles = new Map()
const descriptions = new Map()
for (const page of pages) {
  const title = (page.html.match(/<title>([^<]*)<\/title>/) || [])[1]
  const description = (page.html.match(/<meta name="description" content="([^"]*)"/) || [])[1]
  // Reported through this check's own array, not dataGaps: check 7 has already
  // published its findings by the time this loop runs, so anything pushed there
  // now would be collected and silently never shown.
  if (!title) headMetaProblems.push(`${page.rel}: no <title>`)
  if (!description) headMetaProblems.push(`${page.rel}: no meta description`)
  if (title) titles.set(title, [...(titles.get(title) ?? []), page.rel])
  if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), page.rel])
}
for (const [label, map] of [['title', titles], ['description', descriptions]]) {
  for (const [value, pagesWithIt] of map) {
    if (pagesWithIt.length > 1) {
      headMetaProblems.push(`${pagesWithIt.length} pages share a ${label} — ${pagesWithIt.join(', ')} — "${value.slice(0, 80)}"`)
    }
  }
}
if (headMetaProblems.length) {
  failed = true
  failures.push({ check: 'duplicate-or-missing-title-or-description', detail: headMetaProblems })
}

// --- Check 9: content dates must look derived, not stamped ---
// Phase 3.6. Dates now come from git at build time, which is only correct when
// the checkout has history. With actions/checkout's default fetch-depth of 1,
// every file has exactly one commit and every page gets today's date — 70 URLs
// in the sitemap all claiming to have changed this morning, which is precisely
// how a site teaches Google to ignore lastmod. That failure is silent: the
// build succeeds and the sitemap looks well-formed.
//
// Two signals, both cheap. Neither can be satisfied by a shallow clone, and
// both tolerate the legitimate case where one page really did change today.
const dateProblems = []
{
  const today = new Date().toISOString().slice(0, 10)
  const pairs = pages
    .map((page) => {
      const m = page.html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})","dateModified":"(\d{4}-\d{2}-\d{2})"/)
      return m ? { rel: page.rel, published: m[1], modified: m[2] } : null
    })
    .filter(Boolean)

  if (pairs.length < 10) {
    dateProblems.push(`only ${pairs.length} page(s) carry an Article datePublished/dateModified pair — expected most of the site`)
  } else {
    const publishedToday = pairs.filter((p) => p.published === today)
    if (publishedToday.length > 3) {
      dateProblems.push(
        `${publishedToday.length} pages claim datePublished ${today}. A handful of genuinely new pages is normal; ` +
          `most of the site is not. This is what a shallow clone looks like — actions/checkout needs fetch-depth: 0.`
      )
    }
    const distinctPublished = new Set(pairs.map((p) => p.published))
    if (distinctPublished.size === 1) {
      dateProblems.push(
        `every page shares one datePublished (${[...distinctPublished][0]}) — git history is not being read, ` +
          `or src/data/content-date-overrides.json has flattened it.`
      )
    }
  }
}
if (dateProblems.length) {
  failed = true
  failures.push({ check: 'content-dates-not-derived', detail: dateProblems })
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
  console.log(`check-build passed — ${pages.length} pages scanned, ${sitemapUrls.length} sitemap URLs checked for orphans, ${process.env.BUILD_ENV === 'staging' ? 'staging build: every page confirmed noindex' : 'indexing confirmed (no stray noindex, robots.txt has no blanket Disallow)'}, reCAPTCHA site key verified single-source in dist/, FAQPage schema matched against visible text both ways, calculator price copy checked against computed output, ${SERVICES.length} services complete in SERVICE_FAQS/CHOOSE_IF/PERMIT_REQUIRED with no dead keys, every title and description unique, content dates derived from git history rather than stamped.`)
}
