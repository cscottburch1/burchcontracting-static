<!--
Plan of record for the 2026-09-21 cleanup, copied verbatim from the owner's
working folder into the repository on review feedback: a "do or die" refactor
plan should not exist only on one laptop.

This is the SECOND revision. The first was corrected after a pre-flight check
against the repo found four stale facts and one ordering bug:
  - the "357 routing URLs" gate figure (baseline holds 402; check-routing
    compares 481; the gate is zero differences, not a count)
  - a Phase 1 step to delete a stray tracked path that was already gone
  - "73 source pages carry noindex" (it was 71)
  - no stated branch base for the Phase 0 baseline snapshot
  - Phase 4 deleted cloudflare/htaccess.js while scripts/check-routing.mjs still
    imported it — i.e. it removed the gate that proves that phase safe. The
    revision below names all four .htaccess consumers and orders the deletions
    behind a passing check-routing.

Unedited below this line.
-->

# Burch Contracting — Full Repo Cleanup and Deploy Hardening

Paste everything below this line into Claude Code (VS Code) with the `burchcontracting-static` repo open at its root.

---

## Mission

This repo (`cscottburch1/burchcontracting-static`) powers burchcontracting.com, a lead-generation site for a licensed general contractor in Upstate SC. Since the July 2026 cutover the team has been fixing symptoms: three site-wide `noindex` incidents on one day, secrets wiped by a duplicate deploy path, phantom git diffs after every build, hand-maintained dates, generators that drift from each other, and two hosts kept in sync by hand.

Your job is a single, disciplined pass that leaves this repo with **one source of truth for every fact, one build, one deploy path, and gates that make the past incidents impossible to repeat.** Rankings and leads depend on this. Do it right, do it once.

You are working on a branch. You will commit after each phase, run the gates, and open one PR at the end. You will not push to `main`.

## Hard invariants — violate any of these and the work is rejected

