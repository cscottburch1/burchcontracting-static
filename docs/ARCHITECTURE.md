# Architecture

A 71-page static site, generated from data, served by a Cloudflare Worker.

Nothing in `dist/` is written by hand and nothing generated is committed. If it
can be built, it is built — that rule is what the whole of this layout exists to
make true, and `check-build` enforces the parts of it a person could break.

---

## The pipeline

```
  src/data/*.js          facts: services, cities, guides, pricing, nav,
       │                 page metadata, redirects, dates
       │
  src/templates/*.html   the <main> body of each hand-authored page, with
       │                 line placeholders — {{trust.*}}, {{calculator.table}},
       │                 {{calculator.intro}}, {{home.services}} — and inline
       │                 price tokens {{price|range|prose.<service-id>}}
       │
       ▼
  src/build/*.mjs        pure render({ dates }) → [{ url, file, html }]
       │                 guides · services · geo · pages
       │                 + trust-layer, calculator-tables, home-grid,
       │                   prices (the inline tokens), placeholders,
       │                   content-dates, llms
       │
       ▼
  src/build/index.mjs    the ONE entry point. Writes every page to
       │                 .build/pages/, and sitemap.xml and llms.txt to .build/
       │
       ▼
  .build/pages/          gitignored. The only directory vite scans.
       │                 ← most of check-build reads here
       ▼
  vite build             bundles JS/CSS, content-hashes assets; then
       │                 write-sitemap, write-llms and generate-cloudflare-files
       │                 copy .build/sitemap.xml and .build/llms.txt into dist/
       │                 and write dist/_headers
       ▼
  dist/                  what ships: pages + sitemap.xml, llms.txt, _headers.
       │                 The Deploy workflow adds version.txt and a
       │                 <!-- build:<sha> --> stamp at deploy time only.
       │                 ← check-schema, check-links, check-tier1, the chrome/
       │                   noindex/reCAPTCHA checks, the snapshot, and the
       │                   deploy verification all read here
       ▼
  cloudflare/worker.js   run_worker_first: sees every request before the
                         asset server. Redirects, clean URLs, headers, /api/*
```

`src/chrome/index.mjs` sits beside the generators: one `<head>`, one header, one
footer, used by all four. `check-build` asserts a single header hash and a
single footer hash across all 70 governed pages, so a second copy cannot
reappear quietly. `404.html` is the one exemption and always will be.

---

## Where each kind of fact lives

There is exactly one place for each. That is the whole point; when two places
held the same fact, whichever one you edited, the other could win.

| Fact | Lives in |
|---|---|
| Services: names, slugs, pricing tiers, copy | `src/data/services.js` |
| Service FAQs | `src/data/service-faqs.js` (keyed by `service.id`) |
| The /services comparison columns | `src/data/service-comparison.js` |
| Cities, global FAQs, local conditions | `src/data/geo-aeo.js` |
| Cost guides and articles | `src/data/guides-cost.js`, `guides-articles.js` |
| Prices | `src/js/calculator-config.js` — `PRICING_CONFIG`, the ADA line items and `adaBathEstimate()`, and `QUOTED_RATES` for owner-quoted prices — read through `src/data/pricing-sync.js`. See `PRICING.md`. |
| Calculator intro paragraphs | `src/data/calculator-intros.js` (computed; rendered as the hero and as the pricing-table answer) |
| Dollar figures that are not our prices | `src/data/cited-figures.js`, each with its source |
| Homepage service grid cards | `src/data/home-cards.js` (content per card; order comes from `servicesByTier()`) |
| Visible-text hashes of hand-dated pages | `textHashes` in `src/data/content-date-overrides.json`, written by `scripts/record-text-hashes.mjs` |
| `llms.txt` | rendered by `src/build/llms.mjs` from url-map, services, guides and prices |
| Every URL on the site | `src/data/url-map.js` |
| Legacy redirects | `cloudflare/redirects.js` |
| Security headers | `cloudflare/headers.js` |
| Navigation | `src/data/nav.js` |
| Head metadata for hand-authored pages | `src/data/pages.js`, `src/data/calculators.js` |
| Promoted FAQ answers | `src/data/promoted-faqs.js` |
| Content dates | derived from git by `src/build/content-dates.mjs`; corrections only in `src/data/content-date-overrides.json` |
| Schema building blocks | `src/data/site-schema.js` |
| The reCAPTCHA **site** key | `src/templates/contact.html`, `data-recaptcha-site-key` — nowhere else |

**Prices are the strictest of these.** Every dollar figure on the site is
computed from `calculator-config.js` through `pricing-sync.js`, in one of three
roundings: exact in tables, `displayRound()` in headlines, `proseRound()` in
sentences. `check-build`'s check 12 fails when a service's headline disagrees
with its own table, or when a price in its prose is not the rounding of a table
figure or a declared cited figure. That is how a hand-typed number gets caught.
Check 6 confirms each calculator intro's per-square-foot band against the
calculator. The intros are computed in `calculator-intros.js`, not typed.
`PRICING.md` has the details.

---

## Generated vs committed

**Committed:** everything under `src/`, `cloudflare/`, `scripts/`, `public/`,
`docs/`, plus `404.html` at the root.

**Generated, never committed:** `.build/`, `dist/`. Both are gitignored.

