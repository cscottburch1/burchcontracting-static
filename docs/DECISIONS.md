# Decisions

Dated, ADR-style entries. Every "we tried X and it broke" that used to live
scattered across audit reports, checklist appendices and script headers is
recorded here so it survives the documents being archived.

The full original documents are in `docs/archive/`, unedited. This file is the
index of *why*; those are the record of *what*.

**Rule for this file:** an entry is added when a decision is made or reversed,
never edited to look tidier after the fact. A reversal gets its own entry; the
entry it reverses stays.

---

## 2026-07-11 — Legacy URL redirects are mapped from real search data, not guessed

The retired Next.js site's URLs were mapped to their new equivalents using
actual Google Search Console click and impression data, not by pattern-matching
slugs. Where an old URL had no true equivalent, it redirects to the nearest
same-intent page rather than 404ing — e.g. an unmapped contact variant goes to
`/contact.html` because the intent is unambiguous.

**Why it matters:** the mapping looks arbitrary from the outside. It isn't;
each non-obvious entry has an impression count behind it. Before changing any
redirect, read `docs/archive/gsc-validation-notes.md` for that URL's evidence.

**Source:** `migration/gsc-validation-notes.md`, `migration/audit-report.md`.

---

## 2026-07-11 — robots.txt points at burchcontracting.com/sitemap.xml deliberately

Flagged in an early audit as a bug. It is not: this repo *becomes*
burchcontracting.com, so the absolute URL is correct both before and after
cutover. No fix needed.

**Source:** `migration/audit-report.md` §1.

---

## 2026-07-19 — The Next.js VPS build is frozen, not maintained

`cscottburch1/burch-contracting-vps-current` is the retired implementation. It
remains the reference for the page metadata that ranked before the migration,
and for nothing else. It is not deployed and not kept in sync.

---

## 2026-07-23 — The sitemap omits changefreq and priority

Google ignores both. Emitting them adds noise and invites drift between the
sitemap and reality. `lastmod` is the only per-URL signal kept, and it must be
a real per-page content date — a blanket build-date stamp on every URL is what
makes Google stop trusting the field across the whole file.

**Source:** `generateSitemap()` in `scripts/generate-geo-aeo.mjs`.

---

## 2026-08-05 — Content dates are precomputed and committed, not derived in CI

`scripts/compute-content-dates.mjs` derives per-page `datePublished` /
`dateModified` from git history on a developer machine and writes
`src/data/content-dates.js`, which is committed.

**Why not compute at build time:** the deploy workflow's checkout uses
`actions/checkout` at the default `fetch-depth: 1`. Only the tip commit exists
in CI, so a live `git log` would see exactly one commit per file and stamp
today's date on all 70 pages, every build.

**Superseded by the 2026-09-22 entry at the end of this file**, which moved the
computation into the build with `fetch-depth: 0` and stopped committing the
output.

---

## 2026-08-29 — public/sitemap.xml is generator-owned; hand-editing it is reverted

A task hand-restored `public/sitemap.xml` with static per-page dates plus
`changefreq`/`priority`. It was reverted.

**How the mistake happened, because it will happen again otherwise:** the
ownership check ran `npm run prebuild` on a clean tree, saw no diff, and
concluded no generator touches the file. Two things made that a false negative.
The check's `grep` for generator logic never searched for the literal string
`sitemap`, so it missed `generateSitemap()` in `generate-geo-aeo.mjs` entirely.
And the "no diff" result was a coincidence — the generator's own stale-dated
output happened to byte-match what was committed, so overwriting the file with
itself looked like no drift.

The uniform dates that looked like the regression were just `content-dates.js`
being stale. The fix was to refresh the dates and let the generator produce the
sitemap, not to hand-write the sitemap.

**Source:** `docs/archive/FINDINGS.md` #4, #5.

---

## 2026-08-29 — Vite build inputs are directory-scanned, never hand-listed

`calculator/covered-patios.html` shipped to production as a 404. The generator
wrote the source file, but it had no matching entry in `vite.config.js`'s input
list, so it never reached `dist/`. It worked in `npm run dev` (which needs no
input list) and passed the deploy's content-integrity check (which can only
compare files that made it into `dist/`), so nothing caught it until someone
opened the live URL.

Inputs are now discovered by scanning directories, and service inputs are
derived from the `SERVICES` data that drives the generator. A page can no
longer be generated and silently left out of the build.

**Source:** header comments in `vite.config.js`.

---

## 2026-08-29 — Mixed line endings produce phantom diffs after every build

