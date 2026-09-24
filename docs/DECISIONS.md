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
Recorded here, in the deploy workflow, in `README.md` and in `RUNBOOK.md`,
because the old instruction is written in several places people will still find.
(That workflow was `cloudflare.yml` when this entry was written; Phase 5 split it
into `ci.yml` and `deploy.yml`.)

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

---

## 2026-09-22 — Phase 7: four documents, and what was deliberately left out

`README.md` was describing a site that no longer existed — auto-deploy to
Hostinger on push, a live URL of `dev.burchcontracting.com`, a file tree with
`index.html` and `services.html` at the root, a link to a `DEPLOYMENT.md`
archived in Phase 1, and Node 20. Every one of those was wrong, and the first
was dangerous: it told a reader that pushing to `main` ships the site.

Four documents now, and only four:

- `README.md` — what this is, how to run it, how to change something, where to
  read next.
- `docs/ARCHITECTURE.md` — the pipeline, a table of where each kind of fact
  lives, what is generated versus committed, and **which gate reads which
  tree**. That last table is here because tampering with the wrong tree to test
  a gate has already produced a confident wrong conclusion.
- `docs/RUNBOOK.md` — every operation, each with the incident that shaped it.
- `docs/DECISIONS.md` — this file.

**Nothing was deleted from the root.** The plan said to delete every root-level
`.md` except `PRICING.md`; Phase 1 had already archived them, so the only two
left were `README.md` and `PRICING.md`. Recorded because "did nothing" and
"forgot" look identical in a diff.

**History stays here and nowhere else.** The other three documents describe the
current state only. Where a rule needs a reason, they give the reason in a
sentence and this file has the account. That split is what stops the runbook
turning back into the five-paragraph workflow header it replaced.

**One rule earned its own section.** `RUNBOOK.md` → Adding a gate now says that
every new assertion must be shown to fail at least once before it is trusted,
and that tampering means two assertions: that the edit landed, and that the edit
created the failure condition. Three gates in this repo have shipped incapable
of matching anything — a regex with a literal backspace where a word boundary
was meant, a FAQ check that claimed both directions and did one, and a Service
check reading a `url` field no node has. All three passed every run.

---

## 2026-09-22 — Never `| grep -q` under `set -o pipefail`

The first real run of `deploy.yml` (run 35741546873) deployed successfully,
propagated, passed the secrets check and the version-marker check, then failed
on the first representative page with:

```
printf: write error: Broken pipe
::error::/ is not index,follow
```

The page *was* `index, follow`. The check failed **because** the string was
there.

`if ! printf '%s' "$body" | grep -q '...'` — `grep -q` exits the instant it
matches and closes its end of the pipe. `printf` is still writing a 90 KB page,
takes `EPIPE`, and exits non-zero. GitHub runs every `run:` block under
`bash -eo pipefail`, so a non-zero anywhere in the pipeline makes the whole
pipeline non-zero, and the script reads that as "the string was not found".

The failure mode is inverted, which is the worst shape a gate can have: it fails
on a correct page and **passes on a page that lacks the string entirely**, since
then `grep` reads to EOF, `printf` completes, and only `grep` returns 1. A page
that had actually shipped `noindex` would have sailed through.

The canonical check on the next line had the same bug and would have failed one
line later.

**Decision.** Bash substring tests, `[[ "$body" == *"..."* ]]`. No subprocess, no
pipe, nothing for `pipefail` to misread. The status extraction moved to
parameter expansion (`${body##*HTTP_STATUS:}`) for the same reason.

Every other pipe in the workflow was audited: `sed`, `cut`, `sha256sum`,
`node -e` reading stdin to `end`, and a `while read` loop all consume to EOF and
cannot orphan their writer. `grep -q` was the only short-circuiting consumer.

**What this run actually proved.** The deploy path works — build, gates,
`wrangler deploy`, propagation, secrets intact, version marker correct — and the
automatic rollback works, on its first exercise, on a deploy where nothing
visible changed. That is the cheapest possible test of the rollback path, and it
is the reason the push trigger was left commented out.