`404.html` is the only `.html` file in the repo outside `src/templates/`. It is
copied verbatim rather than rendered: it must keep `noindex` permanently, it has
no entry in `PAGE_URLS`, and it is the one page whose chrome may differ.

---

## Which gate reads which tree

This matters more than it looks, and getting it wrong has produced a wrong
conclusion at least once: **a tamper test must tamper the tree the gate
actually reads**, or it proves nothing.

| Gate | Reads | Why that tree |
|---|---|---|
| `check-build` 1, 3c, 3d, 5, 8, 9, 10, 13, 14 | `.build/pages/` | Pre-bundle source form, where pages still reference `/src/js/main.js` by path. The right layer for source-level assertions: an inline nav handler, a `main.js` reference, a noindex meta, visible text, titles and descriptions, the dates in the JSON-LD. |
| `check-build` 2 | **both** | Hrefs from `.build/pages/`, the URL list from `dist/sitemap.xml`. The sitemap is only written to `dist/`. |
| `check-build` 3, 3b, 4 | `dist/` | They verify what ships. The staging noindex is injected into `dist/` only; the chrome hash must match on the bundled output, not the source form; the reCAPTCHA key check is about the deployed bundle. |
| `check-build` 6, 7, 12 | `src/` | Neither tree. Check 6 compares the per-sq-ft band in each calculator intro (`src/data/calculator-intros.js`) against `servicePerSqftBand()`; check 7 reads `src/data/`; check 12 compares each service's headline and prose prices against its own table rows. Incomplete data and drifting prices are facts about the source, and catching them there names the map, the slug or the service rather than the blank cell they would have produced. |
| `check-build` 11, 15 | `src/` **and** `.build/pages/` | Check 11 compares the nav data in `src/data/nav.js` with the tier order and reads the rendered footer. Check 15 recomputes each hand-dated page's visible-text hash from `.build/pages/` against the `textHashes` and `dates` in `src/data/content-date-overrides.json`. |
| `check-schema` | `.build/pages/` and `dist/` | Parses every JSON-LD block and resolves every on-site `@id`/url against `dist/sitemap.xml`. A gate reading two trees can be satisfied by a stale one, so both come from the same build. |
| `check-links` | `.build/pages/` and `dist/` | Every internal href must resolve; every sitemap URL needs an inbound link. |
| `check-tier1` | `dist/` | The four Tier 1 service pages as they ship: 6+ FAQs, own calculator, a cost guide, headline agreeing with its table. |
| `check-wrangler-config` | `wrangler.jsonc` | No Cloudflare-side `build` block; `run_worker_first` and the asset settings that must not change. |
| `check-routing` | a running Worker | Status codes, redirect targets and headers are Worker behaviour, not file contents. Locally a `wrangler dev` that `npm test` starts; on deploy, production. |
| `check-crawler-access` | production | Every search and AI crawler gets a 200 on robots.txt, llms.txt, the sitemap and every page. Runs daily (`crawler-access.yml`) and on deploy; not in `npm test`, because it needs the live site. |
| `snapshot-dist.mjs` | `dist/` | Post-bundle, where vite has hoisted module scripts and hashed assets. |

Neither tree is sufficient alone. The double-bound mobile menu existed
pre-bundle as a duplicate handler and post-bundle as two live listeners; a gate
reading only one tree sees half the picture.

**All of them need `npm run build` to have run first.** Run on their own they
will happily validate a previous build's output — which has happened, when a
`vite preview` or `wrangler dev` held a Windows lock on `dist/`, the build
failed with `EPERM`, and the gates passed against yesterday's files.

---

## The Worker

`cloudflare/worker.js`, with `run_worker_first: true`, sees every request before
the asset server. In order:

1. `/api/*` → `cloudflare/api.js` (contact form, leads admin, D1).
   `/.well-known/*` → forwarded to the Hostinger origin for certificate renewal.
2. The 2026-07 rebuild's URLs (`/about.html`, `/garages/`) → 301 to the restored
   URL from `url-map.js`.
3. A real page for the clean URL, from `about.html` or
   `garage-builder/index.html`. This comes **before** the legacy rules, because
   the catch-all `^calculator/([a-z-]+)/?$` would otherwise hijack
   `/calculator/garages`.
4. Legacy redirects from `cloudflare/redirects.js`.
5. `404.html`, with a 404 status.

`run_worker_first` is load-bearing and `check-wrangler-config` asserts it. Two
consequences that are easy to forget:

- **`dist/_headers` is inert.** The Worker sets the security headers itself. The
  file is still written as a fallback and as documentation.
- **No `_redirects` file is generated, deliberately.** Cloudflare applies
  `_redirects` to internal `env.ASSETS.fetch()` calls as well as inbound
  requests, so an `/about.html → /about` rule there also rewrote the Worker's
  own lookup of `about.html` and made `/about` 301 to itself.

---

## Hosting

Cloudflare Workers serves the pages; D1 stores leads; Resend sends mail.
Hostinger is **not** a web host any more — it is the domain registrar and the
DNS origin, and holds an old mail store until December 2026. It receives no copy
of the site, which is why rollback is `wrangler rollback` and never deleting the
Worker route. See `RUNBOOK.md`.