Windows checkout (`core.autocrlf=true`) plus generators writing bare `\n`
produced mixed-EOL files, so `git status` reported ~40 hand-authored pages as
modified after every `prebuild` even when no content had changed. This made
tree-cleanliness useless as a signal.

**Resolved 2026-09-21 (Phase 1)** by `.gitattributes` with `* text=auto eol=lf`
plus a full `git add --renormalize`.

**Where the problem actually lived, established during review:** the stored
blobs were *already* all-LF before the fix (at `b292d1f`: 172 text files `i/lf`,
23 binary, 1 none). Nothing in the repository was mixed. The CRLF existed only
in the Windows *working tree*, created at checkout by `core.autocrlf`, and the
generators then wrote LF into those CRLF files.

So `git add --renormalize` was a no-op on content — it had nothing to convert —
and the real fix is `.gitattributes` forcing `eol=lf` on the **checkout** side,
which stops the mixture being created in the first place. Worth stating plainly
because the obvious reading of "we renormalized the repo" is that the stored
files changed, and they did not. Anyone auditing the Phase 1 diff should expect
content changes in exactly three renamed files (`README.md`'s path line,
`package.json`'s name and engines, and the lockfile name) and nowhere else.

**Source:** `docs/archive/FINDINGS.md` #3; blob-level check performed during the
Phases 0–2 review.

---

## 2026-08-29 — Known data gaps that render blank rather than failing

`src/build/trust-layer.mjs` (named `scripts/generate-trust-layer.mjs` at the
time) builds the "Compare All Services" table from a hand-maintained
`CHOOSE_IF` map keyed by service slug. `bathroom-remodeling`
was never added, so its row rendered "Choose this if" followed by nothing.
`kitchen-remodeling` inherited the same gap. `PERMIT_REQUIRED` defaults to
"Case-by-case", so it fails invisibly rather than visibly.

**Decision for the 2026-09-21 cleanup (Phase 3):** missing data fails the build
instead of rendering a blank.

**Source:** `docs/archive/FINDINGS.md` #2.

---

## 2026-08-29 — Content dates are per-data-file, not per-entry

All 16 services share one date pair keyed on `__datafile__src/data/services.js`,
because git tracks per-file history, not per-object. So every service added
after `services.js` was created shows that file's creation date as its own
`datePublished` — `kitchen-remodeling` claims 2026-07-02 when it was added
2026-08-29. `dateModified` is correct; `datePublished` is not.

**Source:** `docs/archive/FINDINGS.md` #7.

---

## 2026-08-16, 2026-08-29, 2026-09-21 — The legal-page date override has been lost three times

`compute-content-dates.mjs` uses `git log --follow` and cannot distinguish a
real content edit from a mechanical one. Three times now, a sitewide mechanical
commit (a nav link, a URL-map rewrite) has been the most recent touch on
`privacy-policy.html` and `terms-of-service.html`, bumping their `dateModified`
to a date on which their content did not change. Three times it has been
hand-reverted to 2026-07-23, and three times the next script run silently lost
it — the third time by someone who did not know the first two had happened.

**Decision:** stop relying on anyone remembering. A committed
`src/data/content-date-overrides.json`, applied last, survives a re-run.
Implemented in Phase 3.6.

**And lost a fourth time, on the first run of the replacement.** Moving the
computation to build time recomputed both pages from git and pushed them to
2026-09-11 again, before the overrides file had entries for them. Caught by
diffing the new output against the file it replaced, which is the only reason
it is not a fifth. Both pages are now pinned in that file with this history in
the `why` field.

**Source:** `docs/archive/FINDINGS.md` #8, and the header of `content-dates.js`.

---

## 2026-09-11 — Pages moved to a Cloudflare Worker because Hostinger 429s AI crawlers

Requesting a page directly from the Hostinger server, bypassing Cloudflare,
returned **200 to a browser and 429 to GPTBot**. The live site refused GPTBot
on 12 of 14 pages. Hostinger documents these limits as applying to all
customers and says they cannot be disabled per site. Neither Cloudflare's
dashboard nor Hostinger's CDN AI Audit surfaces them, because the refusal
happens on the web server behind both.

Pages are now served from `dist/` at Cloudflare's edge. DNS did not change; the
Worker attaches by route, and deleting the route sends traffic straight back to
Hostinger.

**Source:** `docs/archive/CLOUDFLARE-CUTOVER.md`.

---

## 2026-09-11 — Worker asset handling is fully manual, on purpose

`wrangler.jsonc` sets `html_handling: "none"` and `not_found_handling: "none"`
because the automatic modes redirect with 307s and would change live URLs.
`run_worker_first: true` because without it the asset server answers first:
`/about.html` is served as a file and can never 301 to `/about` — and a
`_redirects` rule for it would also rewrite the Worker's own asset lookups,
making `/about` redirect to itself.

**Source:** comments in `wrangler.jsonc`, `cloudflare/worker.js`.

---

## 2026-09-12 — The routing baseline was re-recorded from production; the "357" figure is stale

The original baseline was 357 URLs recorded from the live Hostinger site on
2026-09-11. It was re-recorded from production on 2026-09-12 and now holds
**402** entries, and `check-routing.mjs` generates and compares **481** paths
(built pages plus their `.html` and trailing-slash variants, legacy URLs, and
fixed probes). The 27 restored `/cost` and `/blog` entries were amended to 200
after `generate-guides.mjs` restored those pages.

**Why this is recorded:** "357" is quoted in `CLOUDFLARE-CUTOVER.md` and was
still being repeated in planning documents on 2026-09-21. The gate is "zero
differences", not a fixed count. Do not treat any of these numbers as the
assertion.

---

## 2026-09-16 — Never connect the Cloudflare dashboard Git integration to this repo

A Cloudflare-side Git integration (Workers & Pages → the Worker → Builds) was
connected. It deployed on every push, running a plain `npm run build` with no
`BUILD_ENV=production` and carrying none of the Worker secrets. Each push
shipped `noindex` on all 70 pages and wiped `ADMIN_USERNAME`,
`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `RESEND_API_KEY` and
`RECAPTCHA_SECRET_KEY` — taking down admin login and lead emails and silently
disabling the reCAPTCHA check while the contact form kept accepting
submissions.

It happened **three times in one day** before the cause was found, because
those deploys leave no GitHub Actions run to inspect. Disconnected the same day.

**The general rule:** one deployment path per host, and it must be one that
builds correctly and preserves secrets. A vendor's own Git integration always
looks like a convenience and always races whatever is already deploying.

---

## 2026-09-16 — `wrangler versions upload` + `versions deploy` drops secrets; use `wrangler deploy`

Tried the same day, to get a pre-promotion verification gate. The promoted
version came up with **no secrets at all** — all five wiped — despite what
`wrangler versions upload --help` implies. Plain `wrangler deploy` preserves
them. Reverted.

If a pre-promotion gate is wanted again, the secrets must be supplied to the
version explicitly (`--secrets-file`, sourced from CI secrets) and proven on a
preview URL before anything is promoted.

---

## 2026-09-16 — The noindex guard must not be toggleable by a variable

Before cutover, `check-build`'s noindex assertion keyed off a `STAGING_URL`
variable so it would not fail while deploying to a staging domain that
intentionally carried noindex. After cutover it was hardcoded: a variable that
both noindexes the live site *and* disables the guard that catches it is a
footgun, not a configuration option.

**Source:** comment in `.github/workflows/deploy.yml`.

---

## 2026-09-21 — `BUILD_ENV=production` is required on `check-build`, not just the build

The documented hand-deploy sequence ran the build with `BUILD_ENV=production`
and `check-build` without it. `check-build.mjs` reads `process.env.BUILD_ENV`
at its own runtime and cannot see what the previous command was run with, so
the bare form printed `noindex check skipped — not BUILD_ENV=production`, then
`check-build passed`, and exited 0 — reporting success while skipping the one
guard standing between a bad build and a site-wide noindex deploy.

Found by following the documented sequence literally. Both CI workflows always
set the variable on their check steps and were never affected; the hand
sequence was the only wrong copy, and since the push trigger was removed it is
the one in use.

**Superseded by the Phase 2 inversion below**, which removes the variable's
meaning entirely — but recorded because the failure mode (a gate that reports
success while skipping itself) is the kind worth recognizing again.

---

## 2026-09-21 — Cleanup: one source of truth

A single disciplined pass to leave the repo with one source of truth per fact,
one build, one deploy path, and gates that make the incidents above impossible
to repeat. One entry per phase follows as each lands.

### Phase 1 — Flatten, normalize, pin, archive

- The project moved from `burchcontracting-dev/` to the repository root. The
  nesting served no purpose and cost a `working-directory` line in every
  workflow, a `cache-dependency-path`, and a permanent ambiguity about which
  directory "the repo" meant.
- `.gitattributes` (`* text=auto eol=lf`) plus a full renormalize ends the
  phantom-diff class of bug recorded above.
- Node is pinned once, in `.nvmrc`, and every workflow reads it via
  `node-version-file`. `deploy.yml` had been on Node 20 while `cloudflare.yml`
  was on 22.
- Dated audits, reports and checklists moved to `docs/archive/` unedited. Their
  reasoning was harvested into this file first.

### Phase 2 — Safe-by-default indexing

The site is now indexable unless something explicitly says otherwise, instead
of de-indexed unless something explicitly says otherwise. Three layers:

1. Source pages and all three `seoHead()` emitters ship `index, follow`.
   `404.html` keeps `noindex` permanently.
2. `scripts/apply-staging-noindex.mjs` injects `noindex`, and only when
   `BUILD_ENV=staging`. It exits 1 rather than half-marking a staging build.
3. `cloudflare/worker.js` sends `X-Robots-Tag: noindex, nofollow` on any
   hostname that is not `burchcontracting.com`, covering `workers.dev` preview
   URLs that were previously protected only by canonical tags — a hint Google
   may ignore, where a header is a directive.

`check-build`'s indexing assertion now runs on every build rather than only
when an environment variable is set. The old form was the thing most worth
fixing: it went quiet on exactly the builds that needed it, so a forgotten
variable both caused the failure and suppressed its detection.

**`BUILD_ENV=production` no longer exists.** Nothing needs to be remembered for
a build to be correct.

**Known limit:** the `X-Robots-Tag` branch cannot be exercised through
`wrangler dev` — with a `routes` config, wrangler rewrites `request.url` to the
route host, so the Worker always sees `burchcontracting.com` locally whatever
`Host` is sent. It was proven by temporarily pointing `INDEXABLE_HOST` at a
non-matching value and watching the header appear. It still needs confirming on
a real `workers.dev` URL; Phase 5's post-deploy verification is the place.

### Review of Phases 0–2 — two gate strengthenings

An independent review re-ran every gate, regenerated the Phase 0 baseline from
`b292d1f`, and additionally diffed the raw `dist/` trees hash-insensitively.
Zero files differed; no defects found. Two improvements were adopted before
Phase 3 rather than after it, on the principle that the gate must be at full
strength *before* the phase that rewrites every generator:

- `snapshot-dist.mjs` now records a per-page internal-link **total** alongside
  the set. The set is order-insensitive so Phase 6's nav reordering passes, but
  it cannot see a link lost in one place and re-added in another. The count can.
- `applyIndexingPolicy` now preserves an existing `X-Robots-Tag` only when its
  value contains `noindex`, instead of whenever the header is merely present.
  Behaviourally identical today, since the only such header is `api.js`'s own
  `noindex` — but it no longer depends on that remaining true.

### Phase 3.1 + gate work — chrome unified, and the gate taught to see it

The three generators each carried their own chrome. Headers were byte-identical;
footers were not, and no one of the three was a superset — the service-area
pages, which are the local-SEO landing pages, carried the weakest footer on the
site at 8 internal links against a 26-link union. Unified to the union, so every
page gained links and none lost any.

Then the gate was extended to cover what it had just been blind to.
`snapshot-dist.mjs` strips header and footer to isolate body text, so when 3.1
rewrote the footer on 52 pages it reported "71/71 identical" — true of the body,
silent about the change. It now records per-page `headerLinks`, `footerLinks`
and normalized chrome hashes, and `check-build` asserts every non-exempt page
carries the same header and the same footer.

**Chrome hashes are normalized, and that is load-bearing.** The current page's
nav link is styled differently by design. A strict hash could therefore never
match across pages, and the obvious way to make it green would be deleting
`aria-current="page"` — trading an accessibility affordance for a passing check.
Anchors are reduced to href plus text instead: structure, targets and wording
are compared, link styling is not.

**Established while verifying a reviewer's correction:** the 52 generated pages
contain no `aria-current` inside `<header>` at all — all 52 occurrences are in
the breadcrumb. They do not mark the current page in the nav. Only four
hand-authored pages do.

### Decisions for Phase 3.3

- The chrome module emits `aria-current="page"` plus the active class on the
  matching top-level nav item for **every** page, in both the desktop and
  mobile navs. One change covers three gaps: the hand-authored pages keep the
  active state they have today when they move to templates, the mobile nav
  gains the affordance it never had, and the 52 generated pages gain active
  state they currently lack.

  **The marker goes on the `<a>`, never on a wrapper.** `normalizeChrome()`
  reduces anchors to href plus text, so `aria-current` and an active class on
  the anchor are invisible to the hash and every page keeps matching. Put them
  on a wrapping `<li>` or `<span>` and each page hashes differently by design,
  failing the divergent-header assertion on all 71. Verified both ways against
  a built page. An earlier note here claimed this change "will change the chrome
  hash on every page" — that is wrong, and believing it would have made a real
  defect look like the expected outcome. **After 3.3, a changed header hash on
  the generated pages is a defect.**
- **Done means `CHROME_EXEMPT` is exactly `['404.html']`.** Not smaller, not
  mostly empty — that list.
- Chrome-hash normalization stays as written. No class histogram.

### Note for Phase 7 — which gate reads which tree

`ARCHITECTURE.md` must state this explicitly, because a reviewer tampered with
the wrong tree and drew the wrong conclusion from it:

- `check-build` scans **`.build/pages/`** — pre-bundle source form, where pages
  still reference `/src/js/main.js` by path. Right layer for source-level
  assertions: inline nav handlers, `main.js` references, noindex meta.
- `snapshot-dist.mjs` reads **`dist/`** — post-bundle, where vite has hoisted
  module scripts into `<head>` and content-hashed the assets. Right layer for
  what actually ships.

Neither is sufficient alone. The double-bound menu existed pre-bundle as a
duplicate handler and post-bundle as two live listeners; a gate reading only one
tree sees half the picture. Anyone tampering to test a gate must tamper the tree
that gate reads.

### Phase 3.3 survey — two structural facts that shape the work

Established before writing any of it:

1. **`TRUST-LAYER-SCHEMA` sits outside `<main>`.** The other three marker pairs
   (BYLINE, ANSWERS, TABLE) are inside it. So extracting `<main>` alone silently
   drops each page's JSON-LD. The schema has to be carried separately, which
   `documentHead({ schema })` already supports.

2. **`header` is a const string, consumed in four places** — `documentHead()`
   (which is how the 27 guide pages get it), `geo.mjs` twice, and
   `services.mjs` once. Adding active nav state means it becomes a function
   taking the current URL, and all four call sites change. `documentHead()`
   already receives `canonical`, so the path is derivable there.

---

## 2026-09-22 — Missing per-service data fails the build instead of rendering blank

Three maps are keyed per service, and every one of them degraded quietly when a
key was absent: `SERVICE_FAQS` returned `[]`, `CHOOSE_IF` produced an empty
string after the words "Choose this if", `PERMIT_REQUIRED` fell back to
`?? 'Case-by-case'`. Add a service to `services.js` and it got a page, a sitemap
entry and a row in the comparison table on /services, with nothing anywhere
saying its data was half-finished.

The 2026-08-29 entry above recorded this for `bathroom-remodeling` and
`kitchen-remodeling`. It undercounted. `CHOOSE_IF` and `PERMIT_REQUIRED` each
held two entries keyed by `service.id` — `garages`, `additions` — while both
lookups used `service.slug`, so they matched nothing. Four rows on /services
read "Choose this if" and stopped, and two of those four had copy that had been
written, reviewed and then never rendered. In the output a dead key and a
missing key look identical, which is why it survived a launch and two audits.

**Decision.** `check-build` asserts, for all sixteen services, that every one has
an entry in all three maps, and that neither comparison map holds a key matching
no service. The `??` fallbacks are deleted, so a missing entry is a failed build
rather than a blank cell. Every `PERMIT_REQUIRED` value is written out,
including the twelve that were previously defaulting: "Case-by-case" is now a
decision on the record rather than the absence of one, and the two services the
map already said were "Yes" now render "Yes".

The maps moved to `src/data/service-comparison.js`. They are editorial data, and
a gate reaching into `src/build/` to assert their coverage had the dependency
pointing the wrong way.

**Also decided:** every page must have a title and a meta description, and no two
pages may share either. Both were already true across all 71 pages; the check
exists because a copy-paste in a generator is exactly how that stops being true,
silently.

**What this cost.** /services gained 406 characters of visible text: four filled
cells and two corrected permit values. The two new `CHOOSE_IF` lines are derived
from those services' own `description` and `intro` in `services.js`, asserting no
capability or number that page does not already state — the same rule the other
fourteen lines follow.

---

## 2026-09-22 — A gate is not tested until the tamper is proven to create the failure

Adding a gate and watching it pass proves nothing. The gate has to be shown
failing on the thing it exists to catch, and that means two separate assertions,
not one:

1. **The edit landed.** Re-read the file and confirm the change is there. A
   `sed` whose pattern does not match exits 0 and changes nothing.
2. **The edit created the failure condition.** Confirm the bad state actually
   exists — the duplicate is duplicated, the key is really absent, the two
   strings really are identical.

Step 2 is the one that gets skipped, and it was skipped here. The first test of
the duplicate-title gate (check 8) substituted `"Recent Projects | Burch
Contracting"` for about.html's title, intending to collide with projects.html.
The real title is `"Recent Projects | Burch Contracting Upstate SC"`. Two words
apart, no duplicate, no failure — and the gate looked fine. It was not: check 8
was pushing its findings into check 7's array, which had already been reported
by the time that loop ran, so a missing title would have been collected and
never shown. A correct test of a broken gate found the bug; the incorrect test
had reported success.

This is the same failure mode as the two regexes in Phase 3.3 that contained a
literal backspace where `\b` was intended. Both matched nothing, both were
"verified" by a run that passed, and a gate that cannot match anything passes
every time.

Related, from the earlier chrome work: a tamper must be applied to the tree the
gate actually reads. Tampering `dist/` to test a check that scans
`.build/pages/` also proves nothing, for the same reason.

**Phase 7:** this belongs in `RUNBOOK.md` under how to add a gate, as a
numbered procedure rather than a paragraph.

---

## 2026-09-22 — Content dates are computed at build time and passed to render(), not imported

Supersedes 2026-08-05 ("precomputed and committed") and closes the three-times-
lost legal-page override above.

`scripts/compute-content-dates.mjs` ran by hand and wrote a committed
`src/data/content-dates.js`, because CI checked out at `fetch-depth: 1` and a
live `git log` there would stamp today on all 70 pages. The workaround worked
and the discipline did not: nobody re-runs a script no gate asks for. At the
start of this cleanup the committed file was stale on 41 URLs and wrong on 27
more. Both workflows that build now use `fetch-depth: 0`, `content-dates.js` and
its generator are deleted, and `src/build/content-dates.mjs` derives dates every
build.

**Decision: `render({ dates })`, not an imported module.** Three reasons, in
order of weight:

1. An imported `content-dates.js` would have to be *generated into `src/`
   before the build could read it* — a build artifact in the source tree and a
   prebuild ordering constraint, which is exactly the pair of things Phases
   3.2d through 3.3b spent four commits removing. Reintroducing them for this
   one input would undo the shape of the whole phase.
2. Passing them keeps the generators pure. A generator can be rendered with any
   dates, so its output can be asserted without git — which matters because
   these five modules produce every page on the site and had no way to be
   tested in isolation before.
3. It puts the build's one global input in one place. `src/build/index.mjs`
   calls `contentDates()` once and hands the result to all four renderers and
   the sitemap. Previously each module imported it and applied its own
   fallback — three different ones, including two spellings of the site
   relaunch date — so a missing entry produced a different confident guess
   depending on which generator asked. Every fallback is now deleted: the
   computation throws instead.

The cost is real and worth naming: `renderSitemap()`, `serviceAreaPage()`,
`authorBox()`, `guidePage()`, `hubPage()` and `servicePage()` all gained a
parameter. `scripts/write-sitemap.mjs` would have needed a second call into git
to keep rendering the sitemap itself, so it copies `.build/sitemap.xml` instead —
which also ends a duplication nobody had noticed, where the build and the
post-build step each produced that file independently.

**What git cannot do, and what covers each gap.** Recorded in full in the header
of `src/build/content-dates.mjs`; in short, lineage across the 3.3 extractions
is declared rather than detected (git's rename detection failed, and at a lower
threshold matched `decks.html` to an unrelated file dated 2026-06-01 —
confidently wrong rather than obviously wrong); "did the substance change" is
declared via a `Content-Change: none` commit trailer plus a seed list, because
the conventional-commit type is not a good enough signal in this repo's own
history; and per-service dates remain a known limitation, since git tracks
files and not the objects inside them.

**Verified against the file it replaces:** 21 of 22 keys identical. The one
difference is deliberate — `services.js`'s `datePublished` moves from 2026-07-02
to 2026-06-01, correcting `FINDINGS.md` #7, where every service claimed the
data file's creation date and so looked newer than it was.

**A known gap, stated rather than half-fixed.** A page's content now lives in
two places — its template and its entry in `pages.js` or a data file — and only
the template's history is tracked. So `0607478`, which restored the home page's
social description by editing `pages.js`, does not move index.html's
`dateModified`. Widening the lineage to include those data files would bump all
seven hand-authored pages whenever any one of their titles changed, trading
under-reporting for over-reporting. Left as-is; the override file can correct
any specific page this matters for.

---

## 2026-09-22 — This repo is never squash-merged or rebase-merged

Content dates come from git. That makes the shape of the history a content
decision, and squashing destroys the shape.

A squash commit replaces every commit in a branch with one new commit that
touches every file the branch touched. It becomes the newest commit on every
path, so it becomes the newest touch on every template and every data file, so
every page on the site takes its `dateModified` from it. The sitemap then tells
Google that all seventy URLs changed on merge day. That is precisely the outcome
`check-build`'s check 9 exists to prevent, and a squash causes it from outside
the branch, after every gate has passed.

A `Content-Change: none` trailer cannot save it either, because a real PR
contains real content changes — PR #22 fills four blank cells on /services and
corrects sixteen `datePublished` values. The squash commit would be honestly
substantive and wrong about scope at the same time.

**Decision.** Merge commits only. On GitHub: Settings → General → Pull Requests,
uncheck "Allow squash merging" and "Allow rebase merging". This is an owner
action in the repository settings; nothing in this repo can enforce it, which is
why it is written down here and in `RUNBOOK.md` rather than added as a gate.

Rebase merging is excluded for the same reason in a quieter form: it rewrites
committer dates and can reorder what "newest" means on a path.

**How this was found.** By the smaller version of it happening. `db21e9c`, the
commit that introduced build-time dates, renamed a path in three comment lines
of `src/data/geo-aeo.js`. Mechanical, but it carried no trailer and could not
list its own hash in its own seed list, so /faqs and all eight service-area
pages shipped claiming they changed that morning — nine URLs. Check 9 did not
fire, correctly: nine of seventy is an ordinary day's editing, and no threshold
can tell "nine pages changed" from "nine pages did not", because the difference
is not in the data. A squash is the same bug at seventy pages.

`scripts/dates-set-by-head.mjs` reports which URLs take their `dateModified`
from HEAD, so the author sees the list before pushing. It is an aid, not a gate,
for the reason above.

---

## 2026-09-22 — Hostinger is retired as a web host; redirects are data, not an Apache file

Phase 4. Until now `public/.htaccess` was the single source of redirect rules
and security headers for a site with no Apache. The Worker imported it as text
and parsed it at startup, which cost a `wrangler.jsonc` `rules` entry to make
the import work, a parser carrying its own interpretation of `RewriteCond`
semantics, and a question nobody could answer quickly — does this rule apply on
Cloudflare or not? It also meant Hostinger's config could not be deleted without
breaking the live Worker.

The 161 legacy redirects are now `cloudflare/redirects.js` and the six security
headers `cloudflare/headers.js`, both plain data. They were produced by running
the parser and serialising its output, so they are by construction what shipped;
nothing was retyped. Equivalence was checked before anything was deleted: same
count, same order, same targets, and identical results across 2,445
(path, query) pairs covering every page URL, every moved URL, every legacy URL,
the routing baseline, and generated inputs for each capture-group pattern.

`cloudflare/htaccess.js` and the `rules` entry are gone with it.

**Deleted:** `public/.htaccess`, `public/api/` (the retired PHP contact handler,
PHPMailer, the old admin panel, an email template), `public/.assetsignore`
(which existed only to keep those two out of the Cloudflare upload), and
`.github/workflows/deploy.yml`, the FTP deploy.

**What Hostinger still is.** Not a web host. It remains the domain registrar and
the DNS origin, and holds an old mail store, until December 2026; email itself
moved to Google Workspace. `cloudflare/worker.js` still forwards
`/.well-known/*` to that origin for certificate renewal, deliberately, and that
is the only request path that reaches Hostinger.

**The consequence to understand before deploying.** Hostinger no longer receives
a copy of the site, so it is no longer a fallback. `wrangler.jsonc` says that
deleting the Worker route sends traffic straight back to Hostinger — that is
still true, and it is now the wrong thing to do: it would serve a copy frozen at
2026-09-22. **Rollback is `wrangler rollback` to a previous Worker version.**
Recorded here, in `.github/workflows/cloudflare.yml`, and in `README.md`, because
the old instruction is written in several places people will still find.

**Proof.** 481 paths checked against `migration/routing-baseline.json` (recorded
from live production 2026-09-12) via `wrangler dev`, before and after the
deletions: zero differences both times. Spot-checked the rules most likely to
break — the `REQUEST_FILENAME`-guarded `/calculator/*` catch-all, the exact-match
`greer` rule ordered before the generic service-area pattern, and `$1` capture
substitution — plus all six security headers on both a 200 and a 301, and that
no PHP source or schema is served at any of the seven paths that used to exist.

---

## 2026-09-22 — The mobile menu was checked by hand, at `c049e0c`

The double-bound mobile menu (`92f5094`: `main.js` became the only owner of nav
behaviour) could never be fully closed by a gate. `check-build` asserts there is
one handler in `.build/pages/` and the snapshot proves the markup is identical
across pages, but neither can see whether a tap opens the menu — that needs a
browser at phone width.

Checked by the owner at `c049e0c`, after Phases 3 and 4 had moved the chrome,
the calculators and the whole routing layer beneath it. Reported as fine.

**What this covers:** the home page, a service page, a service-area page and a
calculator, at phone width, menu opening and accordions expanding.

**What it does not:** it is a point-in-time observation, not a regression test.
The gates that can run every build already do; this closes the one item they
structurally cannot. If nav markup or `main.js` changes again, it needs
repeating — there is nothing in the repo that will notice.

---

## 2026-09-22 — One CI path, and a deploy that verifies itself or rolls back

Phase 5. `cloudflare.yml` did everything: it was the only workflow, it was
`workflow_dispatch`-only because deploy-on-push had caused an outage, and its
header had grown into a five-paragraph account of why. It is now two files.

`ci.yml` runs on every push and every pull request: build, `npm test`, upload
`dist/`. It deploys nothing.

`deploy.yml` is the only thing that deploys. Build, `npm test`, `wrangler
deploy`, then verification against production — the five secrets by name, the
new commit answering, five representative pages at 200 with `index, follow` and
their own canonical, `check-routing`, `check-crawler-access`, and a HEAD on both
contact endpoints returning 405. Any failure triggers `wrangler rollback` and
then fails the job, because a rolled-back deploy is a failed deploy.

**One deviation in the other direction.** The plan specified five
representative pages for post-deploy verification. The workflow being replaced
compared *every* built page byte-for-byte against the live response, and
dropping that to satisfy a spec that simply did not mention it would have been a
real loss of coverage. Both run: the five probes check what a human would
eyeball (status, `index, follow`, canonical), and the whole-site hash check
proves what shipped is what was built.

**`npm test` is one command, and the same one in both places.** `check-build`,
`check-schema`, `check-links`, `check-wrangler-config`, and `check-routing`
against a `wrangler dev` the runner starts and tears down itself — including the
`workerd` children, which survive killing the parent on Windows and then hold a
lock on `dist/` that makes the next build fail with `EPERM`. That happened twice
during this cleanup, and the second time a gate passed against a stale `dist/`.

**The noindex scan is not a separate script.** The plan listed it as one;
`check-build`'s check 3 already is it, in both directions plus the robots.txt
blanket-Disallow case. A second copy would be a second thing to keep in step,
and "one source of truth" applies to gates.

**The push trigger is written but commented out.** This is a deliberate
deviation from the plan, which asked for push-to-main. The verification and
rollback above are what would make that safe, and they have never run. Enabling
push now would make the first exercise of an unproven deploy path a real deploy
of whatever just merged — and what is about to merge is a 23-commit branch. The
workflow header and `RUNBOOK.md` both say: dispatch it once, confirm green,
then uncomment two lines. That is the owner's call, not a thing to assume.

**A gate that could not fail, caught before it shipped.** `check-schema`'s fifth
assertion was written as "every Service node's `url` is in the sitemap". No
Service node on this site has a `url` field, so it found nothing and reported
"0 Service URLs present" as a pass. It compares each Service page's canonical
against the sitemap now, and covers 24 pages. Written down because the first
draft looked exactly like a working check.

**A real defect the new gate found.** `check-schema` failed on its first run:
four of the home page's eight FAQPage questions were not visible text. Not
missing content — wording drift between the schema and the accordion, e.g. the
schema asked "How much does a screened porch cost in Simpsonville SC?" while the
page asked "...in Upstate SC?". `check-build`'s check 5 had recorded this as a
known, deferred, out-of-scope issue since it was scoped to calculators. The
schema now matches the visible text on all four. The reverse case is untouched
and allowed: the accordion asks "How much does a room addition cost per square
foot?", which no schema marks up, and marking up less than is visible is fine.
