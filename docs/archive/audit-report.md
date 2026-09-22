# Phase 1 Audit Report — nicheprohub.com → burchcontracting.com migration

Generated 2026-07-11. Scope: `burchcontracting-dev/` (the `burchcontracting-static` repo,
https://github.com/cscottburch1/burchcontracting-static.git), read-only. No site files were
changed in this phase. Raw data: `migration/inventory.csv`, `migration/link-asset-issues.csv`,
`migration/_summary.json`.

## 0. Critical context correction — read this first

The task brief assumed nicheprohub.com and burchcontracting.com are two content-divergent
sites needing a diff-and-merge. **That is not what this repo is.** Verified facts:

- This repo *is* the future burchcontracting.com. Every canonical tag, JSON-LD `@id`, OG
  `og:url`, and the sitemap already point at `https://burchcontracting.com/...` — not because
  of a mistake, but because that's the intended production domain once cut over.
- It is currently FTP-deployed (`.github/workflows/deploy.yml`) to a Hostinger account that
  serves it at **nicheprohub.com**, used purely as a staging/preview domain while the site is
  built. `LAUNCH-CHECKLIST.md` §7 documents that the deploy target (FTP secrets / `server-dir`)
  gets repointed to the real burchcontracting.com hosting account at cutover.
- Every real page currently ships `<meta name="robots" content="noindex, nofollow">` (38 of 39
  HTML files) — intentional pre-launch suppression per `LAUNCH-CHECKLIST.md` §1, not an
  oversight. Only `404.html` should keep that tag permanently.
- The **old burchcontracting.com** is a separate, legacy Next.js site not present in this
  repo. Its old URL scheme is handled by hand-written redirect rules already sitting in
  `public/.htaccess` (`/garage-builder` → `/garages`, `/room-additions` → `/additions`,
  `/cost` → `/calculator/estimate.html`, `/service-areas/greer` → `/service-areas/greenville.html`,
  etc.) — this is effectively half of the "Phase 2 redirect map" already built, just aimed the
  other direction (old-prod → new-site) since old-prod and new-site share a destination domain.
- **Net effect:** several of the "known issues" listed in the task brief describe the *old*
  live nicheprohub.com/burchcontracting.com, not the current state of this repo. Section 1 below
  verifies each one against the actual source.

### Open architectural question for Phase 2

Because this repo's `.htaccess` and content will move to burchcontracting.com's docroot at
cutover, nothing in this repo can simultaneously keep serving full content on nicheprohub.com
*and* 301-redirect nicheprohub.com to burchcontracting.com — those are contradictory in one
docroot. After cutover, nicheprohub.com needs its own separate, minimal deployment (redirect-only
vhost/.htaccess, or DNS-level parking) rather than inheriting this repo's `dist/`. Prior
project guidance (see memory) was to keep nicheprohub.com out of search entirely via noindex
rather than treat it as a second indexed entity — a per-URL 301 redirect map is a stronger,
compatible option but needs its own hosting artifact, not a change to this repo's `.htaccess`.
Flagging for your decision before Phase 2 redirect-rule generation.

## 1. Verification of the originally reported issues

| # | Reported issue | Verified against current repo | Verdict |
|---|---|---|---|
| 1 | robots.txt points to burchcontracting.com/sitemap.xml instead of its own | Confirmed in `public/robots.txt` | **Correct as-is** — intentional, since this site *becomes* burchcontracting.com. No fix needed here; only the deploy target changes at cutover. |
| 2 | sitemap.xml lists only burchcontracting.com URLs, mixed .html/clean-slug, doesn't reflect real pages | `public/sitemap.xml` URLs *do* match this repo's real page inventory 1:1 (verified against all 39 files) | **Partially wrong** — sitemap is accurate and complete for this repo's pages. The "mixed .html/clean-slug" part is real (see #3) and is reflected correctly, not a sitemap bug. `lastmod` is suspicious: every entry is stamped `2026-07-11` (today), suggesting it's regenerated wholesale rather than per-page — worth automating off real file mtimes in Phase 3. |
| 3 | URL structure inconsistent: some `.html`, some clean slugs | Confirmed: 25 pages keep `.html` (contact, faqs, about, services, projects, privacy/terms, all 9 `calculator/*`, all 8 `service-areas/*`), 13 use clean slugs (`/garages`, `/additions`, `/outdoor-living/decks`, etc.) | **Confirmed, real.** `public/.htaccess` already handles this consistently (no broken links from the mix), but it is a genuine stylistic inconsistency worth a product decision in Phase 2/3. |
| 4 | Calculator pages are static cost guides with no interactive functionality | `calculator/*.html` each mount `<div id="calculator-app" data-page="...">`, hydrated by `src/js/calculator.js` (424 lines) — live sqft input, cost adders, `input`/`click` listeners, real-time price-range rendering. `ada-bath-shower.html` uses a dedicated `src/js/ada-bath-calculator.js`. | **False for current repo.** These are genuinely interactive. (They may have been static on the old live site the original inspection crawled — not in this codebase.) No rename/rebuild needed; Phase 3 calculator question is moot. |
| 5 | FAQ links inconsistently point cross-domain to burchcontracting.com | Grepped all `href=` in `faqs.html` and every other page — zero cross-domain `https://burchcontracting.com/...` hrefs in visible content anywhere in the repo. `burchcontracting.com` only appears in canonical/OG/JSON-LD meta (correct) and in the email template (correct — it's an outbound email). | **Not reproducible in current source.** Possibly true of the old live site only. Nothing to fix here now; re-check the live nicheprohub.com site directly if you want certainty it's not cached/stale content diverging from this repo. |
| 6 | Contact form fields/endpoint/handler never verified | Fully documented below (§2) | **Resolved by this audit.** |

## 2. Contact form — fully documented

**Location:** `contact.html` (form markup) + `src/js/main.js` (client logic) + `public/api/contact.php` (server handler).

**Endpoint:** `POST /api/contact.php` (relative; `data-contact-endpoint="/api/contact.php"` on the `<form>`, overridable). Routed via `public/api/.htaccess`: `RewriteRule ^contact$ contact.php [L]`.

**Fields** (all sent as `multipart/form-data` via `fetch`, not a native form POST):

| Field | Required | Client validation | Notes |
|---|---|---|---|
| firstName, lastName | yes | non-empty | Combined client-side into a single `name` field before send (`main.js:202`) — `contact.php` reads `$_POST['name']`, not `firstName`/`lastName` directly. |
| phone | yes | ≥10 digits | |
| email | yes | regex + `FILTER_VALIDATE_EMAIL` server-side | |
| address, city | yes | non-empty | |
| state | yes | 2-letter code | |
| zipCode | yes | 5 or 5+4 digit ZIP | |
| projectType | yes | must be selected | Sent twice as `projectType` and `serviceType` (PHP accepts either) |
| budgetRange | optional | — | |
| timeframe | optional | — | |
| referralSource | optional | — | |
| description | yes | non-empty | |
| attachments (file input, multiple) | optional | ≤10MB/file client-side; ≤10MB/file + ≤10 files + MIME allowlist (jpeg/png/gif/webp/pdf/doc/docx) server-side | Sent as `file0`, `file1`, ... |
| `website` (honeypot) | n/a | hidden field, `tabindex="-1"`, `autocomplete="off"` | See below. |
| recaptchaToken | yes (if site key present) | — | reCAPTCHA v3, action `contact_form` |

**Honeypot behavior:** if the `website` field has a value, `main.js` silently returns before
sending (bot never reaches the server). However, the client's manually-built `FormData` never
appends the `website` field at all for legitimate submissions, so the server-side honeypot check
in `contact.php:259` (`$_POST['website']`) is effectively dead code against real users — it
would only ever trigger for a bot that POSTs directly to the endpoint bypassing the JS and still
includes the field. Not a bug, just a redundant/vestigial second layer — worth knowing, not
worth "fixing."

**reCAPTCHA v3:**
- Site key: read from `import.meta.env.VITE_RECAPTCHA_SITE_KEY` first, falling back to
  `contact.html`'s hardcoded `data-recaptcha-site-key="6Lc2ITgsAAAAAFUsZhRghHdgBEYDG0izDeTtd4Li"`.
  The GitHub Actions secret `VITE_RECAPTCHA_SITE_KEY` (build-time env) is what actually ships
  to production, per `LAUNCH-CHECKLIST.md` §3.
- **Staging (nicheprohub.com) currently uses a *different* site key**
  (`6Le5vkEtAAAAAKMZtQ-YahscAQXHygBRDBGutTuD`) than what's hardcoded/committed — meaning "the
  form works on staging" does not confirm the production key is correctly registered for
  burchcontracting.com. This is already tracked as a launch blocker in the checklist; repeating
  it here since it's directly relevant to zero-lead-loss migration.
- Secret key lives in `public/api/config.local.php` on the server — **gitignored, not in this
  repo**, confirmed via `.gitignore` and the `.example` template only containing a placeholder
  (`YOUR_RECAPTCHA_SECRET_KEY`). If that file is missing on the server, `verifyRecaptcha()`
  returns `null` and spam verification silently no-ops (form still works, no bot protection) —
  tracked in `LAUNCH-CHECKLIST.md` §2.
- **I cannot confirm from code whether `config.local.php` exists on the live server, or what
  domains the two reCAPTCHA site keys are registered for in the Google admin console.** Both
  require checking outside this repo — reporting as unknown, not guessing.

**Email notifications:**
- Lead notification → `estimates@burchcontracting.com` (`config.local.php`'s `to_email`,
  defaulting to the same address in `contact.php:16` if the config file is absent).
- From address → `noreply@burchcontracting.com` (same default pattern).
- Reply-To on the lead email is set to the submitter's own email, so replying goes straight to
  the customer.
- A confirmation auto-reply is separately sent to the submitter using
  `public/api/email-templates/confirmation.html` as a template (placeholders
  `[Customer First Name]` / `[Project Type or "home remodeling"]`), with the logo embedded
  inline via `multipart/related`. Failure to send the confirmation does not fail the lead
  submission (best-effort, by design).
- Sent via PHP's built-in `mail()` — **I cannot confirm from code whether SPF/DKIM is
  configured for the sending domain**; this is a server/DNS concern outside the repo, already
  flagged as a human task in the original brief.
- **No CRM/webhook/Formspree/Netlify Forms integration found** — this is a custom PHP `mail()`
  handler only. If a CRM integration is expected, it does not exist in code.

## 3. Tech stack & deployment

- **Stack:** Vite 8 + `@tailwindcss/vite` 4, plain multi-entry static HTML (`vite.config.js`
  hand-lists every HTML entry point plus dynamically-globbed `service-areas/*.html` and
  `outdoor-living/*/index.html`). No SSG framework, no client-side router — each page is a
  real static file.
- **Generated content** (do not hand-edit, per prior project note): `scripts/generate-services.mjs`
  builds the 11 top-level service pages from `src/data/services.js`; `scripts/generate-geo-aeo.mjs`
  builds the 8 `service-areas/*.html` pages from `src/data/geo-aeo.js`. Both run as a `prebuild`
  step before every `npm run build`.
- **Deploy:** `.github/workflows/deploy.yml` — on push to `main`, builds with Node 20, injects
  `VITE_RECAPTCHA_SITE_KEY` from a GitHub secret, stamps `dist/version.txt` with the commit SHA,
  FTPs `dist/` to Hostinger (`SamKirkland/FTP-Deploy-Action`, currently targeting whatever
  `FTP_SERVER`/`FTP_USERNAME`/`FTP_PASSWORD` secrets hold — per prior project notes and
  `LAUNCH-CHECKLIST.md` §7, that's the nicheprohub.com account today), explicitly excludes
  `**/api/config.local.php` from the sync, then verifies the live `version.txt` matches the
  pushed commit (defaults to checking `https://nicheprohub.com` unless the `STAGING_URL` repo
  variable is set). Cutover requires updating those secrets/variable to point at the
  burchcontracting.com hosting account — **a human/hosting-panel task**, not something fixable
  in this repo.
- No `netlify.toml`, `vercel.json`, or nginx config present — Apache + `.htaccess` is the only
  hosting-config mechanism in use.

## 4. Site-health checklist

| Item | Status |
|---|---|
| 404 page | ✅ `404.html` exists, correctly `noindex, nofollow` permanently, 133 words |
| Favicon | ✅ `public/favicon.ico` + `public/favicon.svg` |
| LocalBusiness/GeneralContractor schema | ✅ Site-wide in JSON-LD `@graph`, includes license `CLG118679`, phone, address, geo, areaServed (8 cities), `sameAs` (Facebook/Instagram/LinkedIn/BBB/Google) |
| Organization schema | ✅ Site-wide |
| Service schema | ✅ On all 11 service pages |
| FAQPage schema | ✅ On `faqs.html` and on every service page (each has its own FAQ block) |
| BreadcrumbList schema | ✅ Site-wide |
| JSON-LD validity | ✅ All 39 pages' JSON-LD blocks parse as valid JSON (0 invalid) |
| Open Graph tags | ✅ `og:type/site_name/title/description/url/image/locale` on every page |
| Twitter card tags | ✅ `summary_large_image` + title/description/image on every page |
| Canonical tags | ✅ Present on all 38 real pages, all pointing at the correct `https://burchcontracting.com/...` equivalent |
| Analytics / conversion tracking | ❌ **None found.** No GA4 `gtag`, no GTM container, no Meta Pixel, anywhere in the repo. This is a real gap, not just a "set up goals" task — the tracking snippet itself needs to be added before launch if analytics is wanted from day one. |
| www / non-www / HTTPS | ✅ `public/.htaccess` strips `www.` and forces HTTPS in a single 301 hop (verified by hand-trace comments already in the file) |
| Trailing slash handling | ✅ Handled implicitly by Apache `mod_dir` for directory-backed clean-slug pages; explicit 301 rules for old extensionless URLs |
| robots meta | ⚠️ `noindex, nofollow` site-wide except 404 — **intentional pre-launch state**, must flip per `LAUNCH-CHECKLIST.md` §1 before/at cutover |
| Secrets in repo | ✅ None found. `.env.example` and `config.local.php.example` contain only placeholders/public keys; real secret key lives in gitignored `config.local.php` on the server and is explicitly excluded from the FTP sync. |

## 5. Link/asset issues (see `migration/link-asset-issues.csv` for full machine-readable list)

- **Missing alt text:** 1 instance — `public/api/email-templates/confirmation.html` (an email
  template, not a crawlable page; low priority but trivial to fix).
- **Hardcoded absolute URLs:** only in the email template (correctly, since it's sent outside
  the site context) and in meta/JSON-LD (correctly). No hardcoded absolute URLs found in visible
  nav/body content on any page.
- **Broken internal links:** none found. Every internal `href` in `migration/_summary.json`
  (`allInternalLinks`) resolves to a real page in the inventory.
- **Orphan pages (real finding):** `/calculator/kitchen-remodel.html` and
  `/calculator/whole-home-remodel.html` exist, are in the sitemap, and are fully built, but no
  other page links to them — they're only reachable via direct URL or sitemap crawl, not site
  navigation. Worth a nav/cross-link fix in Phase 3, independent of the domain migration.
- **Double-HTML-encoding bug (real finding, root cause identified):**
  `scripts/generate-geo-aeo.mjs` line 151 hardcodes `&amp;` inside a template literal
  (`` `Deck Builder, Garage Contractor &amp; Home Additions ${area.name} SC...` ``), and line 20
  defines an `esc()`-style helper that does `.replaceAll('&', '&amp;')`. When the already-escaped
  title string passes through that helper, `&amp;` becomes `&amp;amp;`. This is visible in the
  inventory (`migration/inventory.csv`) on all 8 `service-areas/*.html` titles, e.g. *"Deck
  Builder, Garage Contractor &amp;amp; Home Additions Five Forks SC"*. One-line fix: don't
  hardcode `&amp;` in the raw template literal — use a literal `&` and let the escape helper do
  its job once, or escape earlier and interpolate the already-escaped string without re-escaping.
- **Duplicate titles/meta descriptions:** none found (all 38 real pages have unique title and
  description).
- **Missing title/meta description:** none on any real page (the one flagged "missing" in the
  raw data is the non-page email template, which doesn't need SEO meta).

## Summary of what needs a decision before Phase 2

1. **nicheprohub.com's post-cutover fate** (§0) — separate minimal redirect deployment vs.
   DNS parking vs. something else. This determines what `migration/redirects.*` in Phase 2
   should actually target.
2. Whether to standardize the `.html` vs. clean-slug split (§1.3) now, or leave it and just
   make sure the redirect map + canonical tags are internally consistent either way.
3. Whether analytics (GA4/GTM) should be added as part of this migration or tracked as a
   separate follow-up — currently zero tracking exists.

Everything else in the original "known issues" list either turned out to already be correct
for this repo's current state, or is already tracked in `LAUNCH-CHECKLIST.md`. Two new,
previously-unknown issues were found and are fixable independent of the domain question: the
double-encoded `&amp;amp;` bug and the two orphaned calculator pages.

Stopping here per your instructions — awaiting your review before Phase 2 (redirect map).
