# Citability Report

**Final summary — Phases 0 through 7 complete.** Everything below the
`---` is the local scorer's auto-generated current-state snapshot (worst-
first table + calibration notes); this section is the hand-written
before/after wrap-up, current as of the Phase 7 commit. Re-running
`node tools/citability-score.js` regenerates everything below the `---`
but will not update this section — refresh it by hand if scores move
again after real content lands (see CITABILITY-FACTS-NEEDED.md).

## Executive summary

| | Phase 0 baseline | After Phase 7 |
|---|---|---|
| Average (local scorer, 41 pages) | 66/100 | 71/100 |
| Pages that improved | — | 35 of 41 |
| Pages unchanged | — | 5 (2 intentionally out of scope: privacy-policy.html, terms-of-service.html; 3 calculators within scorer noise) |
| Pages that declined | — | 1 (calculator/estimate.html, -1 — noise, not a regression) |
| Worst single page | 47 (terms-of-service.html) | 47 (terms-of-service.html, untouched by design) |
| Biggest single-page gain | — | +17 (projects.html: 52 → 69) |

The **real** SEOmator audit scored the site 53/100 on AI Citability. This
local scorer is a proxy, not a reproduction of that tool (see calibration
notes below the `---`) — its 66 baseline doesn't mean "the audit was
wrong," it means the two tools weigh things differently. Re-running the
actual SEOmator audit is the only way to confirm the real-world delta;
this file's job is to show *direction and magnitude* of change from the
mechanical work (Lever B), and to make clear how much of the *remaining*
gap is now sitting behind real answers in CITABILITY-FACTS-NEEDED.md
(Lever A) rather than more formatting.

## What's locked behind FACT-NEEDED answers

Every phase's mechanical work is done and committed. What's left on the
table specifically requires Scott, not more code:

- **Real project data (Phase 4, highest leverage)** — 31 FACT-NEEDED
  fields across 7 real, photo-backed projects (size, duration, cost band,
  a problem solved). This is the single biggest lever: filling it in
  raises `/projects.html` directly and feeds `/service-areas/*` and the
  service hub pages simultaneously, since the same facts get reused there.
- **Service-area local conditions (Phase 5)** — 32 FACT-NEEDED fields (4
  per city × 8 cities: soil, slope, HOA prevalence, flood considerations),
  plus 4 more cities' worth of real local projects (Mauldin, Five Forks,
  Laurens, Gray Court currently have none). This is what's keeping the
  8 service-area pages at the bottom of the table below — their Answer/
  Structure/Stats sub-scores are already strong; Uniqueness is what's
  waiting on real facts.
- **Calculator pricing methodology (Phase 7)** — 1 question, covers all
  11 calculator pages at once.
- **2 smaller Phase 1 items** — an earlier-origin-date question and
  additional `sameAs` profiles, ~10 minutes total, lowest priority.

Total remaining ask: **roughly 75-90 minutes of Scott's time**, concentrated
almost entirely in real project facts. No further code work unlocks these
numbers — see CITABILITY-FACTS-NEEDED.md for the exact question list.

## Before / after, all 41 pages (sorted by current score)

