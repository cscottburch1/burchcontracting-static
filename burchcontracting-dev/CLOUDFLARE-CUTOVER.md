# Cloudflare cutover

Moves page serving for burchcontracting.com from Hostinger to a Cloudflare
Worker, so search and AI crawlers never reach Hostinger's server.

## Why

Hostinger rate-limits automated traffic at the server level. On 2026-09-11,
requesting a page straight from the Hostinger server (156.67.71.222, bypassing
Cloudflare) returned **200 to a browser and 429 to GPTBot**. The live site
refused GPTBot on 12 of 14 pages. Hostinger documents these limits as applying
to all customers and says they
[cannot be disabled](https://www.hostinger.com/support/429-errors-on-automated-integrations-and-link-previews/)
per site. Neither Cloudflare's dashboard nor Hostinger's CDN AI Audit shows
them, because the refusal happens on the web server behind both.

## How it works

- **Pages** are served by the `burchcontracting` Worker from `dist/`, at
  Cloudflare's edge. Crawlers never reach Hostinger.
- **URLs, redirects and security headers are unchanged.** The Worker reads the
  same `public/.htaccess` Apache uses (`cloudflare/worker.js`,
  `cloudflare/htaccess.js`). `scripts/check-routing.mjs` proves it against
  `migration/routing-baseline.json`: 357 URLs (every page and its variants,
  plus 222 legacy Next.js URLs) recorded from the live Hostinger site on
  2026-09-11. Local test result: all 357 match. The only intentional
  difference is `/.htaccess`, which returns 404 instead of 403.
- **Stays on Hostinger:** `/api/*` (contact form, leads admin, PHP, MySQL),
  `/.well-known/*` (origin certificate renewal) and email (MX records). The
  Worker forwards those paths to Hostinger through the existing DNS record.
- **DNS doesn't change.** The Worker attaches to `burchcontracting.com` through
  a route. Deleting the route sends traffic straight back to Hostinger.
- **Hostinger stays a full fallback.** `deploy.yml` keeps FTP-deploying the
  whole site on every push to `main`. `cloudflare.yml` deploys the Worker.
- **Guardrail:** `crawler-access.yml` runs daily and fails, with an email from
  GitHub, if any of 12 search/AI crawler user agents gets anything but 200 on
  any page.

## Step 1 — API token and GitHub secrets (Scott)

1. Cloudflare dashboard → **Workers & Pages**. On first visit it asks you to
   choose a `workers.dev` subdomain. Pick any name; it's only used for
   previews.
2. **My Profile → API Tokens → Create Token →** template **Edit Cloudflare
   Workers**. Account Resources: your account. Zone Resources:
   `burchcontracting.com`. Create the token and copy it.
3. Copy the **Account ID** from the `burchcontracting.com` overview page (right
   column).
4. GitHub → `burchcontracting-static` → **Settings → Secrets and variables →
   Actions** → add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. **Actions → Deploy to Cloudflare → Run workflow** on the
   `cloudflare-hosting` branch. It uploads a preview version (never the live
   Worker) and checks it: commit marker, every page byte-for-byte, all 357
   routing results, and all crawlers. The preview URL is printed in the log.

## Step 2 — Review the preview (Scott)

Click through the preview URL: home, a service page, a calculator (try it),
projects, a service area. The contact form won't submit on the preview,
because `/api` forwarding only works on the real domain. It's tested at
cutover.

## Step 3 — Merge to main (no production change)

Merging deploys the Worker to its `workers.dev` address only. Production is
still Hostinger. From now on, the daily crawler check fails until cutover.
That failure is the Hostinger 429s, not a new problem.

## Step 4 — Cloudflare settings (before cutover)

Two of these are **required**. Today the Hostinger server performs both
redirects: on 2026-09-11, every `http://` and `www` redirect carried
`platform: hostinger`. After cutover those requests reach the Worker, and
Cloudflare's asset server can't redirect them. Without these settings,
`http://` pages would be served unencrypted and `www` would still hit Hostinger.

- **Required — SSL/TLS → Edge Certificates → Always Use HTTPS:** On.
- **Required — Rules → Redirect Rules → Create rule →** template **Redirect
  from WWW to root**. Status 301, preserve query string. It does exactly what
  Hostinger does now, so it's safe to add before cutover.
- **SSL/TLS → Overview:** leave the current mode as is. It already reaches
  Hostinger, which `/api` forwarding needs.
- **Security → Bots:** Bot Fight Mode off.
- **AI Crawl Control:** no AI crawler set to Block. Managed robots.txt off.
- **Caching → Cache Rules:** nothing that caches `/api/*`.

## Step 5 — Cutover (together, about 15 minutes)

The cutover is one pull request (branch `cloudflare-cutover`). Merging it is
the switch:

- `wrangler.jsonc` gains
  `"routes": [{ "pattern": "burchcontracting.com/*", "zone_name": "burchcontracting.com" }]`.
  `workers_dev` stays on because branch preview URLs require it.
- `cloudflare.yml` verifies `https://burchcontracting.com` itself on `main`,
  including the `http://` → `https://` and `www` → root redirects.
- `deploy.yml` verifies Hostinger through `/api/version.txt`, a copy of the
  version marker that only Hostinger serves. The page-by-page content check is
  done by `cloudflare.yml`.

When both workflows are green:

1. `curl -sI https://burchcontracting.com/garages/` shows no
   `platform: hostinger` header.
2. `node scripts/check-crawler-access.mjs` passes.
3. Submit a real contact-form enquiry. Confirm the email arrives and the lead
   shows in `/api/admin/`.
4. Search Console → URL Inspection → **Test live URL** on the home page and
   two service pages.
5. Run **Crawler access check** manually from Actions. It should pass.

## Rollback (1 minute)

Cloudflare dashboard → **Workers & Pages → burchcontracting → Settings →
Domains & Routes** → delete the `burchcontracting.com/*` route. Traffic
returns to Hostinger immediately through the unchanged DNS record, and
Hostinger already has the current site. Then revert the cutover commit so the
next deploy doesn't re-add the route.

## After cutover

- Keep Hostinger web hosting at least 30 days, and after that for as long as
  `/api/*` lives there.
- Optional later: move the contact form and leads admin into the Worker
  (Cloudflare D1 database plus an email-sending service) and cancel Hostinger
  web hosting. Email hosting is separate and can stay.
- When URLs or redirects change on purpose (the legacy-URL restoration), re-record
  the baseline: `node scripts/check-routing.mjs --record https://burchcontracting.com`.

## Separate issue: two SPF records

DNS has two SPF records:

```
v=spf1 include:_spf.mail.hostinger.com ~all
v=spf1 ip4:156.67.71.222 include:burchcontracting.com ~all
```

A domain may have only one. With two, SPF checks fail, which can push
contact-form notifications and customer confirmation emails into spam. The
second record also includes itself. Replace both with one record that keeps
both senders:

```
v=spf1 ip4:156.67.71.222 include:_spf.mail.hostinger.com ~all
```