**The rule this adds:** a gate whose failure depends on the *shell's* behaviour
rather than the content's is not tested until it has been run against both a
matching and a non-matching input. Proving "it fails when tampered" was not
enough here, because nobody had run it against a page that passes.

---

## 2026-09-22 — A verification failure has to say which failure it was

Run 35743001349. The `grep -q` fix worked: all five representative pages passed,
including the canonical check that would have failed next. The whole-site byte
comparison then failed on 9 of 71 pages and rolled back.

The nine were `privacy-policy`, `terms-of-service`, `remodeling`,
`kitchen-remodeling`, `outdoor-living/decks`, `calculator/estimate`,
`calculator/basement-finishing`, `service-areas/simpsonville` and
`service-areas/five-forks` — one from every page family, with the other 62
matching byte-for-byte. Not a systematic build or transform problem, then:
something was different about those nine *at the moment they were fetched*.

Two candidates, and **the log could not distinguish them**: propagation lag (a
colo still serving the six-day-old version) or a Cloudflare transform the strip
script does not cover. The check printed `mismatch` and nothing else, which is
the same shape of defect as a check that cannot fail — it produced a result
nobody could act on.

**Three changes.**

1. **Every page carries a build stamp.** `<!-- build:$GITHUB_SHA -->`, appended
   to each file in `dist/` by the deploy workflow — never by `npm run build`, so
   local builds, the gates and the snapshot are untouched. It is an HTML
   comment: not visible text, not a link, not schema, not in any field the
   snapshot compares. The page can now be asked which build it is before its
   bytes are compared.
2. **Per-page retry on a stale stamp**, six attempts with backoff, about 60
   seconds. A page served from a colo that has not caught up is a propagation
   fact, not a content defect, and retrying is the correct response.
3. **A diagnosable failure.** On a final mismatch the log prints the served
   stamp, the local stamp, an explicit line when the served page is not this
   build, and the first 20 lines of `diff`. Plus a 10-second settle after
   `wrangler deploy`, so the common case never needs the retry.

**Which it was is now decidable from the log**, and that is the point: if the
next run passes, it was propagation and the retry is the permanent fix; if it
fails, the diff names exactly what Cloudflare changed and the strip script gains
a line.

**Proved before shipping**, both directions, against a local server that serves
the old build first and the new one after:

- stale stamp → detected, retried, matched on the second attempt;
- correct stamp with genuinely different bytes → six retries, then failure with
  both stamps and a readable diff;
- no stamp at all → detected and reported as such.

`head -20` reads the diff from a **file**, not a pipe. Piping into `head` would
hand `diff` an `EPIPE` under `pipefail` — the bug from the previous run, in a
new costume.

---

## 2026-09-22 — Phase 6 is a content PR, and its snapshot diff is not supposed to be zero

Phases 0–5, 7 and 8 were technically neutral: same 71 pages, same URLs, same
content, from a build that can now be trusted. Every commit there was measured
against "the snapshot shows nothing changed", and where something did change it
was a defect being corrected and was enumerated.

Phase 6 is the business change those phases were clearing the way for:
bathroom and kitchen remodeling become the lead offers, garages stop being the
front door, and every page's title, description and content depth follows. Before
the migration, "bathroom remodeling" ranked 1.6; it is now 16. Recovering that is
the point.

**So the snapshot's job changes.** It is no longer a proof that nothing moved. It
is the instrument that enumerates what moved, so every changed field on every
page can be attributed to a numbered item in the PR. A field that changes without
an attribution is still a defect; a field that changes with one is the work.

**One expected chrome-hash change.** Reordering the Services mega-menu changes
anchor order and text order, so the header hash moves on all 70 governed pages
at once. That is the only chrome-hash change this PR may contain, it happens in
a single commit, and the chrome baseline is re-recorded in that same commit.
Outside it, a changed chrome hash is a defect exactly as before.

