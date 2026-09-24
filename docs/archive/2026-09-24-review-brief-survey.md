# Review brief — "is everything on the same level?" survey

**Status:** open review request, written 2026-09-24 against `main` @ `2418374`
(PR #29 merge). Fourth in the series after the three 2026-09-21 briefs. For
review by Claude Fable.

**This was a read-only audit.** Nothing was changed, committed or deployed while
it ran. The only writes were the gitignored `dist/` and `.build/` from a build,
and a temporary git worktree at `3ebd398`, since removed. This brief is the
only file the survey produced.

As always: **verify, do not trust.** Every finding below names where it was
checked, so it can be re-run.

---

## 1. What the reviewer is asked to do

1. **Re-derive the drift and gap findings** (rows marked **drift** or
   **gap**) from the working tree, and flag any that are wrong or overstated.
2. **Look for what the survey missed.** It checked what the survey prompt asked:
   docs against code, gate wiring, data integrity, production against `main`,
   hygiene, and measurement readiness. It did not re-audit the site's content,
   schema or SEO.
3. **Rule on the three judgement calls in §8**, where the survey reports a
   fact but the fix is a design choice.
4. **Rank-check §9.** Is the order "what would mislead someone reading the repo
   cold" right?

Background: six PRs merged in three days — #22 (cleanup), #23/#24 (deploy
verification fixes), #25 (Phase 6: remodeling-first repositioning), #26/#27
(follow-ups), #28/#29 (SERP display polish and the whole-home correction). Each
was verified on its own; this survey checks that they agree with each other.

---

## 2. Docs against code

