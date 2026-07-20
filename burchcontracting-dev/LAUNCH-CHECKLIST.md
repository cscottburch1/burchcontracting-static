# Launch Checklist

## ✅ Launch complete — site is live at burchcontracting.com

Verified live 2026-07-19: deploy pipeline green (content-integrity, reCAPTCHA key,
`contact.php`/`config.local.php` checks all pass), noindex is off (`index, follow`
serving in production), and the recovery sequence below has already been run
successfully — kept here only as a reference if the docroot ever gets modified
out-of-band again.

## Redirect map verification — 2026-07-20

A report surfaced two legacy URLs allegedly still serving the old Next.js site
instead of redirecting (`/simpsonville-sc/deck-builder`, `/locations`), with a
theory that leftover static files from the old site's export were physically
shadowing those exact paths in the docroot, ahead of `.htaccess`.

**Re-tested independently, live, from scratch — both now redirect correctly**,
along with every other rule family in `public/.htaccess`:

- All 28 representative URLs spanning every distinct `RewriteRule` family
  (base old-site rules, city×service, service×city, `/locations/*`,
  `/services/*`, `/calculator/*`, `/cost/*`, the bare/underscore tier,
  `/service-areas/*`) return their documented 301 target. 0 failures.
- Response bodies checked directly: the 301s return Cloudflare/LiteSpeed's
  generic redirect page (no old-site HTML), and the destination pages carry
  correct self-referential canonical tags for the *new* site — no trace of
  the old nav/footer/testimonials/self-canonical symptom originally reported.
- `.htaccess` correctly 403s on direct fetch (expected Apache behavior, not a
  bug) so a byte-for-byte diff against the repo copy isn't possible over
  HTTP — but the fact that literally every rule in the 387-line file fires
  with the exact right target is strong behavioral proof the full, current
  file is what's live; a stale/partial file would show a different subset
  working, not all of it.
- Cloudflare side ruled out as a cause: 0 Page Rules configured, 0
  Redirect/Cache Rules configured, and `cf-cache-status: DYNAMIC` on both
  originally-reported URLs (a fresh, uncached response from origin each
  time, not a frozen snapshot).

**Root cause (best available evidence, not 100% certain):** most likely the
same stale-FTP-sync-state class of issue this file's Recovery deploy
sequence already documents, not literal leftover files at those specific
paths — no direct evidence of the latter was found (see caveat below), and
the former is a known, previously-hit failure mode for this project. A full
docroot re-upload (the GEO remediation deploy earlier the same day, commit
`23c3c29`) most likely fixed it as a side effect: the deploy pipeline's own
automated content-integrity check ("every built page matches live," hashed
against every `dist/*.html` file) passed clean on that run and every run
since.

<details>
<summary>Full pass/fail table (28 URLs, one per distinct rule family, tested 2026-07-20)</summary>

| URL | Expected target | Result |
|---|---|---|
| `/contact` | `/contact.html` | ✅ 301 |
| `/areas` | `/#service-areas` | ✅ 301 |
| `/service-areas` | `/#service-areas` | ✅ 301 |
| `/garage-builder` | `/garages` | ✅ 301 |
| `/calculator/decks` | `/calculator/decks.html` | ✅ 301 |
| `/simpsonville-sc/deck-builder` | `/service-areas/simpsonville.html` | ✅ 301 (previously reported failing) |
| `/fountain-inn-sc/garage-builder` | `/service-areas/fountain-inn.html` | ✅ 301 |
| `/clinton-sc/deck-builder` | `/service-areas/laurens.html` | ✅ 301 |
| `/deck-builder/simpsonville` | `/service-areas/simpsonville.html` | ✅ 301 |
| `/deck-builder/greer` | `/service-areas/greenville.html` | ✅ 301 |
| `/deck-builder/travelers-rest` | `/outdoor-living/decks` | ✅ 301 |
| `/locations` | `/#service-areas` | ✅ 301 (previously reported failing) |
| `/locations/deck-builder-mauldin-sc` | `/outdoor-living/decks` | ✅ 301 |
| `/locations/basement-finishing-laurens-sc` | `/basement-finishing` | ✅ 301 |
| `/deck-builder` | `/outdoor-living/decks` | ✅ 301 |
| `/services/decks` | `/outdoor-living/decks` | ✅ 301 |
| `/services/whatever-else` | `/services.html` | ✅ 301 |
| `/calculator/room-additions` | `/calculator/additions.html` | ✅ 301 |
| `/calculators` | `/calculator/estimate.html` | ✅ 301 |
| `/cost/cost-to-build-a-deck-mauldin-sc` | `/calculator/decks.html` | ✅ 301 |
| `/cost/whatever-article-slug` | `/calculator/estimate.html` | ✅ 301 |
| `/bathroom-remodeling` | `/calculator/bath-remodel.html` | ✅ 301 |
| `/roofing` | `/services.html` | ✅ 301 |
| `/work` | `/projects.html` | ✅ 301 |
| `/clients` | `/contact.html` | ✅ 301 |
| `/portal` | `/contact.html` | ✅ 301 |
| `/service-areas/simpsonville-sc` | `/service-areas/simpsonville.html` | ✅ 301 |
| `/service-areas/greer` | `/service-areas/greenville.html` | ✅ 301 |
| `/editorial-policy` | `/about.html` | ✅ 301 |

