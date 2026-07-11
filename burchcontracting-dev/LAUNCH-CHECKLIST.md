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

The site key baked into the contact form
(`data-recaptcha-site-key="6Lc2ITgsAAAAAFUsZhRghHdgBEYDG0izDeTtd4Li"` in
`contact.html`) must have `burchcontracting.com` (and `www.burchcontracting.com`
if used) listed as an authorized domain in the Google reCAPTCHA admin console,
or verification will fail for every real visitor.

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