| Page | Before (Phase 0) | After (Phase 7) | Delta |
|---|---|---|---|
| /terms-of-service.html | 47 | **47** | 0 |
| /privacy-policy.html | 51 | **51** | 0 |
| /service-areas/five-forks.html | 56 | **61** | +5 |
| /service-areas/simpsonville.html | 56 | **61** | +5 |
| /service-areas/mauldin.html | 57 | **61** | +4 |
| /commercial-roofing | 61 | **62** | +1 |
| /service-areas/greenville.html | 58 | **62** | +4 |
| /service-areas/woodruff.html | 58 | **63** | +5 |
| /service-areas/gray-court.html | 57 | **64** | +7 |
| /service-areas/fountain-inn.html | 60 | **66** | +6 |
| /service-areas/laurens.html | 58 | **66** | +8 |
| /insurance-restoration | 64 | **68** | +4 |
| /projects.html | 52 | **69** | +17 |
| /ada-compliance | 67 | **70** | +3 |
| /calculator/kitchen-remodel.html | 70 | **70** | 0 |
| /calculator/bath-remodel.html | 71 | **71** | 0 |
| /calculator/whole-home-remodel.html | 70 | **71** | +1 |
| /ada-bath-to-shower | 70 | **72** | +2 |
| /calculator/porch.html | 72 | **72** | 0 |
| /remodeling | 70 | **73** | +3 |
| /calculator/covered-patios.html | 71 | **73** | +2 |
| /calculator/ada-bath-shower.html | 73 | **74** | +1 |
| /calculator/estimate.html | 75 | **74** | -1 |
| / | 71 | **76** | +5 |
| /handyman | 71 | **76** | +5 |
| /outdoor-living/screened-porches | 71 | **76** | +5 |
| /outdoor-living/covered-patios | 71 | **76** | +5 |
| /faqs.html | 63 | **77** | +14 |
| /additions | 71 | **77** | +6 |
| /outdoor-living/decks | 72 | **77** | +5 |
| /calculator/additions.html | 71 | **77** | +6 |
| /calculator/garages.html | 71 | **77** | +6 |
| /services.html | 71 | **78** | +7 |
| /contact.html | 71 | **79** | +8 |
| /commercial-upfits | 71 | **79** | +8 |
| /calculator/basement-finishing.html | 71 | **79** | +8 |
| /calculator/decks.html | 71 | **79** | +8 |
| /basement-finishing | 72 | **80** | +8 |
| /garages | 71 | **80** | +9 |
| /about.html | 80 | **82** | +2 |
| /adu-builder | 70 | **82** | +12 |

## Summary of audit findings that didn't reproduce or were self-contradictory

Compiled across all 7 phases — see each phase's commit message for full
detail on the specific finding:

1. **BreadcrumbList "contradiction"** (Phase 0) — the audit listed it under
   both "Schema Types Found" and "Missing Recommended Schemas." Not
   actually a contradiction: it's present on 40/41 pages, correctly absent
   only on `index.html` (standard guidance — a homepage doesn't need a
   breadcrumb to itself).
2. **"Only 'some' service pages have FAQPage schema"** (Phase 0/6) — it
   was already on all 14 service pages, all 8 service-area pages,
   `faqs.html`, `services.html`, and `index.html` before this project
   started. The only real gap was the 11 calculator pages (fixed, Phase 6).
3. **Bylines "missing"** (Phase 0/1) — already on 24/41 pages via a shared
   component. Real gap was narrower: 16 pages (calculators + about/
   contact/projects/index/services.html).
4. **"Organization.sameAs missing profiles / LinkedIn-only"** (Phase 0) —
   already had 5 real, non-placeholder profiles. Two stale internal docs
   (`SCHEMAS-BY-PAGE.md`, `STRUCTURED-DATA-AUDIT.md`, dated 2026-06-30)
   still describe `PLACEHOLDER_` URLs and are almost certainly what
   confused the crawl or a prior review — not the live state.
5. **Calculator "Answer Quality collapses to 50 because the number is
   buried in prose"** (Phase 0/2) — false as stated; calculators already
   had a proper `<h2>question</h2>` → direct-answer pattern. The real
   issue was breadth (1 question heading, not 4+), fixed in Phase 2.
6. **"Seven" service-area pages** (Phase 0) — there are 8 (five-forks,
   fountain-inn, gray-court, greenville, laurens, mauldin, simpsonville,
   woodruff).
7. **Service-area pages "generic templated skeletons"** (Phase 0/5) — each
   city already had real, unique `about` prose and 2-3 named real
   neighborhoods with housing-stock era before this project started; that
   part of the audit's characterization overstated the problem. The real,
   confirmed issue (Phase 5) is structural: 41-51% cross-page text overlap
   remains even after adding real per-city permits/projects content — see
   Phase 5's commit for the direct measurement.
8. **"Indexability failure" / missing meta description** (Phase 1) — no
   page was found with an absent description tag (checked all 41). The
   real, much larger issue was systemic over-length (24 of 41 pages over
   155 chars) — a different problem than "indexability," fixed in Phase 7.
9. **Phase 6's suggested page list** ("/adu-builder, /insurance-
   restoration, /commercial-upfits, /ada-compliance, /ada-bath-to-shower,
   /commercial-roofing" need FAQ schema) — all six already had it before
   this project started; see finding #2.

## Out of scope, confirmed still out of scope

**Brand Authority (54/100 in the real audit)** — Wikidata entity, YouTube,
Reddit, additional `sameAs` profiles. Entirely off-site, no code change
touches it. `llms.txt` (Phase 7) now names the BBB profile as a third-
party-verifiable source, which is the one piece of this that overlapped
with in-scope work.