**Missing facts are left missing.** Where the work needs a fact nobody has
written down — a count of bathrooms remodeled, a real bath project with photos,
a year — the data file gets `TODO(owner): <what is needed>` and the PR body
lists it. `check-build`'s check 10 fails the build if a `TODO(` ever reaches
visible text, so the convention is safe: a data file is read by the author, a
page is read by a customer.

**The Tier 1 floor was written before the content that satisfies it.** 
`scripts/check-tier1.mjs` asserts that every `tier: 1` service page carries 6+
FAQ questions, links to its own calculator, links to at least one cost guide,
and has a headline range that agrees with its own pricing table. Run against
`main` with tiers temporarily assigned, it produced ten findings:

- `remodeling` has 5 FAQs, no calculator, no cost-guide link, and a headline of
  "$5,600-$75,000" against its own table's $5,578–$644,314 — a wider
  contradiction than the `garage-builder` one the plan cites.
- `bathroom-remodeling` and `kitchen-remodeling` link to no cost guide, and
  price their headline in absolute dollars while their tables are per square
  foot, so the two cannot be compared at all until 6.6 derives both.
- `ada-bath-to-shower` has 5 FAQs and no cost-guide link.

None of the four Tier 1 pages links to a single cost guide. The guides exist;
nothing points at them from the pages meant to sell the work.

It is deliberately **not** in `npm test` yet. It joins at 6.3, in the commit that
makes it pass — per the gate-adding rule, a gate added green is a gate nobody
has seen work.

---

## 2026-09-22 — The www and http redirects are now asserted, not assumed

A third of this property's search clicks arrive on a hostname that is supposed
to 301 away.

From the Search Console export of 2026-09-22 (28 days to 2026-09-20, committed
at `migration/gsc-2026-09-22-pre-phase-6/`):

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| `https://www.burchcontracting.com/` | **19** | 998 | **3.25** |
| `https://burchcontracting.com/` | 12 | 697 | 30.52 |

The www version outranks the canonical root by 27 positions and earns more
clicks — 19 of the property's 57. Google has had it indexed for years and still
prefers it.

**Nothing in this repository produces that redirect.** It is two Cloudflare zone
settings: "Always Use HTTPS", and a www → root Redirect Rule
(`CLOUDFLARE-CUTOVER.md`, step 4). They were configured by hand at cutover. If
either is switched off — by a dashboard change, a plan change, a zone migration —
every one of those clicks lands on an unredirected duplicate of the whole site,
every canonical points somewhere else, and no build, gate or test would notice.

**Decision.** `scripts/check-routing.mjs` asserts six hostname redirects against
production: www and http, on `/` and `/services`, with and without a query
string. `deploy.yml`'s verification repeats four of them, because that step is
what runs against production on every deploy. Both assert a **single hop**, a
**301**, and the **query string preserved**.

They cannot go in `migration/routing-baseline.json`: that file is keyed by path,
and these are hostnames. They are skipped on any non-production base, because
www and http do not exist on `wrangler dev` or a preview URL.

Verified working at the time of writing — all four combinations already 301
correctly in one hop. This records behaviour that is right, so that it stays
right. Tamper-tested by pointing one expectation at a wrong target; it failed
naming both the observed and expected location and where to look in Cloudflare.

**A regression this caught.** The workflow being replaced in Phase 5 checked two
of these (`http://…/garages/` and `https://www.…/garages/`). Rewriting the verify
step dropped them, and nothing noticed for three deploys. That is an argument for
the check living in `check-routing` — which runs locally, in CI and on deploy —
rather than only in a workflow step that can be rewritten out.

---

## 2026-09-23 — Owner pricing decisions, and the sitemap keeps no priority

Phase 6.6 found five services whose published prices either contradicted the
calculator or came from nowhere. They were not reconciled by guesswork; the
owner decided each one:

