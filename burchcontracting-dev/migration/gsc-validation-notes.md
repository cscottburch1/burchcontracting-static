# GSC validation of the legacy-URL redirect rules — 2026-07-11

Source data: `Google Search Console Downloads/burchcontracting.com-Performance-on-Search-2026-07-11/`
(Pages.csv, 204 URLs, presumably the last several months — see that folder's
`Metadata.csv`/`Filters.csv` for the exact date range) and
`burchcontracting.com-Coverage-2026-07-11/` (Critical issues.csv,
Non-critical issues.csv). These exports live at the repo root, **not
committed to git** (see note at the bottom).

This cross-checks the draft "LEGACY burchcontracting.com -> NEW static site"
redirect block that's now merged into `public/.htaccess`. Full ruleset and
inline reasoning is in that file; this doc is the data-analysis backing for
the decisions made there, plus the items that still need your input.

## Coverage report — context

Google's Coverage report currently shows **93 URLs already returning 404**
on live burchcontracting.com, before any migration work. 15 more are "Page
with redirect," 4 excluded by noindex, 3 redirect errors, 3 blocked by
robots.txt, 48 "crawled — currently not indexed." So a meaningful chunk of
this redirect work is fixing pre-existing breakage, not just future-proofing
a domain/framework switch.

## Questions the draft `.htaccess` block itself posed — resolved by data

- **clinton-sc / ora-sc / joanna-sc** (no page on new site — redirect to
  Laurens or build dedicated pages?): **0 clicks** across all three cities,
  all services, in the export. Redirecting to `/service-areas/laurens.html`
  is safe — nothing to lose.
- **travelers-rest / duncan / taylors** (service-page fallback vs. losing
  geo intent): none of the three appear anywhere in the 204-row export, not
  even at 1 impression. Fallback is safe.
- **The ~150-URL city×service tier overall** (port into real pages vs. let
  redirects collapse them): real clicks across the *entire* tier top out at
  1 per URL, on a small handful of URLs. Impressions run up to a few hundred
  on the highest ones (e.g. `gray-court-sc/deck-builder` at 178). Given
  clicks — not impressions — are what actually convert into leads, collapsing
  this tier into the 8 city pages is a defensible, low-risk call. Porting it
  into a full city×service page matrix is not justified by this data.

## New gaps this pass found (fixed in `.htaccess`)

1. **`/cost/{article-slug}` tier** — an entire "cost of X in {city}, SC"
   article tier under `/cost/` that neither the original `.htaccess` nor the
   draft block covered at all. 4 of these carry real clicks (11 total) and
   several hundred combined impressions. Hand-mapped by topic keyword to the
   matching calculator (or `/basement-finishing` where no calculator exists),
   with a generic fallback to `/calculator/estimate.html` for any not
   explicitly listed.
2. **`/calculator/{slug}` legacy names with an exact new-site match** —
   `screened-porches`, `bathroom-remodeling`, `kitchen-remodeling`,
   `remodeling`, `basement-finishing` were all about to fall into the
   generic "any unknown calculator slug → estimate.html" catch-all despite
   having (or having a clearly better) specific target. Upgraded to direct
   mappings.
3. **`/service-areas/{city}-sc` bug** — the *existing* (pre-draft) generic
   rule `^service-areas/([a-z-]+)/?$ -> /service-areas/$1.html` would take a
   legacy URL like `/service-areas/simpsonville-sc` and 301 it to
   `/service-areas/simpsonville-sc.html`, which doesn't exist — i.e. a
   redirect straight into a 404. Confirmed via GSC: `simpsonville-sc` (32
   impr), `fountain-inn-sc` (22), `mauldin-sc` (20), `woodruff-sc` (11) all
   affected. Fixed with a rule that strips the `-sc` suffix before the
   generic rule runs.
4. **City-sc/service gap for kitchen/bathroom remodeling** — the draft's 6
   known-city rules only matched a fixed 5-service alternation
   (`deck-builder|garage-builder|room-additions|screened-porches|adu-builder`).
   Real URLs like `gray-court-sc/kitchen-remodeling` (1 real click) use a
   6th/7th service name outside that list and had no fallback — straight
   404. Broadened those 6 rules to a wildcard (matching the more permissive
   approach the draft already used for clinton/ora/joanna) to close this and
   protect against any other undiscovered service slug.
5. **`/locations/screened-porch-builder-{city}-sc` slug mismatch** — the
   draft's Family 3 pattern used `screened-porches-{city}-sc`, but the real
   legacy slug (confirmed via GSC, e.g. 71 impressions on the Greenville one)
   is `screened-porch-builder-{city}-sc`. Not a 404 (the family's own
   generic `/locations/[a-z-]+` catch-all still caught it) but was sending
   real traffic to the homepage anchor instead of the screened-porches page.
   Fixed to the correct pattern; also added `/locations/kitchen-remodeling-*`,
   `/locations/bathroom-remodeling-*`, `/locations/basement-finishing-*`
   for the same reason.
6. **Bare/underscore legacy tier** — `bathroom-remodeling`, `bath_remodeling/`,
   `kitchen-remodeling`, `kitchen_remodeling/`, `basement_remodeling/`,
   `commercial-renovations`, `commercial_remodeling_company/`,
   `screened_patios/`, `pricing`, `request_a_free_estimate/`,
   `commercial-services/`, `home-renovations`, bare `outdoor-living` — none
   were covered anywhere. All 0 clicks but real impressions (up to ~140);
   unambiguous keyword matches, so mapped directly.