1. **Zero URL changes.** Every URL in `burchcontracting-dev/public/sitemap.xml` (70) returns 200 before and after. Every entry in `migration/routing-baseline.json` resolves exactly as recorded (zero differences; report the actual entry count, the doc's old "357" is stale). `node scripts/check-routing.mjs` against a local build must pass before every commit that touches routing, redirects, the worker, or url-map.
2. **Zero content loss.** No page loses visible text, FAQs, tables, schema types, images, or internal links. Before you refactor any generator, snapshot the rendered DOM text and JSON-LD of every page in `dist/` to a temp file; after the refactor, diff. Whitespace and attribute-order differences are acceptable; anything else must be justified in the commit message.
3. **Zero pricing changes** unless they come from `src/js/calculator-config.js` via `src/data/pricing-sync.js`. Read `PRICING.md` first.
4. **Zero secrets in the repo.** The five Worker secrets (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `RESEND_API_KEY`, `RECAPTCHA_SECRET_KEY`) and the reCAPTCHA site key handling per `LAUNCH-CHECKLIST.md #3` stay exactly as they are. Never run `wrangler deploy`, `wrangler secret`, or any FTP action. You are preparing the deploy; a human runs it.
5. **No deletion without a replacement or a git-history note.** Files are removed only when their purpose is now served elsewhere, and the commit message names where.
6. **Read before write, always.** This repo has 229 commits of hard-won context in file headers and `LAUNCH-CHECKLIST.md`. Every comment that says "this was tried and failed" is a landmine map. Read `LAUNCH-CHECKLIST.md`, `CLOUDFLARE-CUTOVER.md`, `FINDINGS.md`, `.github/workflows/cloudflare.yml` (the header comment), and the header of every `scripts/*.mjs` before touching anything.

## Target architecture

When you are done the repo looks like this. Reach it in the phase order below.

```
/                              ← repo root IS the project (no burchcontracting-dev/ nesting)
├── src/
│   ├── data/                  ← the only place facts live: services, FAQs, guides, geo, dates, url-map, site
│   ├── templates/             ← hand-authored page bodies (index, about, contact, services, projects, faqs, legal) — NO nav, NO footer, NO <head>
│   ├── chrome/                ← ONE head/nav/footer/author-box/FAQ module used by every page
│   ├── css/  js/
│   └── build/                 ← generators, all importing chrome/ and data/, none writing at module top level
├── public/                    ← static assets only (images, robots, llms.txt, verification files). No .htaccess, no PHP.
├── cloudflare/                ← worker.js, api.js, schema.sql. Redirects and headers imported from src/data, not parsed from .htaccess
├── scripts/                   ← check-*.mjs gates, compute-content-dates, indexnow, admin-hash
├── migration/                 ← legacy-urls.txt, routing-baseline.json, baseline-2026-09.md ONLY (the rest → docs/archive/)
├── docs/
│   ├── ARCHITECTURE.md        ← how a page gets from data to the edge, in one page
│   ├── RUNBOOK.md             ← deploy, verify, rollback, rotate a secret, add a page, add a service, add a city
│   ├── DECISIONS.md           ← dated ADR-style entries; every "we tried X and it broke" from the old docs lives here
│   └── archive/               ← every dated audit/report/checklist, untouched, for history
├── .github/workflows/
│   ├── ci.yml                 ← PRs and pushes: build + all gates, no deploy
│   ├── deploy.yml             ← main only: build → gates → wrangler deploy → post-deploy verification → rollback on failure
│   └── crawler-access.yml     ← keep, daily
├── .gitattributes  .nvmrc  .editorconfig  package.json  vite.config.js  wrangler.jsonc  README.md
```

`dist/` is never committed. Generated HTML is never committed. If it can be built, it is built.

## Phase 0 — Baseline (no changes yet)

1. `cd burchcontracting-dev && npm ci && BUILD_ENV=production npm run build && npm run check-build`. Record the result. If it fails, stop and report; do not fix it here.
2. Write `scripts/snapshot-dist.mjs`: for every `dist/**/*.html`, extract (a) visible text with nav/footer stripped, normalized whitespace; (b) every JSON-LD block parsed and sorted; (c) `<title>`, canonical, robots, description; (d) all internal `href`s. Write to `/tmp/snapshot-before.json` keyed by public URL from `src/data/url-map.js`. This is your content-loss gate for the rest of the work. Take it from the branch base agreed with the owner (main, after today's sitemap and docs fixes are merged), never from a stale branch.
3. Run `node scripts/check-routing.mjs` against `vite preview` (or the worker via `wrangler dev` if that's what the script expects) and confirm zero differences from the baseline.
4. Commit nothing yet. Create branch `cleanup/one-source-of-truth`.

## Phase 1 — Flatten and de-clutter (mechanical, zero-risk)

1. `git mv burchcontracting-dev/* .` and `git mv burchcontracting-dev/.[!.]* .` where they don't collide. Delete the empty directory. Fix every path reference: workflows' `working-directory`, `cache-dependency-path`, `vite.config.js` root, any script that resolves `..`. The root-level `FINDINGS.md` and `.github/` fold into the new layout.
2. Confirm the stray path `sitemap.xml/xml version=1.0 encoding=UTF-8.txt` is no longer tracked (`FINDINGS.md #1` is stale); no-op if already gone.
3. Add `.gitattributes` with `* text=auto eol=lf` and a `.editorconfig`. Renormalize: `git add --renormalize .`. This ends the mixed-CRLF phantom diffs (`FINDINGS.md #3`).
4. Pin one Node version everywhere: `.nvmrc` = `22`, `package.json` `engines.node` = `>=22`, every workflow `node-version-file: .nvmrc`. Today `deploy.yml` uses 20 and `cloudflare.yml` uses 22.
5. Move dated documents to `docs/archive/`: `CITABILITY-FACTS-NEEDED.md`, `CITABILITY-REPORT.md`, `STRUCTURED-DATA-AUDIT.md`, `SCHEMAS-BY-PAGE.md`, `LAUNCH-CHECKLIST.md`, `CLOUDFLARE-CUTOVER.md`, `DEPLOYMENT.md`, `FINDINGS.md`, `docs/2026-08-kitchen-launch.md`, `migration/audit-report.md`, `migration/gsc-validation-notes.md`, `migration/inventory.csv`, `migration/link-asset-issues.csv`, `migration/nicheprohub-redirect.htaccess`, `migration/_summary.json`, `citability-baseline.json`, `tools/`. Do not edit their contents. Before moving each, harvest every "tried X, it failed because Y" into `docs/DECISIONS.md` with the date. Keep `PRICING.md` at root.
6. Commit: `chore: flatten repo, normalize line endings, pin Node 22, archive dated docs`. Build and run check-build. Snapshot must match.

## Phase 2 — Invert the noindex model (highest-risk fix, do it early and prove it)

The current model commits `<meta name="robots" content="noindex, nofollow">` into ~71 source pages and relies on `BUILD_ENV=production` + `scripts/flip-noindex-production.mjs` to rewrite `dist/`. A build without that env var ships noindex on every page. This has happened three times in one day. The safe state must be the default state.

1. Source pages and the chrome module emit `index, follow` (or omit the robots meta entirely; pick one and apply it everywhere). `404.html` keeps `noindex` permanently.
2. Replace `flip-noindex-production.mjs` with `scripts/apply-staging-noindex.mjs` that runs only when `BUILD_ENV=staging` and injects noindex. Production needs no env var to be correct.
3. Additionally, in `cloudflare/worker.js`, add `X-Robots-Tag: noindex, nofollow` on any response where the request hostname is not `burchcontracting.com` (covers every `workers.dev` preview URL, which is currently protected only by canonical tags).
4. `check-build` assertion #3 becomes: **fail if any `dist/**/*.html` other than `404.html` contains noindex unless `BUILD_ENV=staging`.** Make it also fail if `robots.txt` in dist contains `Disallow: /`.
5. Remove every `BUILD_ENV=production` from workflows and docs; it no longer means anything.
6. Commit: `fix(seo): make index,follow the default; noindex only by explicit staging build`. Prove it: a plain `npm run build` followed by `grep -rl noindex dist` returns only `dist/404.html`.

## Phase 3 — One chrome, one generator pipeline, no committed output

`scripts/page-chrome.mjs` already exists and its header explains the problem: `generate-services.mjs` and `generate-geo-aeo.mjs` each carry a verbatim copy of head/nav/footer and cannot import each other because both write files at module top level. `generate-trust-layer.mjs` patches markers into committed hand-authored pages. Fix all of it.

1. Move `page-chrome.mjs` to `src/chrome/index.mjs`. Make it the only place `<head>`, header/nav, footer, author box, FAQ accordion, breadcrumb, and the mobile-nav inline script are defined. Nav structure comes from `src/data/services.js` + `src/data/geo-aeo.js` + `url-map.js`, not literals.
2. Convert every generator into a pure function `render(data) -> { url, html }` in `src/build/`. One entry point `src/build/index.mjs` calls them all and writes to `.build/pages/` (gitignored). `vite.config.js` discovers inputs from `.build/pages/` by scanning, never a hand-list.
3. Move the 8 hand-authored pages (`index`, `about`, `contact`, `services`, `projects`, `faqs`, `privacy-policy`, `terms-of-service`) to `src/templates/` containing only their `<main>` body. They are rendered through the same chrome. The "trust layer" (compare-all-services table, permit tables, etc.) becomes a render-time include, not an in-place patch. Delete the patch-marker mechanism.
4. Make the generators **fail the build** on missing data instead of rendering blanks: `CHOOSE_IF` and `PERMIT_REQUIRED` in the trust layer must have an entry for every service slug (`FINDINGS.md #2`), every service must have FAQs, every page must have a unique title and description. Add these to `check-build`.
5. Delete the 40+ generated `*/index.html`, `service-areas/*.html`, `calculator/*.html`, `cost/*.html`, `blog/*.html` from git and add the output dir to `.gitignore`. The data files are the source. `scripts/rewrite-urls.mjs` becomes unnecessary once no HTML is committed; delete it after confirming.
6. Content dates: `compute-content-dates.mjs` runs at build time in CI with `fetch-depth: 0`, keyed per data entry (a service's date is the last commit that touched its slug's block, via `git log -L` or `-S`), and merges `src/data/content-date-overrides.json` last (this replaces the hand-reverted legal-page dates documented in `FINDINGS.md #8`, which have now been lost three times, and fixes the wrong `datePublished` in `#7`). `content-dates.js` is no longer committed.
7. Commit. Then the gate that matters: rebuild, run `snapshot-dist.mjs` to `/tmp/snapshot-after.json`, and diff against before. Every page's visible text, JSON-LD set, title, canonical, robots, and internal link set must be identical. Print the diff. If anything differs, fix it or document exactly why in the commit body. Run `check-routing` — zero differences.

## Phase 4 — One host, one API, one redirect table

Hostinger is now a stale fallback that costs a second deploy path, a second API (PHP + PHPMailer), and `.htaccess` as the source of truth that the Worker has to parse. Cloudflare keeps deployed versions, so `wrangler rollback` is the rollback.

`public/.htaccess` has four consumers: `cloudflare/worker.js`, `scripts/generate-cloudflare-files.mjs`, `scripts/check-routing.mjs`, and the `Text` rule in `wrangler.jsonc`. One of them is the gate that proves this phase safe, so the order below is mandatory.

1. Create `src/data/redirects.js` (exported array of `{ from, to, status }` plus the regex families for the legacy Next.js tree, carrying the same GSC-evidence comments) and `src/data/headers.js` from `.htaccess`. Merge `url-map.js` `MOVED_URLS` into `redirects.js` so there is one list.
2. Repoint all three code consumers at them: `cloudflare/worker.js`, `scripts/generate-cloudflare-files.mjs` (still writes `dist/_headers` as the documented fallback), and `scripts/check-routing.mjs`.
3. Remove the `rules` entry for `**/.htaccess` from `wrangler.jsonc`. Keep `run_worker_first: true` and the route. Add a comment block at the top pointing to `docs/RUNBOOK.md`.
4. Run `check-routing` against `wrangler dev`: zero differences from the baseline. Do not continue until it passes.
5. Only now delete `public/.htaccess`, `cloudflare/htaccess.js`, `public/api/` (all PHP, PHPMailer, admin, email template — the Worker + D1 + Resend replaced them on 2026-09-15), `.github/workflows/deploy.yml` (Hostinger FTP), and every FTP/SFTP reference. Record in `DECISIONS.md`: Hostinger web hosting retired as a deploy target on <today>; hosting account may be kept for `/.well-known` and email only; rollback is `wrangler rollback`.
6. Verify the Worker still forwards `/.well-known/*` to the origin host and that `/api/*` is untouched by anything you changed.
7. Commit. `check-routing` zero differences against `wrangler dev`.

## Phase 5 — One CI path, with gates that would have caught every past incident

Replace `cloudflare.yml` with two workflows.

`ci.yml` (every PR and every push to any branch):
- `npm ci` → `npm run build` → `npm test`.
- `npm test` = `check-build` + `check-routing` (against `vite preview` or `wrangler dev`) + `check-schema` (new: every JSON-LD block parses, has `@type`, `@id` URLs match `url-map`, every FAQPage question is visible text, every Service has a matching sitemap URL) + `check-links` (new: every internal href in dist resolves to a dist file or a redirect entry; every sitemap URL has ≥1 inbound link) + a `noindex` scan.
- Uploads `dist/` as an artifact.

`deploy.yml` (push to `main` only, `concurrency` group with `cancel-in-progress: false`, plus `workflow_dispatch`):
1. Same build + gates as CI.
2. `wrangler deploy` (never `versions upload` + `versions deploy`; the 2026-09-16 comment in the old workflow explains why).
3. **Post-deploy verification, all must pass:** `wrangler secret list` returns exactly the five expected names; `GET https://burchcontracting.com/` and four representative pages return 200 with `index, follow`, correct canonical, and the build's commit marker; `check-routing` against production; `check-crawler-access` against production; a HEAD request to `/api/contact` returns the expected method-not-allowed rather than 404/500.
4. On any verification failure: `wrangler rollback` to the previous version automatically, then fail the job loudly.
5. Document in `RUNBOOK.md` that the Cloudflare dashboard Git integration (Workers & Pages → Builds) must never be connected to this repo, with the 2026-09-16 incident as the reason, and add a CI check that fails if `wrangler.jsonc` ever gains a `build` block it didn't have.

Keep `crawler-access.yml` unchanged except the Node version pin.

Commit: `ci: single deploy path with post-deploy verification and automatic rollback`.

## Phase 6 — Reposition the site around remodeling and recover the lost metadata

**Business context, from the owner:** garages generated the most leads and the fewest signed contracts (homeowners price a $40k–$145k project and walk). The work that actually gets sold is bathroom remodeling first, kitchen remodeling second, whole-home renovation as the aspirational tier. The site was built garage-first (`garage-builder` at sitemap priority 0.97, homepage titled "Garage Builder & Room Additions", 27-garage portfolio). Before the migration the query "bathroom remodeling" ranked at position 1.6; it is now 16. That is the most valuable ranking on the site and its recovery is the point of this phase.

The new service hierarchy. Encode it once in `src/data/services.js` as a `tier` field and derive everything else (nav order, homepage sections, sitemap priority, footer, related-services blocks, llms.txt order) from it:

- **Tier 1 — lead offers:** `bathroom-remodeling`, `kitchen-remodeling`, `ada-bath-to-shower` (promoted from accessibility to a bath sub-offer), `remodeling` (whole-home).
- **Tier 2 — supported:** `room-additions`, `basement-finishing`.
- **Tier 3 — maintained, not promoted:** `garage-builder`, `outdoor-living/decks`, `outdoor-living/screened-porches`, `outdoor-living/covered-patios`, `adu-builder`, `handyman`.
- **Separate tracks (own audience, unchanged prominence):** `commercial-upfits`, `commercial-roofing`, `insurance-restoration`, `ada-compliance`.

These are data-only changes in `src/data/`. The retired Next.js repo (`cscottburch1/burch-contracting-vps-current`, frozen 2026-07-19) is the reference for the metadata that ranked. Clone it to `/tmp/nextjs` read-only. No URL changes, ever; every Tier 3 page keeps its URL, content, schema, and calculator.

1. **Homepage.** Title becomes remodeling-led, e.g. `Bathroom & Kitchen Remodeling Contractor | Simpsonville & Greenville SC | Burch Contracting`. Hero headline and copy lead with bath and kitchen remodeling; the primary CTA goes to `/contact` with a bath/kitchen framing; the calculator promoted on the homepage is `/calculator/bath-remodel`, not garages. Service grid order follows tiers. Garages, decks, porches stay on the page, below the fold, one card each. The homepage `LocalBusiness`/`GeneralContractor` JSON-LD `knowsAbout`/`hasOfferCatalog` (or equivalent) lists Tier 1 first.
2. **Sitemap priorities** are derived from tier: Tier 1 = 0.95, Tier 2 = 0.85, Tier 3 = 0.70, separate tracks = 0.80, service areas = 0.85, cost guides/articles about Tier 1 services = 0.80, other guides = 0.65. `lastmod` from the per-entry content dates. No `changefreq`.
3. **Nav.** Reorder the Services mega-menu so "Remodeling" (bath, kitchen, ADA bath-to-shower, whole-home) is the first group, then "Additions & Basements", then "Outdoor Living", then "Garages & ADUs", then "Commercial". Footer "Our Services" follows the same order.
4. **Titles and descriptions, every page.** Every service page lost its geo and intent modifiers in July. Compare each `SERVICES[].title` / `metaDescription` against the Next.js page's `metadata.title` / `description` in `/tmp/nextjs/src/app/<slug>/page.tsx` and restore the pattern `"<Service> in <Geo> | <specifics> | Burch Contracting"` (≤60 chars where possible; Simpsonville, Greenville, Fountain Inn, Mauldin in the description). Tier 1 pages get the most specific, highest-intent titles, for example: `Bathroom Remodeling Simpsonville & Greenville SC | Walk-In Showers, Full Remodels` and `Kitchen Remodeling Contractor Simpsonville & Greenville SC | Burch Contracting`. Do all 16 services, 8 service areas, 11 calculators, and the cost/blog guides.
5. **Port and deepen Tier 1 content.** Where the Next.js page for `bathroom-remodeling`, `kitchen-remodeling`, or `remodeling` (and their calculators and cost guides) had more FAQs, sections, or specifics than the current data, port them verbatim into `services.js` / `service-faqs.js` / `guides-cost.js`. Then make sure each Tier 1 service page has at least: 6 FAQs, a pricing-tier table derived from `calculator-config.js`, a "what's included" section, a timeline section, a permits paragraph, and 3+ links to its own cost guides and calculator. Facts only; do not invent projects, reviews, or numbers. Where a fact is missing (e.g. number of bathrooms remodeled), leave a `TODO(owner):` comment in the data file and list it in the PR body.
6. **Service-area pages** currently lead with "Deck Builder, Garage Contractor & Home Additions in <City>". Rewrite the title/H1 pattern in `geo-aeo.js` to lead with remodeling: `Bathroom & Kitchen Remodeling in <City>, SC | Additions & More | Burch Contracting`, and reorder each city's service list by tier. Keep every existing FAQ and neighborhood block.
7. **Portfolio.** `projects.html` currently shows garages first. Reorder so bathroom and kitchen projects lead; if fewer than four bath/kitchen entries exist in the data, add a `TODO(owner):` list of what photos/write-ups are needed and put it in the PR body. Do not fabricate entries.
8. **Pricing contradictions.** `garage-builder` says "$39,000–$145,000" in the hero and "2-car is most affordable," then its table says a 2-car is "$51,798–$62,381." Every headline range on every service must derive from `calculator-config.js` through `pricing-sync.js`, and the hero range must equal min(table) to max(table). Add a `displayRound` helper (nearest $500 for display; calculator math unchanged). Audit all services; `check-build` assertion #6 should catch drift once derivation is uniform.
9. **Content queue for the owner** (do not write these; list them in `docs/RUNBOOK.md` under "Next content", ranked): bathroom remodel cost Simpsonville, bathroom remodel cost Greenville, walk-in shower conversion cost SC, kitchen remodel cost Simpsonville/Greenville, how long does a bath remodel take, aging-in-place bathroom guide, kitchen remodel timeline, whole-home renovation cost SC. Each gets a target URL under `/cost/` or `/blog/` that does not collide with an existing one.
10. **llms.txt** regenerates from `url-map` + tiered services + guides, Tier 1 first.

Commit: `feat(seo): reposition around bath and kitchen remodeling; restore geo-modified titles; derive all price copy from calculator-config`. Snapshot diff must show only the changes enumerated above; list them explicitly in the commit body.

## Phase 7 — Documentation that replaces, not adds

Write these four files from scratch. Short, current, no history except in DECISIONS.

- `README.md`: what this is, `npm run dev`, `npm run build`, `npm test`, how to deploy (push to main), link to the three docs.
- `docs/ARCHITECTURE.md`: data → chrome → generators → dist → Worker, one diagram, where each kind of fact lives, what is generated vs committed.
- `docs/RUNBOOK.md`: deploy; verify; rollback (`wrangler rollback`); rotate each secret (with the reCAPTCHA two-halves rule); add a service; add a city; add a cost guide or article; change a URL (the answer is "don't; if you must, here is the redirect + baseline re-record procedure"); what to do when `crawler-access` fails; what to do when `deploy` auto-rolls back.
- `docs/DECISIONS.md`: dated entries harvested in Phase 1, plus one entry per phase of this cleanup.

Delete every other root-level `.md` except `PRICING.md`. Commit.

## Phase 8 — Final proof and PR

1. Fresh clone of your branch into a temp dir. `npm ci && npm run build && npm test` must pass from clean.
2. `git status` is clean after a build (nothing generated is tracked).
3. `grep -rn "hostinger\|BUILD_ENV=production\|flip-noindex\|\.htaccess\|PHPMailer\|burchcontracting-dev" --include=*.{js,mjs,yml,yaml,json,jsonc,md,html}` returns only `docs/archive/` and `docs/DECISIONS.md`.
4. Final `snapshot-dist` diff against Phase 0: every page identical in text, schema, title, canonical, robots, and links — except the Phase 6 title/description/FAQ/pricing changes, which you list explicitly.
5. `check-routing` zero differences one last time.
6. Open a PR titled `One source of truth: flatten, single deploy path, safe-by-default indexing, remodeling-first repositioning` with a body containing:
   - The per-phase commit list.
   - The Phase 0 vs Phase 8 snapshot diff summary (counts: pages, text-identical, schema-identical; and the explicit Phase 6 change list).
   - The exact human steps to deploy for the first time from this branch (Cloudflare API token/account secrets already exist; `wrangler secret list` should show five; merge; watch `deploy.yml`; confirm live titles; then in Search Console request indexing on the homepage, every Tier 1 page, its calculator and cost guides, then the 20 highest-impression URLs from `migration/baseline-2026-09.md`; then run `node scripts/indexnow-submit.mjs`).
   - Anything you could not resolve, with the reason.

## Working rules for this session

- One commit per phase, conventional-commit subject, a body that says what changed and which gate proved it.
- If a gate fails, fix forward within the phase; never disable or loosen a gate to get green.
- If you find something dangerous outside this scope (exposed key, live bug in `api.js`, a redirect loop), stop, describe it, and wait for the human. Do not fix silently.
- Do not touch `cloudflare/api.js` logic, `contact.html`'s form, `calculator-config.js` values, or any image.
- No new dependencies beyond what `npm test` needs. Prefer Node built-ins.
- When the old docs and the code disagree, the code and the git log win; note the disagreement in `DECISIONS.md`.
- Report at the end of each phase: what changed, gate results, snapshot diff status, and what is next. Then continue without waiting unless something above says to stop.

Begin with Phase 0.
