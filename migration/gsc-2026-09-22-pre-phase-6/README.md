# Search Console baseline — before Phase 6

Exported 2026-09-22 by the owner. **Window: 2026-08-24 to 2026-09-20**, web search,
no filters. This is the "before" for the bath-and-kitchen repositioning; the
matching "after" should be exported on the same 28-day window once the change has
been live long enough to re-crawl.

Raw CSVs, unedited. `Filters.csv` records the export settings.

---

## Read the totals carefully: the three sheets disagree, and that is normal

| Sheet | Clicks | Impressions | Rows |
|---|---|---|---|
| `Chart.csv` (daily) | 56 | 9,541 | 28 days |
| `Pages.csv` (per page) | **57** | **10,052** | 82 |
| `Queries.csv` (top queries) | 15 | 6,189 | 775 |

`Queries.csv` is far lower because Google withholds long-tail and low-volume
queries; the query sheet is a truncated top-N, never a total. **Quote the Pages
figures (57 / 10,052) as the property total** and treat the query sheet as a
sample. Comparing a future query-sheet total against the Pages total here would
manufacture a decline that did not happen.

Chart and Pages differ by one click for the usual GSC reasons (rounding and
per-dimension attribution). Neither is wrong.

---

## What the export actually says

### 1. A third of all clicks land on the www hostname

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| `https://www.burchcontracting.com/` | **19** | 998 | **3.25** |
| `https://burchcontracting.com/` | 12 | 697 | 30.52 |

The www version outranks the canonical root by 27 positions and earns more
clicks — 19 of 57, a third of the property. Google has had it indexed for years.
The redirect that collapses it onto the root exists only as a Cloudflare
dashboard rule, and nothing in this repo would notice if it vanished. Phase 6.0
adds both hostname redirects to `check-routing`'s baseline and to the deploy
verification. See `docs/DECISIONS.md`.

### 2. Garage is the impressions, and none of the clicks

| Bucket | Queries | Clicks | Impressions | Avg position |
|---|---|---|---|---|
| garage | 235 | **1** | 2,477 | **52.2** |
| deck | 86 | 0 | 914 | 22.5 |
| bath / shower | 40 | 3 | 340 | 11.3 |
| kitchen | 5 | 0 | 43 | 4.0 |

`garage construction` alone draws 514 impressions at position 61. The garage
pages generate four times the impressions of every bath and kitchen query
combined, rank in the fifties, and convert one click in 2,477. That is the
case for the repositioning, in one row.

### 3. The bath and kitchen rankings already exist. The clicks do not.

| Query | Impressions | Position | Clicks |
|---|---|---|---|
| `remodeler` | 99 | 1.0 | **0** |
| `commercial remodeling contractors` | 77 | 1.0 | **0** |
| `bathroom remodel contractors near me` | 47 | 1.0 | **0** |
| `kitchen remodeling company near me` | 39 | 1.0 | **0** |
| `bathroom remodel` | 82 | 5.5 | 1 |

**This is the most important thing in the export, and it changes where the
leverage is.** Ranking first for 47 impressions and earning zero clicks is not a
ranking problem — it is a title-and-snippet problem. The searcher sees the
result and does not choose it.

Phase 6 was scoped on the premise that the bath ranking had collapsed and needed
recovering. For the "near me" variants it has not collapsed; the page is first
and the listing is not being clicked. That makes **6.2 (titles and descriptions)
the highest-leverage item in the phase**, ahead of the structural work in 6.1.

The plan's "position 1.6 → 16" figure is not contradicted — it refers to the
head term `bathroom remodeling`, which shows 1 impression here and is too thin
to read either way in this window.

### 4. The ADA pages are drawing the wrong geography

Queries arrive from Camden, Lugoff and Columbia — the Midlands, roughly two
hours from the service area. Phase 6.2 puts Upstate, Simpsonville and Greenville
in those titles and descriptions so the pages stop competing for jobs that
cannot be taken.

---

## Also worth knowing when the "after" is compared

- **Mobile 30 clicks / 2,985 impressions at position 22.1; desktop 25 / 6,526 at
  31.1.** Mobile converts at 1.01% against desktop's 0.38%. The phone-width
  check is not cosmetic.
- **United States 56 of 57 clicks.** India contributes 28 impressions and no
  clicks; ignore it.
- GA4 traffic from data-centre cities (Singapore, Ashburn, Boardman, Council
  Bluffs, Hong Kong, Atlanta) is bots, and the owner is filtering it before the
  after-export. It does not affect this file: Search Console counts search
  impressions, not sessions.