28/28 pass. An additional ~90-URL sweep covering every real example in every
`.htaccess` rule family (not just this representative list) was also run the
same day, with the same 100% pass rate.

</details>

**Caveat — this repo has no direct server/FTP access.** `.vscode/sftp.json`
and `.env` are gitignored and were not present locally; no Hostinger
credentials exist anywhere in this environment. Everything above is HTTP-
based evidence (extensive and consistent, but external) — it was not
possible to directly list the docroot and rule out leftover files with
certainty the way the original report asked. If this ever regresses, that
direct docroot check (Hostinger File Manager or SFTP client, per
`SFTP-GUIDE.md`) is the one verification step still worth doing that
wasn't possible here.

**Structural gap worth knowing about regardless of root cause:** the FTP
deploy step (`.github/workflows/deploy.yml`) runs with
`dangerous-clean-slate: false` — it only adds/updates files matching the
current build, it never deletes files on the server that aren't in `dist/`.
If old-site debris was ever uploaded to the docroot (e.g. during the
pre-2026-07-11 hPanel Git integration incident, see item 3 below), nothing
in the current pipeline would ever clean it up on its own. Worth a one-time
manual File Manager sweep to confirm the docroot only contains what
`dist/` produces, and worth considering a periodic (not every-deploy)
clean-slate run as deliberate maintenance — `dangerous-clean-slate: true`
is a mirror/delete operation, so treat that as a separate, careful,
manually-triggered action, not a default.