| Service | Was | Now | Source |
|---|---|---|---|
| Basement finishing | $30–$75/sq ft, typed | $48–$121/sq ft | `calculator-config.js`, which the basement calculator already used |
| ADA bath-to-shower | $10,500–$19,800 (raw line-item sum) | $9,800–$25,400 | `adaBathEstimate()`, cheapest to priciest configuration |
| ADUs | $65,000–$220,000, typed | $225–$325/sq ft, like new-home construction | `QUOTED_RATES.adu` |
| Garage with apartment | $85,000–$145,000, typed | $200–$325/sq ft | `QUOTED_RATES.garageApartment` |
| Handyman | $125–$4,400 by task, typed | $65/hour, two-hour minimum | `QUOTED_RATES.handyman` |
| Commercial upfits | $30–$100+/sq ft, typed | Custom quote | no rate, deliberately |

`QUOTED_RATES` in `calculator-config.js` holds the three owner-quoted rates.
They are final customer prices, so no location factor or overhead & profit is
applied on top. Everything that shows one of these prices reads it from there.

**The sitemap keeps no `priority`.** Plan item 2 asked for tier-derived
priorities; that contradicts the 2026-07-23 entry above (Google ignores both
`priority` and `changefreq`). The owner confirmed: `lastmod` updates
automatically from content dates, and nothing else is added. Item 2 is closed
as not done.

---

## 2026-09-23 — Whole-home remodel: the owner's typical range, $60,000 to $350,000

The whole-home service page's "Whole-House Remodel" row showed $250,430–$644,314+,
which is the calculator's full span for a 2,000 sq ft home, from its cheapest
tier to its maximum configuration. The page headline followed it to
$5,500–$644,500. That is what the calculator can produce, not what a homeowner
is quoted for a whole-home job.

**Decision (owner, 2026-09-23):** the typical range quoted for a whole-home job
is **$60,000 to $350,000**.

- It lives in `calculator-config.js` as `QUOTED_RATES.wholeHomeTypical`, a
  typical-range tier, not as a typed string. The row reads it through
  `quotedTypicalString()`.
- The calculator's own whole-home math is unchanged. Its maximum configuration
  ($644,314 at 2,000 sq ft) is higher than the owner's high, so the row reads
  **$60,000–$350,000+**, and the headline follows at **$5,500–$350,000+ Typical**.
  The calculator page's intro still describes the calculator's 2,000 sq ft
  scenario ($250,000–$644,000); it describes that tool, not the typical job.

**Correction (owner, 2026-09-24):** the low end is **$60,000**, not $8,000.
"$8,000" was the owner's typo when answering the PR #28 prompt; it shipped in
PR #28 (`e5d56d9`) and was corrected the next day. The high end, $350,000, was
right. The headline does not move: its low is the page's cheapest table row (a
small bath, $5,578, shown as $5,500), which is below either figure.

---

## 2026-09-23 — Titles are held to 60 characters, and descriptions to 120–155

**Why Phase 6 let titles run long.** Phase 6.2 restored geo- and intent-led
titles from the Next.js site that had ranked, in the pattern "<Service> in
<Geo> | <specifics> | Burch Contracting". The plan said "≤60 characters where
possible". The priority was getting the geography and intent back after the July
rebuild stripped them, and in practice "where possible" rarely applied: 47 of 70
titles went over, the longest at 91 characters.

**Why 60 is now enforced.** Google shows about 60 characters of a title, and
the cut fell on exactly the words 6.2 added: the geography, the intent phrase
or the brand. A title over 60 was paying for words nobody saw. Check 13 fails
the build on any title over 60. Check 14 does the same for descriptions outside
120–155, since Google shows about 155 characters of a description.

**The rule order (owner, 2026-09-23).** A title over 60 is shortened in this
order, stopping as soon as it fits:

1. drop ` | Burch Contracting`. Google shows the site name from the
   `WebSite`/`Organization` schema on its own line.
2. drop the trailing phrase after the last ` | `, unless that phrase is the
   geography itself.
3. only then replace "Simpsonville & Greenville SC" with "Upstate SC".