| Area | Claim | Where checked | Result | What would fix it |
|---|---|---|---|---|
| PRICING.md | covered-patios, basement-finishing have no calculator and are hand-priced | `services.js`, `calculator-config.js` | **drift** | Both are calculator-derived now. Rewrite the section. |
| PRICING.md | service pages built by `scripts/generate-services.mjs`; example URL `/garages/` | `src/build/services.mjs`, `url-map.js` | **drift** | The script was removed in Phase 3; the URL is now `/garage-builder`. |
| PRICING.md | prose prices are updated by hand; `geo-aeo.js` FAQs are checked by hand | `pricing-sync.js`, check-build check 12 | **drift** | Prose is derived and gated. Document the three rounding tiers, `QUOTED_RATES`, `cited-figures.js`, `calculator-intros.js`. |
| README | `npm test` runs check-build, -schema, -links, -wrangler-config, -routing | `scripts/test.mjs` | **drift** | Add `check-tier1`. |
| README | push trigger stays off "until the verify-and-rollback path has been exercised once" | Deploy run history | **drift** | It has run 6+ times, all green. Enabling push is now the owner's decision. |
| README | layout tree | repo root | gap | Add `migration/` and `.github/`. |
| ARCHITECTURE | template placeholders are `{{trust.*}}` and `{{calculator.*}}` | `src/build/pages.mjs`, `prices.mjs` | **drift** | Add `{{home.*}}`, the inline `{{price\|range\|prose.<id>}}` tokens, and `{{calculator.intro}}`. |
| ARCHITECTURE | generators list; `.build/` holds pages and the sitemap; `dist/` gets the sitemap and `_headers` | `src/build/`, `index.mjs`, `package.json` | **drift** | Add `home-grid`, `llms`, `prices` and `placeholders`; `llms.txt` in `.build/` and `dist/`; `version.txt` (deploy-time only). |
| ARCHITECTURE | "where each fact lives" table | `src/data/` | gap | Add `home-cards.js`, `calculator-intros.js`, `cited-figures.js`, and `QUOTED_RATES` as the source for owner-quoted prices. |
| ARCHITECTURE | check 6 compares "the hand-typed intro prose in `calculator-config.js`" | `check-build.mjs` | **drift** | The intros are computed in `calculator-intros.js` (PR #28). |
| ARCHITECTURE | gate table | `scripts/check-*.mjs` | gap | Missing checks 10–14, `check-tier1` and `check-crawler-access`. It also names checks "3c, 3d", which the check-build header does not define. |
| ARCHITECTURE | Worker forwards `/.well-known/*` to Hostinger | `cloudflare/worker.js:101` | agree | — |
| RUNBOOK | deploy, verify, rollback, five secret names | `deploy.yml`, RUNBOOK §Deploy / §Rotating a secret | agree | — |
| RUNBOOK | "Adding a gate" lists the assertions | `check-build.mjs`, `scripts/` | gap | Only the PR #28 checks, rounding tiers and title/description limits are listed. There is no inventory of checks 1–11 or the other six scripts. |
| deploy.yml | header comment: verification and rollback "have never run" | Deploy run history | **drift** | Update the comment. |
| DECISIONS | whole-home range; owner pricing table | `QUOTED_RATES` in `calculator-config.js` | agree | Low end is 60000, with the dated correction note. |
| DECISIONS | `mechanicalCommits` hashes | `git cat-file` | agree | All 20 resolve. |
| DECISIONS | 2026-07-23: "Source: `generateSitemap()` in `scripts/generate-geo-aeo.mjs`" | `src/build/geo.mjs` | **drift** | Point it at `renderSitemap()` in `src/build/geo.mjs`. |
| DECISIONS | 2026-09-22: check-tier1 "joins at 6.3" | `test.mjs`, commit `d5db1db` | drift (minor) | It joined at 6.6. |
| DECISIONS | other mentions of removed files (`content-dates.js`, `generate-*.mjs`, `cloudflare.yml`) | tree | agree | Mentioned only as dated history. |

How to re-check the path claims: extract every backticked path from the four
docs and `PRICING.md`, then test each with `git ls-files`. Bare filenames
resolve by basename. `generate-services.mjs` is the only one found nowhere.

---

## 3. Gates against wiring

| Area | Claim | Where checked | Result | What would fix it |
|---|---|---|---|---|
| check-build, -schema, -links, -tier1, -wrangler-config, -routing | run on every change | `scripts/test.mjs`; `ci.yml` and `deploy.yml` both run `npm test` | agree | — |
| check-crawler-access | runs on a schedule and on deploy | `crawler-access.yml` (daily 12:23 UTC), `deploy.yml` | agree | Deliberately not in `npm test`: it needs production. |
| check-routing against production | runs on deploy | `deploy.yml:285` | agree | — |
| check-build tags with a recorded negative test | shown failing at least once | commit messages below | agree | See the list after this table. |
| `orphan-page`, `recaptcha-site-key`, `recaptcha-key-baked-into-js`, `robots-txt-missing`, `robots-txt-disallows-everything`, `content-dates-not-derived`, `staging-build-missing-noindex`, `faq-schema-visible-mismatch` | shown failing at least once | `git log --all` bodies, DECISIONS, the archive briefs | **gap** | No recorded negative test found; only passes are recorded. This is absence of evidence, not evidence the checks are broken. Tamper each once and record the result. |
| deploy.yml verify | five secrets by name, version marker, five representative pages, whole-site byte check with stamp-aware retry, routing, crawler access, the two 405s, www and http redirects | `deploy.yml:141–326` | agree | — |
| deploy.yml rollback | runs only when verification fails after a successful deploy | `deploy.yml:332`, `failure() && steps.deploy.outcome == 'success'` | agree | — |
| deploy.yml IndexNow | runs only on success | `deploy.yml:343`: no `if:` (so the default `success()`), `continue-on-error` | agree | — |

Recorded negative tests, by commit:

- `title-over-60-chars`: `7e0d340`
- `description-outside-120-155-chars`: `2a4ebc9`
- `prose-price-not-from-table`: `36da544`
- `headline-price-disagrees-with-table`: `d5db1db`
- `service-hierarchy-not-derived`: `0e1fe46`
- `todo-in-visible-text`: `8177031`
- `calculator-price-copy-drift`: `dd4a1dd`, `36da544`
- `service-data-gap` and `duplicate-or-missing-title-or-description`: `bc5f0a2`
- `divergent-${part}` (chrome): `6187ef5`
- nav tags: `92f5094`, `345484c`
- `noindex-in-production`: `4e3a776`, `43cab1e`
- `double-encoded-ampersand`: a real failure, recorded in commit bodies

Clean-tree run at `2418374`:

```
build: 71 pages -> .build/pages/ (70 rendered, 1 copied verbatim), plus sitemap.xml and llms.txt
write-sitemap: wrote dist/sitemap.xml (70 URLs).   write-llms: wrote dist/llms.txt (70 links).
check-build passed · check-schema passed (75 JSON-LD blocks) · check-links passed (7807 hrefs)
check-tier1 passed (4 Tier 1 pages) · check-wrangler-config passed · check-routing passed
npm test passed — every gate green.     git status after build: clean
```

---

## 4. Data integrity

| Area | Claim | Where checked | Result | What would fix it |
|---|---|---|---|---|
| Content dates | `3ebd398` (whole-home correction) changed `/remodeling`'s visible text, so its `dateModified` should move | `node scripts/dates-set-by-head.mjs` at HEAD and at `3ebd398`: both "No page takes its dateModified from this commit." `/remodeling` still `2026-09-23` in JSON-LD and sitemap | **gap** | See below the table. |
| TODOs | open `TODO(` items in `src/data/` and `calculator-config.js` | grep | 1 open | `service-comparison.js:33` `TODO(phase-6)`: rewrite the bath and kitchen "Choose this if" lines as lead offers. Needs owner copy or approval. (`home-cards.js:18` only documents the convention.) |
| `/remodeling` headline | spans all three tables: `$5,500–$350,000+ Typical` | `services.js`, check 12 | agree | See §8(b). |
| Hand-typed prices | none outside `cited-figures.js` | check 12, prose half | agree (scope noted) | 0 findings over the 16 service pages; 11 declared cited figures. The gate covers service-page prose only. The homepage, `/faqs`, promoted answers and calculator intros are derived by construction but not gated. |

**Why the dates did not move.** Two causes:

1. `/remodeling` takes its date from the literal `__service__remodeling` override
   in `content-date-overrides.json`, and `3ebd398` did not bump it. The entry's
   own note says to bump it in the same commit as any content change to the
   service.
2. `calculator-config.js` is in no page's date lineage, so a price change there
   never dates a page on its own.

Date lineage, by page type:

- **Service pages:** `services.js` (pinned to 2026-09-11) or a
  `__service__<id>` override.
- **Area pages and `/faqs`:** `geo-aeo.js`.
- **Cost guides:** `guides-cost.js`.
- **Blog:** `guides-articles.js`.
- **Hand-authored and calculator pages:** their template's git history.

**Outside every lineage:** `calculator-config.js`, `pricing-sync.js`,
`service-faqs.js`, `service-comparison.js`, `home-cards.js`,
`calculator-intros.js`, `cited-figures.js`, `promoted-faqs.js`, `pages.js`,
`calculators.js`, the bath and kitchen content files, and `src/build/*`.

Fix: bump the override now; then either map those files into lineages or add a
gate ("a commit that changes a service page's visible text must move its date").

---

## 5. Production against main

| Area | Claim | Where checked | Result | What would fix it |
|---|---|---|---|---|
| Version | production = `main` | `https://burchcontracting.com/version.txt`: `2418374…`, built 2026-09-24T11:40:52Z | agree | No merged PR is un-deployed. |
| `/`, `/bathroom-remodeling`, `/services` | live title, description and build stamp match the local build | curl vs `dist/` | agree | Titles and descriptions identical; stamp `2418374` on all three. |
| Last deploy (run 35994387183) | propagation and IndexNow | Actions log | agree | 1 page needed a propagation retry. IndexNow returned 200 for 70 URLs. Every deploy submits all sitemap URLs, which is the script's documented default. |

---

## 6. Repository hygiene

| Area | Claim | Where checked | Result | What would fix it |
|---|---|---|---|---|
| Remote branches | none stale ahead of `main` | `git for-each-ref` | agree | Only `local-dev-snapshot` (3 ahead, 2026-07-13), kept on purpose as an archive. 34 merged or obsolete branches were deleted on 2026-09-24, and each tip was recorded first. |
| Actions secrets | all six are used | `grep secrets.` in workflows vs `gh secret list` | **gap** | `FTP_PASSWORD`, `FTP_SERVER`, `FTP_USERNAME` (retired Hostinger deploy) and `RESEND_API_KEY` (a Worker secret, not an Actions one) are used by nothing. |
| .gitignore | covers `dist/`, `.build/`, `public/sitemap.xml`, `.claude/settings.local.json` | `git check-ignore` | agree | — |
| .gitignore | covers `src/data/content-dates.js` | `git check-ignore` | gap (inert) | Not ignored, but nothing generates it any more. The "upload manually to Hostinger" comment is stale. |
| docs/archive | holds the cleanup plan, the review briefs, the PR #23 and #28 prompts | `ls docs/archive` | **gap** | The cleanup plan and three review briefs are present; neither prompt is. |

---

## 7. Measurement readiness

| Area | Claim | Where checked | Result | What would fix it |
|---|---|---|---|---|
| GSC baseline | README plus six CSVs | `migration/gsc-2026-09-22-pre-phase-6/` | agree | README plus seven CSVs: Chart, Countries, Devices, Filters, Pages, Queries, Search appearance. Window 2026-08-24 → 2026-09-20. |
| "After" date | 28 days after go-live | Deploy run 35948112466 | see below | Also note the overlap below. |
| GA4 key events | owner still owes the key-event split | `src/js/analytics.js` (`G-LLFLXVVFT6`), `main.js:252`, `calculator.js:59` | owner action, plus a gap | Owner: mark `generate_lead` and `phone_click` as key events, and split `generate_lead` by `project_type` (bath/kitchen vs other). Gap: `ada-bath-calculator.js` never calls `trackEvent`, so the tub-to-shower lead offer's calculator use is invisible. The page still loads `analytics.js`, so page views count. |
| Bot-city filter | owner filters data-centre cities before the after-export | baseline README:101 | owner action | A GA4 setting; nothing to do in the repo. |
| Photos | owner owes a bath project | RUNBOOK "Next content" item 4 | owner action | One full bathroom remodel. The portfolio floor of 4 bath/kitchen projects is met; a reminder routine fires 2026-09-30. |

**When the "after" export is comparable.** Phase 6 went live at 2026-09-24 02:39
UTC (22:39 ET on Sept 23), via run 35948112466. The matching 28-day window is
2026-09-24 → 2026-10-21. Allowing Search Console's ~2-day lag, export on or
after **2026-10-23**.

**Overlap.** PR #28's title and description changes went live at 11:40 UTC the
same day, inside that window. A 28-day before/after cannot separate the Phase 6
content effect from the snippet effect; only daily data could.

---

## 8. Judgement calls for the reviewer

**(a) Content-date lineage.** Should prices and FAQ answers date the pages
that show them? Two options:

- Map `calculator-config.js`, `service-faqs.js` and similar files into each
  page's lineage. This is precise, but those are shared files, so a price change
  would re-date many pages.
- Keep the hand-maintained `__service__` overrides and gate on them: a visible
  text change to a service page must move its date. This is explicit, but only
  as good as the gate.

The survey leans to the gate, because a whole-file lineage is what produced
the over-dating problems recorded in DECISIONS.

**(b) `/remodeling` headline.** It currently spans all three tables
($5,500–$350,000+), so the headline's low end is a small bath. Changing it to
"whole-home tier only" would touch `stats.costRange` for `remodeling` in
`services.js`. Check 12 would then need a rule change: headline = one named
tier, not min..max of all tables. The `/services` and homepage comparison cells
follow automatically. This is the owner's decision.

**(c) The eight assertions with no recorded negative test.** They are
probably fine; most are simple string checks. Is recording a tamper test for
each worth a commit, or should RUNBOOK say that checks predating the
prove-it-fails rule are grandfathered?

---

## 9. Ranked: what would mislead someone reading the repo cold

1. **PRICING.md** says basement and patios are hand-priced and that prose is
   updated by hand. Rewrite around `calculator-config.js`, `QUOTED_RATES`, the
   three rounding tiers, `cited-figures.js` and the prose gate.
2. **`/remodeling` dateModified is stale** (2026-09-23; content changed
   2026-09-24). Bump the override, then settle §8(a).
3. **ARCHITECTURE describes the site before Phase 6**: placeholders, generators,
   facts table, check 6's source and the gate table. Update those five sections.
4. **The RUNBOOK has no inventory of assertions.** List every `check-*.mjs` and
   every check-build tag, with the tree each reads.
5. **Eight check-build assertions have no recorded negative test.** Tamper and
   record, or grandfather explicitly (§8(c)).
6. **README and deploy.yml** say verification and rollback are unexercised.
   Update both; treat enabling the push trigger as an open owner decision.
7. **Four unused Actions secrets** (`FTP_*` ×3, `RESEND_API_KEY`). Delete them on
   GitHub.
8. **The tub-to-shower calculator sends no `calculator_complete`.** Add
   `trackEvent` to `ada-bath-calculator.js` before the after-window accrues.
9. **The PR #23 and #28 prompts are not archived.** Add them to `docs/archive/`.
10. **README** omits `check-tier1` from the `npm test` list and `migration/` from
    the layout; the **DECISIONS** 2026-07-23 source path is stale. Fix all three
    lines.
