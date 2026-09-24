> **Archived 2026-09-24, as supplied by the owner.** This is the prompt that
> specified Phase 6 (the remodeling-first repositioning), written 2026-09-22
> against `main` @ `d0ff66d`. The text below is verbatim.
>
> It was titled "PR #23", but the work shipped as **PR #25** (merge
> `5763541`); GitHub had already assigned #23 to a deploy-verification fix.
>
> **This text was not available when the work was done.** Phase 6 was executed
> from the cleanup plan's Phase 6 section, with the 6.x numbers mapped onto the
> plan's items 1–10 (owner-approved, 2026-09-23). The departures below were
> found when this file was archived. Deliberate ones are recorded in
> `docs/DECISIONS.md`; the rest are open.
>
> - **6.0.2 sitemap `priority` from tier** — not done, deliberately:
>   contradicts DECISIONS 2026-07-23; owner confirmed `lastmod` only.
> - **6.0.3 Tier 1 floor in `check-schema`** — built as `scripts/check-tier1.mjs`
>   instead, in `npm test` since 6.6. It covers the same four assertions from
>   a different script.
> - **6.3 one commit per Tier 1 service** — done as one commit (`e7c7e70`).
> - **6.5 `/services` comparison table — NOT DONE, open.** The Links column
>   has not been dropped, links not moved under the service name, rows not
>   reordered by tier, the 1280/375 `vite preview` check not run, and the bath
>   and kitchen `CHOOSE_IF` lines still carry `TODO(phase-6)` in
>   `src/data/service-comparison.js`.
> - **6.8 content queue order from the export — NOT DONE as written.** The
>   RUNBOOK queue (`14b650e`) followed the plan's list. It does not rank
>   "bathroom remodeling cost five forks" (position 3.9) first or queue it at
>   all. "Bathroom remodel cost Simpsonville" has a page
>   (`/cost/bathroom-remodel-cost-simpsonville-sc`), so the export's "no
>   dedicated page" there needs checking against which URL ranks.
> - **6.9 per-page Tier 1 floor results and a 6.2 description-length table** —
>   the 6.2 commit carried a title table; lengths were later enforced by
>   check 14 (PR #28).
>
> The owner's pricing answers, the rule-order change for titles and the
> whole-home range are in DECISIONS (2026-09-23 and 2026-09-24).

---

# PR #23 — Phase 6: reposition the site around bath and kitchen remodeling

Paste everything below this line into Claude Code with the repo open at `main` (`d0ff66d` or later).

---

## Context

PR #22 (Phases 0–5, 7, 8) is merged and deployed. Production is serving `main` through `deploy.yml` with verification and automatic rollback, both proven on real runs. The site is now technically neutral: same 71 pages, same URLs, same content, from a build that can be trusted.

This PR is the business change the plan deferred: Phase 6 of `docs/archive/2026-09-21-cleanup-plan.md`. Read that section in full before starting; it is the specification. This document amends it in the places marked below and adds the working rules for a content PR, which differ from a refactor PR in one important way: **the snapshot diff will not be zero, and it is not supposed to be.** Its job here is to enumerate every change so the PR body can list them, not to prove nothing moved.

## Invariants — unchanged from PR #22

1. Zero URL changes. Every entry in `migration/routing-baseline.json` resolves as recorded. No page added, none removed, no slug touched.
2. Zero content loss on any page not named in this PR's change list. The snapshot's `text`, `jsonLd`, `title`, `description`, `social`, `links`, and chrome fields are the record; every changed field on every page must be attributable to a numbered item below.
3. Every price in copy derives from `calculator-config.js` through `pricing-sync.js`. No price is typed by hand anywhere.
4. No facts invented. Where a fact is missing (a count of bathrooms remodeled, a real bath or kitchen project with photos, a specific year), leave `TODO(owner): <what is needed>` in the data file and list it in the PR body. A page that ships a `TODO` marker in visible text fails the build; add that assertion to `check-build` first.
5. Merge commits only. Content commits do NOT carry `Content-Change: none`; they change content and the dates should move. Mechanical commits in this PR (gate additions, data-shape changes with identical output) do carry it.

## Working rules for this PR

- Branch `feat/remodeling-first` from `main`. Push after every commit.
- Take the snapshot baseline from a clean build of `main` first. Every commit reports its diff against that baseline with each changed field attributed to an item number below.
- `npm test` green before every push.
- Before building anything, read: `src/data/services.js`, `src/data/service-comparison.js`, `src/data/promoted-faqs.js`, `src/data/geo-aeo.js`, `src/data/nav.js` (or wherever 3.3a-i put the nav items), `src/chrome/index.mjs`, `src/build/trust-layer.mjs`, `src/templates/index.html`, `src/templates/services.html`, `src/templates/projects.html`, and the Phase 6 section of the plan. Clone the retired Next.js repo read-only to `/tmp/nextjs` (`cscottburch1/burch-contracting-vps-current`); it is the reference for metadata and FAQ content that ranked.
- Stop and report before committing if you find yourself about to change a URL, a price value, `api.js`, the contact form, or any image.

## Commit sequence

### 6.0 — Gates first (mechanical, `Content-Change: none`)

1. `check-build`: fail if any rendered page contains the string `TODO(` in visible text.
2. `check-build`: fail if any `SERVICES[]` entry lacks a `tier` in `{1, 2, 3, 'track'}`, or if nav order, sitemap priority, footer order, or the homepage service grid are not derived from it (assert by rendering and comparing to the tier-sorted list).
3. `check-schema`: for every Tier 1 service page, assert at least 6 FAQPage questions, a pricing table whose min and max equal the page's headline range, and outbound links to its own calculator and at least one cost guide. This assertion must be shown failing against current `main` (which does not meet it yet) before it is trusted, then it gates the rest of the PR.
4. Hostname redirects, which today exist only as a Cloudflare dashboard rule: add `https://www.burchcontracting.com/` → 301 → `https://burchcontracting.com/` and `http://burchcontracting.com/` → 301 → `https://burchcontracting.com/` (query string preserved, single hop) to `check-routing`'s baseline and to `deploy.yml`'s verification step. Record in `DECISIONS.md` why: the www URL still carried a third of the property's clicks in the Sept 22 export because Google had it indexed for years, and nothing in the repo would notice if the dashboard rule vanished.
5. Commit the owner's pre-Phase-6 Search Console export (the seven CSVs from `burchcontracting_com-Performance-on-Search-2026-09-22.zip`, provided by the owner) as `migration/gsc-2026-09-22-pre-phase-6/`, plus a `README.md` there stating the window (last 28 days ending 2026-09-21) and the headline numbers: 57 clicks, 10,052 impressions; garage bucket 235 queries / 1 click / position 52; bath bucket 40 queries / 3 clicks / position 11; "bathroom remodel contractors near me" and "kitchen remodeling company near me" both at position 1. This is the before.
6. Record in `DECISIONS.md` that Phase 6 is a content PR and what the snapshot diff means here.

### 6.1 — Tier field and everything derived from it

Plan Phase 6 items 1 (homepage), 2 (sitemap priorities), 3 (nav), 10 (llms.txt), plus the deferred "Our Services" footer derivation from 3.1. One commit. Tiers exactly as the plan lists them. The chrome hash WILL change on every page in this commit (nav order changes anchor order and text order); that is the one expected chrome-hash change in this PR and the commit message must say so and re-record the baseline after.

### 6.2 — Titles and descriptions, every page

Plan item 4. Compare each against `/tmp/nextjs` before writing. The Sept 22 export shows the ADA pages drawing queries from Camden, Lugoff, and Columbia SC (the Midlands, two hours away); their titles and descriptions must name the Upstate, Simpsonville, and Greenville explicitly so they stop competing for jobs outside the service area. One commit, with a table in the message: page, old title, new title, old description length, new description length. Titles ≤ 60 characters where the geo modifier allows; descriptions 140–160.

### 6.3 — Tier 1 content depth

Plan item 5. One commit per Tier 1 service (`bathroom-remodeling`, `kitchen-remodeling`, `ada-bath-to-shower`, `remodeling`), each ported from the Next.js page's FAQs and sections verbatim where they exist, then brought up to the 6.0 floor. Each commit's snapshot diff touches exactly one service page (and its calculator/cost pages only if links were added).

### 6.4 — Service-area pages

Plan item 6. Retitle and reorder by tier in `geo-aeo.js`. Keep every existing FAQ and neighborhood block. One commit; eight pages change, `text` diffs are reorder-only plus the new H1/title.

### 6.5 — The `/services` comparison table (amendment)

The six-column table scrolls sideways at common desktop zoom levels; the "Links" column is clipped. Drop the standalone "Links" column and put the Calculator and Details links under the service name in the first column, so five columns fit at 1280px without horizontal scroll. Reorder rows by tier. Revisit the bath and kitchen `CHOOSE_IF` lines as lead-offer copy (tagged `TODO(phase-6)` in `service-comparison.js`). Verify in `vite preview` at 1280 and 375 wide that no column is clipped at 100% zoom; the phone still scrolls, that is fine.

### 6.6 — Pricing derivation (plan item 8) and the promoted FAQ price

Every headline range on every service page and in `promoted-faqs.js` (the deck answer is tagged `TODO(phase-6)`) derives from `calculator-config` via `pricing-sync`, hero range equals min(table)–max(table), `displayRound` to the nearest $500 for display only. The garage page's "$39,000–$145,000" versus "$51,798–$62,381" contradiction is the canonical example; audit all sixteen. Calculator math unchanged; `check-build` assertion #6 must pass on every page after.

### 6.7 — Portfolio (plan item 7)

Reorder `projects.js` bath and kitchen first. If fewer than four bath/kitchen entries exist, do not invent any: leave the `TODO(owner)` list in the PR body naming exactly what photos and write-ups are needed, and ship the reordered set as is.

### 6.8 — Content queue and runbook (plan item 9)

Write the ranked "Next content" list into `RUNBOOK.md` with a target URL per item that does not collide with an existing one. No content written. Order from the export, not the plan: `bathroom remodeling cost simpsonville` (position 4.8, no dedicated page) and `bathroom remodeling cost five forks` (position 3.9, no dedicated page) go first; both are already on page one with nothing built for them.

### 6.9 — PR

Fresh clone → `npm ci` → `npm run build` → `npm test` green. Snapshot diff against the `main` baseline with every changed field attributed to 6.1–6.7 by number. PR body:

- The attributed change table (page → fields → item).
- The title/description table from 6.2.
- Every `TODO(owner)` with what is needed.
- The Tier 1 content floor results (FAQ count, table range, links) per page.
- The `vite preview` widths checked for the table.
- Deploy instructions: merge commit, manual `workflow_dispatch` as before, then Search Console: request indexing on `/`, the four Tier 1 pages, their calculators and cost guides, then resubmit the sitemap; then `node scripts/indexnow-submit.mjs` (the deploy workflow already runs it).

## Owner actions before merge (not for Claude Code)

- The Search Console baseline is already exported (2026-09-22) and goes into the repo at 6.0. Hand the zip to Claude Code at the start of the session.
- In GA4, before merge: note the count of each key event (phone tap vs form submit) for Aug 25–Sep 21, and set up a filter or segment that excludes the data-center cities (Singapore, Ashburn, Boardman, Council Bluffs, Hong Kong, Atlanta) so the after-export measures people.
- Read the 6.2 title table in the PR body yourself. These are the words that show in search results; if any reads wrong for how you'd say it, change it in the data file before merge, not after.

Begin with 6.0.