The PR #28 prompt drafted steps 2 and 3 the other way round. The owner reversed
them so the Simpsonville & Greenville wording survives wherever it fits: it
does on every service page and on 7 of 11 calculators. The homepage is the
exception. Its trailing segment *is* the geography, so step 2 does not drop it
and step 3 applies: "Bathroom & Kitchen Remodeling Contractor | Upstate SC".
Keeping the full geography there would cost the word "Contractor".

---

## 2026-09-24 — The tub-to-shower calculator reports to GA4

`src/js/ada-bath-calculator.js` sent no events, so use of the calculator for
ADA bath-to-shower, one of the four lead offers, was invisible in GA4 even though
the page loaded `analytics.js` and counted page views. It now sends
`calculator_complete` (with `service: 'adaBathShower'`) through `trackEvent`,
by the same rule as `calculator.js`: once per page load, on the first change to
one of the calculator's inputs, never on the default render, the details toggle
or print.

**Merged 2026-09-24 in PR #31; live from the first Deploy run after that merge
(see Actions history).** Events before that date do not include this
calculator, so a before/after comparison of `calculator_complete` should
exclude `service: 'adaBathShower'` or start from that run.

`calculator_start` was also requested. `calculator.js` has never sent it — only
`calculator_complete` — so there was nothing to match. What "start" should
mean (the page loading, the calculator scrolling into view, the first click) is
an owner decision, and it would need adding to both calculators together.

---

## 2026-09-24 — Hand-dated pages carry a text hash, and check 15 holds them to it

**What went wrong.** `3ebd398` corrected the whole-home typical low from $8,000
to $60,000, which changed the visible text of `/remodeling`. `/remodeling` is
dated by a literal override, `__service__remodeling`, whose note says to bump
it in the same commit as any content change. It was not bumped, so the page
kept claiming 2026-09-23 and no gate noticed. `dates-set-by-head` reported
"No page takes its dateModified from this commit" at that commit, and it was
right: literal overrides are not derived from git, so nothing moves them.

**Decision.** Every page whose `dateModified` comes from an entry in the
`dates` block of `src/data/content-date-overrides.json` (today 18: sixteen
service pages, privacy, terms) has its visible-text hash stored beside its
date, in a new `textHashes` block. check-build check 15 recomputes each hash
from `.build/pages/` and fails when one no longer matches, naming the page:

- text changed, date did not → "bump the override's dateModified";
- date moved, hash not re-recorded → "run scripts/record-text-hashes.mjs".

Visible text excludes `<head>`, the header and footer chrome, scripts and
styles, and replaces every ISO date with a placeholder, because the byline
prints the page's own date and would otherwise make the hash circular.

`scripts/record-text-hashes.mjs` writes the hashes. It refuses to re-record a
page whose text changed while its date did not, since that would erase the
finding check 15 exists to raise. `--accept` overrides the refusal for a text
change that genuinely needs no new date; say why in the commit.

**Seeding (owner decision, option (a)).** On 2026-09-24 every hash was seeded
from that day's build, except `/remodeling`. Its hash was seeded from a build
at `e5d56d9`, the last commit dated 2026-09-23, which is the content its date
actually vouched for. Seeded that way, check 15 failed on `main` naming
exactly `/remodeling`. A comparison of all 18 pages between `e5d56d9` and that
day's build showed `/remodeling` as the only difference. It passed once
`__service__remodeling` moved to 2026-09-24 and the hash was re-recorded.

**Every other override was accepted as correct at seeding on 2026-09-24.** The
check vouches for changes from that point forward, not for history. It does not
prove that pages pinned to 2026-09-11 (decks, commercial roofing, insurance
restoration, ADA compliance) or to 2026-07-23 (privacy, terms) are unchanged
since those dates.

Proven both ways: the seeded state failed on `/remodeling`. A temporary edit
to the decks intro failed on `/outdoor-living/decks`, which is dated by the
shared `services.js` pin. After the bump, and with the tamper restored, it
passes. The recorder refused to re-baseline `/remodeling` before the bump.