**Still open, unchanged from before (human-only, not attempted here):**
- `nicheprohub.com` still serves full duplicate content (confirmed fresh
  2026-07-20: root returns 200, not a redirect; `/garages` still resolves
  locally on that domain rather than 301ing to burchcontracting.com).
  `migration/nicheprohub-redirect.htaccess` is prepared but not deployed —
  needs manual upload to that domain's own docroot via Hostinger File
  Manager (separate hosting/FTP access this environment doesn't have).
- GSC Coverage report monitoring (see item 4 below) — still needs a human
  with Search Console access.

<details>
<summary>🔧 Recovery deploy sequence (reference — already executed, not currently needed)</summary>

The server was last modified by the now-removed Hostinger hPanel Git
integration (see item 3), so the FTP action's incremental sync state cannot
be trusted. Run this exact sequence:

1. **hPanel File Manager** → site root → enable "Show Hidden Files" → delete
   `.ftp-deploy-sync-state.json`.
2. **Verify `api/config.local.php` still exists** with all fields present
   (`recaptcha_secret_key` + the 5 `smtp_*` keys) — restore from your local
   copy if it's missing or incomplete.
3. **Delete any raw-repo debris** in the docroot that returns HTTP 200 for
   files like `package.json`, `vite.config.js`, `src/js/main.js`,
   `.env.example`, `DEPLOYMENT.md` — leftovers from the old raw-repo sync.
   (Probed clean as of 2026-07-12; re-check before relying on this.)
4. **Push this branch / re-run the deploy workflow** — with no sync-state
   file present, expect a full re-upload of every file (this is normal, not
   a failure).
5. **Confirm the workflow's "Verify deployment" step is green** — it now
   checks the version marker, the live reCAPTCHA site key against this
   commit's `contact.html`, that `api/contact.php` returns 405, and that
   `api/config.local.php` does NOT return 200.
6. **Submit a real test through the live form** with DevTools console open.
   Expect the lead email AND the confirmation auto-reply, both delivered to
   estimates@burchcontracting.com.

</details>

## 1. Flip noindex → index — ✅ DONE, verified live 2026-07-19

Every page currently ships `<meta name="robots" content="noindex, nofollow" />`
**except** `404.html`, which must stay `noindex, nofollow` permanently.

`curl -s https://burchcontracting.com/ | grep -i noindex` returns nothing;
`curl -I` shows no `X-Robots-Tag: noindex` header. If this ever needs re-verifying
after a future deploy:

- Verify: `grep -rc 'noindex' burchcontracting-dev --include='*.html'` — only
  `404.html` should report a match.
- Run `npm run build` and re-check the grep against `dist/` too.
- Check the real production response, not just the local build: `curl -I
  https://burchcontracting.com/` (and a handful of other pages) for the
  `X-Robots-Tag` header, and `curl -s https://burchcontracting.com/ | grep -i
  noindex` for the meta tag.

## 2. Confirm reCAPTCHA secret is live on the server — ✅ site key confirmed; secret presumed live (server-side, unverifiable remotely)

`public/api/contact.php` reads `config.local.php` for `recaptcha_secret_key`.
If that file is missing, `verifyRecaptcha()` returns `null` immediately
and **spam verification is silently skipped** — the form still works, but with no bot
protection.

- Confirm `config.local.php` exists on the Hostinger server at
  `public_html/api/config.local.php` (it's gitignored, so this is a manual
  upload, not part of any deploy).
- Confirm it contains a real `recaptcha_secret_key`, not the
  `YOUR_RECAPTCHA_SECRET_KEY` placeholder from `config.local.php.example`.
- As of Phase 2 of the migration work, `config.local.php` also needs 5 SMTP keys
  (`smtp_host`/`port`/`username`/`password`/`secure`) for the contact form to actually
  send email — see `config.local.php.example` for the full current key list.

## 3. reCAPTCHA site key — single source of truth — ✅ verified matching live 2026-07-19

`src/js/main.js` reads the site key from `contact.html`'s
`data-recaptcha-site-key` attribute ONLY — there is no environment variable
in the build anymore. A prior `VITE_RECAPTCHA_SITE_KEY` GitHub Actions
secret used to override this value silently at build time, drifted out of
sync with `contact.html`, and was the actual root cause of the "Security
verification failed" / silent form failures chased across several earlier
fix attempts (editing `contact.html` alone never worked, because the secret
always won). That secret injection has been removed from
`.github/workflows/deploy.yml`; the build no longer reads it at all.

Two sync points remain, and only two:

- **Site key** (public, safe to commit) — `contact.html`'s
  `data-recaptcha-site-key` attribute. This is the only file that ever needs
  editing to change it.
- **Secret key** (never in git) — `recaptcha_secret_key` in
  `public/api/config.local.php` on the Hostinger server, hand-maintained
  (see item 2).

**Action still needed (human-only, item below):** delete the now-unused
`VITE_RECAPTCHA_SITE_KEY` from GitHub — both the repository secret
(Settings → Secrets and variables → Actions → Secrets) and the stray
environment of the same name if one exists (Settings → Environments).
Neither is read by the workflow anymore; leaving them in place is exactly
the kind of hidden second copy that caused this bug, waiting to bite again
the next time someone assumes it's still wired up.

**Current key (2026-07-12):** nicheprohub.com, burchcontracting.com, and
www.burchcontracting.com are all registered under one v3 key pair,
`6LcROk8tAAAAAGm5cv1I9sB5iDnPuSkyeq2Po-oG` (site key, in `contact.html`),
paired with its own secret in `config.local.php`. Verified working with a
real end-to-end test submission to the live form. Any older site-key values
referenced in earlier notes/commits are obsolete — this is the current one.

**Update 2026-07-12 (resolved):** the disappearing-`config.local.php` mystery
(item 2) was caused by Hostinger hPanel's own native Git integration, pointed
at this same repo, racing the proper GitHub Actions FTP workflow and
periodically overwriting the docroot with raw unbuilt source — which never
includes `config.local.php` since it's gitignored. **The integration was
permanently disconnected 2026-07-11.** Root cause found, not still open.

**Hard rule going forward:** the ONLY deployment path is the GitHub Actions
FTP workflow (`.github/workflows/deploy.yml`). Never reconnect hPanel's Git
integration. Never hand-edit files in the deployed docroot except
`api/config.local.php` (the one file the workflow deliberately excludes).
If the docroot is ever modified out-of-band (manual FTP edit, hPanel File
Manager, a reconnected integration, etc.), delete
`.ftp-deploy-sync-state.json` from the server root before the next deploy —
otherwise the FTP action's incremental sync trusts its stale state and may
skip files that need re-uploading.

## 4. Submit the sitemap in Search Console

Submit `https://burchcontracting.com/sitemap.xml` in Google Search Console
for the burchcontracting.com property. Confirms SEARCH_CONSOLE_VERIFICATION
ownership is in place before submitting.

## 5. Test one real form submission with a file attachment — ⏳ still open (human-only)

Submit the contact form on the live domain with a small image attached.
Confirm: the email arrives at estimates@burchcontracting.com, the attachment
is intact, and the on-page success state displays correctly.

**Update 2026-07-12:** the contact form now sends via authenticated SMTP (PHPMailer)
instead of PHP's `mail()` (Phase 2 of the migration work) — see `public/api/contact.php`
and item 2 above for the new required config keys. A real SMTP send has never been
confirmed against production: real credentials were never requested by or given to
Claude, and don't exist anywhere in this repo. This step is now doubly important —
confirm both that the email arrives, and that it lands in the inbox rather than spam.

## 6. Spot-check five old URLs redirect correctly — ✅ all 5 + www→bare-domain verified 2026-07-19

Using the `.htaccess` redirect map (`public/.htaccess`), check these resolve
with a single 301 hop to the expected new page:

- `https://burchcontracting.com/contact` → `/contact.html`
- `https://burchcontracting.com/garage-builder` → `/garages`
- `https://burchcontracting.com/service-areas/simpsonville` → `/service-areas/simpsonville.html`
- `https://burchcontracting.com/cost` → `/calculator/estimate.html`
- `https://burchcontracting.com/calculator/decks-screened-porches` → `/calculator/porch.html`

Also confirm `http://www.burchcontracting.com/` redirects to
`https://burchcontracting.com/` in one hop.

`public/.htaccess` also now covers a much larger legacy-URL surface (city×service
combinations, `/cost/*` articles, `/locations/*`, bare/underscore-style legacy slugs) —
validated against real Google Search Console click/impression data. See
`migration/gsc-validation-notes.md` for the full list and what's still deliberately left
unmapped (`/blog/*`, `/clients/` redirects temporarily to `/contact.html` until a real
page ships).

## 7. Point the deploy workflow at burchcontracting.com — ✅ DONE, verified live 2026-07-19

When cutting over from the nicheprohub.com staging docroot to the real
burchcontracting.com docroot:

- Update the FTP secrets (`FTP_SERVER`/`FTP_USERNAME`/`FTP_PASSWORD` and/or
  `server-dir` in `.github/workflows/deploy.yml`) to point at the
  burchcontracting.com hosting account/docroot.
- Set the `STAGING_URL` repository variable (Settings → Secrets and
  variables → Actions → Variables) to `https://burchcontracting.com` so the
  workflow's post-deploy verification step checks the right domain.
- Expect the **first** deploy to the new docroot to be a full upload — no
  `.ftp-deploy-sync-state.json` exists there yet, so every file gets sent
  (this is normal and expected, not the stale-sync-state failure mode). Note:
  as of 2026-07-11, this project's sync-state file has not been observed to persist
  between deploys even on the *current* nicheprohub.com docroot (every run logs "this
  must be your first publish!") — full re-uploads every time appear to already be the
  norm, not just a first-deploy-to-new-docroot event. Not yet root-caused; harmless so
  far (0 B deleted on every run checked) but worth watching after cutover.
- Setting `STAGING_URL` here is also what activates the `check-build.mjs` production
  noindex guard in the deploy workflow going forward (see the warning banner at the top
  of this file) — completing this step and step 1 together, in either order, is safe;
  the guard will simply confirm step 1 was done correctly on the next build after this
  variable is set.

## Human-only items — do not attempt via automation

These require access, credentials, or judgment that only Scott has. DNS cutover has
happened — burchcontracting.com is live and serving this site as of 2026-07-19. What
remains open:

- **SMTP credentials** in `public/api/config.local.php` on the server (see item 2) —
  never requested by or given to Claude; add directly on the server if not already done.
- **Delete the unused `VITE_RECAPTCHA_SITE_KEY` GitHub secret and environment** (item 3)
  — no longer read by the workflow; leaving it in place risks the same silent-drift bug
  recurring the next time someone assumes it's still wired up.
- **A live test lead through the production form**, confirmed received in the actual
  inbox, not spam (item 5) — never confirmed against production SMTP.
- **SPF/DKIM records** on the domain sending form notifications — authenticated SMTP
  still lands in spam without these.
- **Google Search Console**: submit the new sitemap (item 4), then monitor the Coverage
  report daily for 2 weeks post-launch. The legacy site currently has 93 URLs returning
  404 and 48 "crawled — currently not indexed" (see `migration/gsc-validation-notes.md`)
  — that number should fall after cutover, not stay flat or grow.
- **Google Business Profile** — update the website link to burchcontracting.com (site is
  now live, so this can be done).

Done (verified 2026-07-19, remote-checkable): noindex is off, deploy workflow targets
burchcontracting.com, reCAPTCHA site key matches, `config.local.php`/`contact.php`
endpoints are correctly locked down, and all spot-checked legacy redirects work.