7. **`/projects/{case-study-slug}`** — 10 individual project pages, 0 clicks
   each, ~205 impressions combined, no per-project equivalent on the new
   site. Consolidated to `/projects.html` (the listing page) as a safe
   fallback rather than 404ing.

## Still open — needs your input, not a pattern rule

Guessing these would risk the exact "soft 404 / wrong-relevance redirect"
problem the original draft warned about, or requires a business decision I
can't make from code:

| Legacy URL(s) | Clicks / Impressions | Question |
|---|---|---|
| `/portal` (+ `www.` variant) | 2 / 95 (+0/17) | Was this a real customer-login feature? If yes, does it need to exist on the new site, or is redirecting to `/contact.html` acceptable? |
| `/commercial-roofing_company/`, `/roofing/` | 0/141, 0/77 | Is roofing still an offered service? No roofing content exists anywhere on the new site. |
| `/handyman-services-estimator/`, `/handyman-services-near-you/` | 0/13, 0/6 | Is handyman work still offered? Same situation as roofing. |
| `/clients/` | 3/14 | Real clicks, no obvious new-site equivalent (testimonials live inline on the homepage, not a standalone page). |
| `/blog/deck-building-cost-simpsonville-sc` | 0/108 | |
| `/blog/room-addition-cost-in-south-carolina` | 0/81 | |
| `/blog/how-much-does-a-screened-porch-cost-in-south-carolina` | 0/58 | |
| `/blog/composite-vs-pressure-treated-deck-which-is-better` | 0/57 | |
| `/blog/average-cost-of-basement-finishing-in-south-carolina` | 0/46 | |
| `/blog/bath-to-shower-conversion-cost-south-carolina` | 0/32 | |
| `/blog/do-you-need-permits-for-remodeling-in-simpsonville-sc` | 0/14 | |
| `/blog/how-long-does-a-kitchen-remodel-take` | 0/6 | |
| `/blog/best-home-improvements-for-property-value-in-south-carolina` | 0/5 | |
| `/blog/how-to-plan-a-kitchen-remodel-step-by-step` | 0/4 | |
| `/blog/basement-finishing-ideas-sc` | 0/4 | |
| `/blog/kitchen-remodel-cost-fountain-inn-sc` | 0/3 | |
| `/blog/cost-of-bathroom-remodeling-simpsonville-sc` | 0/3 | |
| `/blog` (bare index) | 0/2 | 13 articles + the bare index, all 0 clicks. Is a blog planned for the new site? If not, these could redirect to the matching calculator page, but that's a bigger topical mismatch than the other fallbacks above — worth a deliberate call rather than a silent pattern match. |
| `/work` | 0/29 | Ambiguous between a portfolio/gallery page and a careers page — can't tell which from the URL alone. |
| `/subcontractors/join` | 0/41 | Subcontractor recruitment — still accepting applications this way? |
| `/employment`, `/employment/direct-hire` | 0/19, 0/4 | Careers page — still relevant? |
| `/admin` | 0/14 | Almost certainly an accidentally-indexed CMS backend URL, not real content — probably correct to leave 404ing (and worth confirming it's blocked from crawling going forward) rather than redirect anywhere. |

## Automated cross-check

After the manual pass above, I wrote a small script that parses every
`RewriteRule` in `public/.htaccess` and replays all 202 real legacy paths
from `Pages.csv` against them in file order (first-match-wins, matching
Apache's `[L]` semantics), to catch anything a manual read would miss. It
caught two real gaps the manual pass had missed — `/room_additions/`
(underscore variant, 7 impressions) and bare `/service-areas` (5
impressions) — both now fixed (mapped to `/additions` and `/#service-areas`
respectively). After those fixes, the only paths with no matching rule are
exactly the "still open" list above (24 paths: the blog tier, `/clients/`,
`/commercial-roofing_company/` + `/roofing/`, `/work`,
`/subcontractors/join`, `/employment` + `/employment/direct-hire`,
`/handyman-services-*`, `/admin`) plus the pages that are already identical
real paths on the new site and need no rule at all (`/garages`, `/additions`,
`/adu-builder`, `/basement-finishing`, `/commercial-upfits`, `/remodeling`,
`/outdoor-living/decks`, `/outdoor-living/screened-porches`,
`/outdoor-living/covered-patios`).

## A caveat on this whole pass

`Pages.csv` is capped at 204 rows by whatever GSC export size was pulled —
if the underlying report has more rows (GSC's own UI caps free exports
around 1,000), there could be additional legacy URLs with low-but-nonzero
traffic not reflected here. Everything above should be treated as "the top
of the list," not exhaustive. If you can pull a fuller export (or the
12-month "Performance → Pages" view specifically, if this one covers a
shorter window — check `Filters.csv`/`Metadata.csv` in that folder for the
actual date range used), it's worth a second pass before this ships.

## Note: the GSC export folder itself

`Google Search Console Downloads/` at the repo root is **not committed** —
it's real (if not especially sensitive) business analytics data, and a
static-site source repo isn't obviously the right place for it long-term.
Added to a new root `.gitignore` entry. Let me know if you'd rather it be
committed somewhere (e.g. inside `migration/`) for future reference instead.
