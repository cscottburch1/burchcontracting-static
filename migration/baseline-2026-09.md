# Search baseline — 8 weeks before vs after the static launch

Recorded 2026-09-11 from Google Search Console exports: **before** = 2026-05-20
to 2026-07-18 (Next.js site, 59 days), **after** = 2026-07-19 to 2026-09-11
(static site, 55 days). Cutover was 2026-07-19. Raw exports live outside the
repo in `Indexing reports/Coverage and indexing reports/9_11_2026 Reports/`.

Page and query comparisons join on normalized URLs — `www` and non-`www`,
`.html` and extensionless, plus the known renames (`/garage-builder` →
`/garages`, `/room-additions` → `/additions`, `/calculator/room-additions` →
`/calculator/additions`, and so on) — so a page is compared with itself.

## Totals

| | Before | After | Change |
|---|---|---|---|
| Clicks | 166 (2.81/day) | 139 (2.53/day) | −10% |
| Impressions | 20,943 (355/day) | 18,711 (340/day) | −4% |
| Average position | 19.4 | 30.6 | **11 positions worse** |

Impressions held up; **ranking is what fell.** Weekly impressions since the
launch are flat to slightly up (258/day in the first week, 411/day at the end
of August), while clicks drift down (19, 19, 21, 15, 18, 24, 12, 11 per week).

## Indexing

| Date | Indexed | Not indexed |
|---|---|---|
| 2026-06-29 | 153 | 167 |
| 2026-07-21 | 130 | 221 |
| 2026-08-12 | 47 | 294 |
| 2026-09-03 | **46** | **296** |

46 indexed pages matches the 43-URL sitemap, so indexing is "correct" for the
new site's size. The drop from 153 is the deliberate removal of ~130 pages.
Current not-indexed reasons: 175 page with redirect, 85 not found (404), 22
crawled but not indexed, 4 noindex, 3 redirect error, 3 blocked by robots.txt.

## Googlebot crawl budget (last 90 days)

| Response | Share of requests |
|---|---|
| 200 OK | 52.0% |
| 301 redirect | 27.3% |
| 404 not found | 13.9% |
| 304 not modified | 6.6% |
| 5xx | 0.1% |

**41% of Googlebot's crawl is spent on redirects and dead ends.** Purpose was
94.8% refresh against 5.2% discovery, so Google is barely finding new pages.
3,907 requests hit `burchcontracting.com`, 118 hit `www`.

## Query intent

| Intent | Impressions before → after | Change |
|---|---|---|
| cost/estimate | 4,405 → 3,058 | **−1,347** |
| generic | 4,620 → 4,288 | −332 |
| city | 2,701 → 3,380 | **+679** |
| near me | 911 → 937 | +26 |
| brand | 114 → 63 | −51 |
| advice/compare | 57 → 84 | +27 |

520 queries had impressions before and none after (1,690 impressions), 225 of
them cost/estimate queries. Cost and estimate searches are the biggest loss,
and they are exactly what the deleted `/cost/*` guides and `/blog/*` articles
answered.

Worst individual queries, with position before → after:

| Query | Impressions | Position |
|---|---|---|
| garage builder | 1,243 → 354 | 18.2 → 53.5 |
| garage cost estimator | 130 → 22 | 15.3 → 31.9 |
| cost to build a garage calculator | 200 → 93 | 15.1 → 34.0 |
| porch estimate calculator | 107 → 2 | 16.8 → 33.0 |
| garage cost calculator | 114 → 15 | 11.6 → 28.5 |
| basement finishing cost calculator | 84 → 34 | 12.1 → 28.7 |
| bathroom remodeling | 55 → 4 | 1.6 → 16.0 |

## Pages

Biggest losses:

| Page | Impressions | Clicks | Position |
|---|---|---|---|
| `/garages` (was `/garage-builder`) | 6,002 → 4,396 | 29 → 9 | 29.9 → 53.3 |
| `/calculator/garages` | 4,195 → 2,531 | 29 → 22 | 17.1 → 33.2 |
| `/calculator/basement-finishing` | 1,065 → 605 | 2 → 2 | 16.4 → 34.3 |
| `/cost/home-addition-cost-greenville-sc` | 304 → 51 | 5 → 0 | 4.2 → 4.2 |
| `/service-areas/fountain-inn` | 613 → 462 | 1 → 0 | 18.4 → 21.2 |

By removed-content family:

| Family | URLs | Impressions | Clicks |
|---|---|---|---|
| city × service | 46 | 718 → 367 | 4 → 1 |
| cost guides | 11 | 619 → 98 | 8 → 1 |
| locations | 23 | 211 → 81 | 2 → 0 |
| blog | 12 | 230 → 31 | 0 → 2 |
| case studies | 7 | 38 → 0 | 0 → 0 |

71 URLs had impressions before and none after (433 impressions).

Biggest gains, all pages the static site built well: homepage +577,
`/calculator/additions` +484, `/adu-builder` +344, `/calculator/bath-remodel`
+294, `/calculator/estimate` +226, `/service-areas/five-forks` +211,
`/commercial-roofing` +188 (new page), `/outdoor-living/screened-porches` +128.

## What this says about the recovery order

1. **The garage cluster is the single biggest loss.** `/garage-builder` →
   `/garages` cost 20 positions and two thirds of its clicks, and the garage
   cost queries fell with it. This is the strongest evidence for restoring the
   legacy URLs (the plan's Option B).
2. **Cost guides first, in this order:** garage construction cost, screened
   porch cost, basement finishing cost, home addition cost Greenville, deck
   cost Simpsonville, bathroom remodel cost.
3. **Then the articles** that lost the most: screened porch cost SC, room
   addition cost SC, composite vs pressure-treated decking, basement finishing
   cost SC, bath-to-shower conversion cost.
4. **Leave city × service collapsed.** 46 URLs produced 367 impressions and
   1 click after cutover; the data doesn't justify rebuilding that tier.
5. **Case studies are a citability play, not a traffic one** — they earned 38
   impressions before. Worth doing for AI citation and E-E-A-T, not for clicks.

## Not captured here

Bing Webmaster Tools: the exported archive was empty, and the property may not
be verified yet. Bing's index feeds Copilot and ChatGPT search, so it needs its
own baseline once the property is set up and has collected data.