---

Sorted worst-first. Sub-scores are 0-100; overall = 25% Answer + 20% Self-Containment + 20% Structure + 20% Stats + 15% Uniqueness.

## Calibration notes (Phase 0)

This is a local heuristic proxy for the SEOmator GEO audit, not a reproduction of it — it exists for fast iteration between real audit re-runs. After two tuning passes (Answer Quality now requires breadth — 4+ question headings — not just one well-formed answer; Uniqueness now measures cross-page *containment* of 8-word shingles rather than Jaccard, so a short boilerplate block copy-pasted into an otherwise-long page still gets caught) it tracks the audit's shape on most of the floor: `/projects.html` and all 8 service-area pages cluster at the bottom in both, and calculators moved from this scorer's top-ranked pages to mid-pack, matching the audit's "calculators score respectably but not at the top" pattern. It does **not** reproduce the audit ranking `/` and `/services.html` as the single worst pages on the site — both land mid-pack here (71) instead of at the floor (audit: 45, 43). Likely cause: those two pages are mostly service/FAQ card grids with light connective prose, which this heuristic does not penalize as heavily as SEOmator evidently does. Treat this tool's *ranking shape* and *relative before/after deltas* as signal; treat any single absolute score, and especially this gap on `/` and `/services.html`, with skepticism until the real audit re-runs (planned after Phase 4).

| Page | Total | Answer | Self-Cont. | Structure | Stats | Unique |
|---|---|---|---|---|---|---|
| /terms-of-service.html | **47** | 25 | 71 | 64 | 38 | 38 |
| /privacy-policy.html | **51** | 28 | 83 | 62 | 53 | 32 |
| /service-areas/five-forks.html | **61** | 35 | 100 | 86 | 59 | 20 |
| /service-areas/mauldin.html | **61** | 35 | 100 | 86 | 60 | 20 |
| /service-areas/simpsonville.html | **61** | 35 | 100 | 86 | 58 | 21 |
| /commercial-roofing | **62** | 35 | 100 | 86 | 62 | 26 |
| /service-areas/greenville.html | **62** | 35 | 100 | 86 | 63 | 21 |
| /service-areas/woodruff.html | **63** | 35 | 100 | 86 | 66 | 24 |
| /service-areas/gray-court.html | **64** | 48 | 100 | 86 | 58 | 19 |
| /service-areas/fountain-inn.html | **66** | 48 | 100 | 86 | 69 | 21 |
| /service-areas/laurens.html | **66** | 48 | 100 | 86 | 68 | 19 |
| /insurance-restoration | **68** | 35 | 92 | 87 | 100 | 24 |
| /projects.html | **69** | 65 | 100 | 85 | 46 | 46 |
| /ada-compliance | **70** | 44 | 100 | 85 | 91 | 27 |
| /calculator/kitchen-remodel.html | **70** | 68 | 89 | 78 | 100 | 0 |
| /calculator/bath-remodel.html | **71** | 68 | 90 | 78 | 100 | 3 |
| /calculator/whole-home-remodel.html | **71** | 68 | 89 | 78 | 100 | 2 |
| /ada-bath-to-shower | **72** | 54 | 100 | 85 | 100 | 13 |
| /calculator/porch.html | **72** | 68 | 89 | 78 | 100 | 12 |
| /remodeling | **73** | 48 | 100 | 87 | 100 | 23 |
| /calculator/covered-patios.html | **73** | 68 | 89 | 78 | 100 | 14 |
| /calculator/ada-bath-shower.html | **74** | 68 | 89 | 78 | 100 | 21 |
| /calculator/estimate.html | **74** | 68 | 88 | 74 | 100 | 29 |
| / | **76** | 43 | 100 | 89 | 100 | 50 |
| /handyman | **76** | 48 | 100 | 87 | 100 | 43 |
| /outdoor-living/screened-porches | **76** | 61 | 100 | 88 | 100 | 21 |
| /outdoor-living/covered-patios | **76** | 61 | 100 | 87 | 100 | 25 |
| /faqs.html | **77** | 74 | 100 | 86 | 83 | 33 |
| /additions | **77** | 61 | 100 | 87 | 100 | 29 |
| /outdoor-living/decks | **77** | 61 | 100 | 87 | 100 | 28 |
| /calculator/additions.html | **77** | 84 | 89 | 78 | 100 | 17 |
| /calculator/garages.html | **77** | 84 | 89 | 78 | 100 | 16 |
| /services.html | **78** | 46 | 100 | 88 | 100 | 57 |
| /contact.html | **79** | 61 | 100 | 89 | 100 | 38 |
| /commercial-upfits | **79** | 61 | 100 | 88 | 100 | 42 |
| /calculator/basement-finishing.html | **79** | 84 | 89 | 78 | 100 | 33 |
| /calculator/decks.html | **79** | 84 | 89 | 78 | 100 | 28 |
| /basement-finishing | **80** | 74 | 100 | 88 | 100 | 29 |
| /garages | **80** | 74 | 100 | 87 | 100 | 28 |
| /about.html | **82** | 74 | 94 | 85 | 100 | 48 |
| /adu-builder | **82** | 74 | 91 | 88 | 100 | 51 |

