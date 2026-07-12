# Launch Checklist

## 🔧 Recovery deploy — do now

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

## ⚠️ REMOVE THE SITE-WIDE `noindex` — 39 pages

If this ships, Google deindexes burchcontracting.com within days. Verify with a live
`curl -I` of production headers AND a grep of built HTML, before and after deploy.

This is step 1 below — the warning is repeated here at the top because it's the single
highest-consequence mistake on this whole list. As of 2026-07-12,
`scripts/check-build.mjs` (wired into `.github/workflows/deploy.yml` as the "Build guard
(check-build)" step) automatically starts enforcing this in CI the moment the
`STAGING_URL` repository variable is set to `https://burchcontracting.com` — i.e. at the
same moment as step 7 below. That catches regressions on future builds; it does not flip
`noindex` for you now, and does not replace the manual curl/grep check against the
actual live production response before you consider launch done.

Complete these in order on launch day. FLIP_NOINDEX_NOW was set to "no" during
pre-launch prep, so noindex is still active site-wide — step 1 turns it off.

## 1. Flip noindex → index

Every page currently ships `<meta name="robots" content="noindex, nofollow" />`
**except** `404.html`, which must stay `noindex, nofollow` permanently.

- Change every page's robots meta to `content="index, follow"` (hand-written
  pages + both generator templates in `scripts/`, then regenerate).
- Verify: `grep -rc 'noindex' burchcontracting-dev --include='*.html'` — only
  `404.html` should report a match.
- Run `npm run build` and re-check the grep against `dist/` too.
- **Before AND after the live deploy**, verify the real production response, not just
  the local build: `curl -I https://burchcontracting.com/` (and a handful of other
  pages) to confirm no `X-Robots-Tag: noindex` response header, and separately
  `curl -s https://burchcontracting.com/ | grep -i noindex` to confirm the meta tag is
  actually gone from what's being served — not just what's in this repo.

## 2. Confirm reCAPTCHA secret is live on the server

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

## 3. reCAPTCHA site key — single source of truth

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

## 5. Test one real form submission with a file attachment

Submit the contact form on the live domain with a small image attached.
Confirm: the email arrives at estimates@burchcontracting.com, the attachment
is intact, and the on-page success state displays correctly.

**Update 2026-07-12:** the contact form now sends via authenticated SMTP (PHPMailer)
instead of PHP's `mail()` (Phase 2 of the migration work) — see `public/api/contact.php`
and item 2 above for the new required config keys. A real SMTP send has never been
confirmed against production: real credentials were never requested by or given to
Claude, and don't exist anywhere in this repo. This step is now doubly important —
confirm both that the email arrives, and that it lands in the inbox rather than spam.

## 6. Spot-check five old URLs redirect correctly

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

## 7. Point the deploy workflow at burchcontracting.com

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

These require access, credentials, or judgment that only Scott has:

- **DNS cutover** — and take a full backup of the current live (legacy Next.js)
  burchcontracting.com site first, before pointing DNS anywhere new.
- **SMTP credentials** in `public/api/config.local.php` on the server (see item 2) —
  never requested by or given to Claude; add directly on the server.
- **Delete the unused `VITE_RECAPTCHA_SITE_KEY` GitHub secret and environment** (item 3)
  — no longer read by the workflow; leaving it in place risks the same silent-drift bug
  recurring the next time someone assumes it's still wired up.
- **A live test lead through the production form**, confirmed received in the actual
  inbox, not spam (item 5).
- **SPF/DKIM records** on the domain sending form notifications — authenticated SMTP
  still lands in spam without these.
- **Google Search Console**: submit the new sitemap (item 4), then monitor the Coverage
  report daily for 2 weeks post-launch. The legacy site currently has 93 URLs returning
  404 and 48 "crawled — currently not indexed" (see `migration/gsc-validation-notes.md`)
  — that number should fall after cutover, not stay flat or grow.
- **Google Business Profile** — update the website link to burchcontracting.com once
  live.
