# Launch Checklist

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

## 2. Confirm reCAPTCHA secret is live on the server

`public/api/contact.php` reads `config.local.php` for `recaptcha_secret_key`.
If that file is missing, `verifyRecaptcha()` returns `null` immediately
(`public/api/contact.php:42-44`) and **spam verification is silently
skipped** — the form still works, but with no bot protection.

- Confirm `config.local.php` exists on the Hostinger server at
  `public_html/api/config.local.php` (it's gitignored, so this is a manual
  upload, not part of any deploy).
- Confirm it contains a real `recaptcha_secret_key`, not the
  `YOUR_RECAPTCHA_SECRET_KEY` placeholder from `config.local.php.example`.

## 3. Confirm the reCAPTCHA site key is registered for burchcontracting.com

`src/js/main.js:42-45` reads the site key from `import.meta.env.VITE_RECAPTCHA_SITE_KEY`
**first**, falling back to `contact.html`'s hardcoded
`data-recaptcha-site-key="6Lc2ITgsAAAAAFUsZhRghHdgBEYDG0izDeTtd4Li"` only if
that env var is unset. `.github/workflows/deploy.yml:32` injects
`VITE_RECAPTCHA_SITE_KEY` from the GitHub Actions secret of the same name at
build time — so **the secret's value, not the hardcoded fallback, is what
production actually uses.**

- The `VITE_RECAPTCHA_SITE_KEY` secret exists on the `burchcontracting-static`
  repo (confirmed via `gh secret list`, set 2026-07-08) — its value can't be
  read via the CLI, so confirm in the Google reCAPTCHA admin console which
  site key it holds, and that `burchcontracting.com` (and `www.` if used) is
  an authorized domain for that key.
- Separately, the current staging domain (nicheprohub.com) uses its own site
  key, `6Le5vkEtAAAAAKMZtQ-YahscAQXHygBRDBGutTuD` — that's why the form works
  there regardless of what's hardcoded in `contact.html` or set in the CI
  secret. Don't confuse "it works on staging" with "the prod key is correct."
- If the secret's key isn't registered for burchcontracting.com, update the
  `VITE_RECAPTCHA_SITE_KEY` GitHub secret (not `contact.html`) before launch.

## 4. Submit the sitemap in Search Console

Submit `https://burchcontracting.com/sitemap.xml` in Google Search Console
for the burchcontracting.com property. Confirms SEARCH_CONSOLE_VERIFICATION
ownership is in place before submitting.

## 5. Test one real form submission with a file attachment

Submit the contact form on the live domain with a small image attached.
Confirm: the email arrives at estimates@burchcontracting.com, the attachment
is intact, and the on-page success state displays correctly.

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
  (this is normal and expected, not the stale-sync-state failure mode).