## Detail (worst 10 pages)

### /terms-of-service.html — 47/100
- **answerQuality**: 0 question-form H1/H2 headings
- **selfContainment**: 2/7 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 0 FAQ blocks, 6 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 4 numeric tokens / 265 words (1.5 per 100w, target 4+)
- **uniqueness**: 1 place names, 0 license mentions, first-person=false, max cross-page containment overlap 0%

### /privacy-policy.html — 51/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 1/6 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 0 FAQ blocks, 5 H2/H3, 0/5 sections in 100-220wd band
- **statisticalDensity**: 5 numeric tokens / 238 words (2.1 per 100w, target 4+)
- **uniqueness**: 0 place names, 0 license mentions, first-person=false, max cross-page containment overlap 0%

### /service-areas/five-forks.html — 61/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/15 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 27 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 17 numeric tokens / 721 words (2.4 per 100w, target 4+)
- **uniqueness**: 10 place names, 8 license mentions, first-person=true, max cross-page containment overlap 50%

### /service-areas/mauldin.html — 61/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/16 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 27 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 17 numeric tokens / 706 words (2.4 per 100w, target 4+)
- **uniqueness**: 10 place names, 8 license mentions, first-person=true, max cross-page containment overlap 50%

### /service-areas/simpsonville.html — 61/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/18 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 29 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 17 numeric tokens / 729 words (2.3 per 100w, target 4+)
- **uniqueness**: 10 place names, 8 license mentions, first-person=true, max cross-page containment overlap 49%

### /commercial-roofing — 62/100
- **answerQuality**: 7 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/12 paragraphs open with an unresolved reference
- **structure**: 1 table(s), 0 dl, 2 ol, 1 FAQ blocks, 17 H2/H3, 1/11 sections in 100-220wd band
- **statisticalDensity**: 20 numeric tokens / 802 words (2.5 per 100w, target 4+)
- **uniqueness**: 1 place names, 2 license mentions, first-person=true, max cross-page containment overlap 29%

### /service-areas/greenville.html — 62/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/16 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 28 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 18 numeric tokens / 715 words (2.5 per 100w, target 4+)
- **uniqueness**: 10 place names, 8 license mentions, first-person=true, max cross-page containment overlap 49%

### /service-areas/woodruff.html — 63/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/17 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 29 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 19 numeric tokens / 717 words (2.6 per 100w, target 4+)
- **uniqueness**: 11 place names, 8 license mentions, first-person=true, max cross-page containment overlap 45%

### /service-areas/gray-court.html — 64/100
- **answerQuality**: 5 question headings (coverage 100%), 1 with a qualifying direct-answer paragraph
- **selfContainment**: 0/16 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 27 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 17 numeric tokens / 739 words (2.3 per 100w, target 4+)
- **uniqueness**: 10 place names, 8 license mentions, first-person=true, max cross-page containment overlap 51%

### /service-areas/fountain-inn.html — 66/100
- **answerQuality**: 5 question headings (coverage 100%), 1 with a qualifying direct-answer paragraph
- **selfContainment**: 0/18 paragraphs open with an unresolved reference
- **structure**: 2 table(s), 0 dl, 1 ol, 1 FAQ blocks, 29 H2/H3, 1/14 sections in 100-220wd band
- **statisticalDensity**: 21 numeric tokens / 764 words (2.7 per 100w, target 4+)
- **uniqueness**: 10 place names, 8 license mentions, first-person=true, max cross-page containment overlap 49%
