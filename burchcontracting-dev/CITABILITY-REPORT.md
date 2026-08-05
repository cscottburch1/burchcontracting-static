# Citability Report

Generated: 2026-08-05
Pages scored: 41
**Average citability score: 66/100**

Sorted worst-first. Sub-scores are 0-100; overall = 25% Answer + 20% Self-Containment + 20% Structure + 20% Stats + 15% Uniqueness.

## Calibration notes (Phase 0)

This is a local heuristic proxy for the SEOmator GEO audit, not a reproduction of it — it exists for fast iteration between real audit re-runs. After two tuning passes (Answer Quality now requires breadth — 4+ question headings — not just one well-formed answer; Uniqueness now measures cross-page *containment* of 8-word shingles rather than Jaccard, so a short boilerplate block copy-pasted into an otherwise-long page still gets caught) it tracks the audit's shape on most of the floor: `/projects.html` and all 8 service-area pages cluster at the bottom in both, and calculators moved from this scorer's top-ranked pages to mid-pack, matching the audit's "calculators score respectably but not at the top" pattern. It does **not** reproduce the audit ranking `/` and `/services.html` as the single worst pages on the site — both land mid-pack here (71) instead of at the floor (audit: 45, 43). Likely cause: those two pages are mostly service/FAQ card grids with light connective prose, which this heuristic does not penalize as heavily as SEOmator evidently does. Treat this tool's *ranking shape* and *relative before/after deltas* as signal; treat any single absolute score, and especially this gap on `/` and `/services.html`, with skepticism until the real audit re-runs (planned after Phase 4).

| Page | Total | Answer | Self-Cont. | Structure | Stats | Unique |
|---|---|---|---|---|---|---|
| /terms-of-service.html | **47** | 25 | 71 | 64 | 38 | 38 |
| /privacy-policy.html | **51** | 28 | 83 | 62 | 53 | 32 |
| /projects.html | **52** | 28 | 100 | 67 | 27 | 42 |
| /service-areas/five-forks.html | **56** | 28 | 100 | 79 | 51 | 23 |
| /service-areas/simpsonville.html | **56** | 28 | 100 | 79 | 51 | 23 |
| /service-areas/gray-court.html | **57** | 28 | 100 | 79 | 54 | 22 |
| /service-areas/mauldin.html | **57** | 28 | 100 | 79 | 52 | 23 |
| /service-areas/greenville.html | **58** | 28 | 100 | 79 | 57 | 23 |
| /service-areas/laurens.html | **58** | 28 | 100 | 79 | 62 | 22 |
| /service-areas/woodruff.html | **58** | 28 | 100 | 79 | 58 | 24 |
| /service-areas/fountain-inn.html | **60** | 28 | 100 | 79 | 68 | 23 |
| /commercial-roofing | **61** | 33 | 100 | 88 | 58 | 24 |
| /faqs.html | **63** | 28 | 100 | 81 | 76 | 33 |
| /insurance-restoration | **64** | 30 | 92 | 85 | 87 | 23 |
| /ada-compliance | **67** | 33 | 100 | 85 | 88 | 25 |
| /ada-bath-to-shower | **70** | 33 | 100 | 85 | 100 | 31 |
| /adu-builder | **70** | 28 | 91 | 88 | 100 | 50 |
| /remodeling | **70** | 28 | 100 | 85 | 100 | 43 |
| /calculator/kitchen-remodel.html | **70** | 44 | 100 | 81 | 100 | 18 |
| /calculator/whole-home-remodel.html | **70** | 44 | 100 | 81 | 100 | 18 |
| / | **71** | 35 | 100 | 89 | 83 | 52 |
| /services.html | **71** | 35 | 100 | 93 | 76 | 57 |
| /contact.html | **71** | 28 | 100 | 87 | 100 | 43 |
| /additions | **71** | 28 | 100 | 85 | 100 | 49 |
| /commercial-upfits | **71** | 28 | 100 | 88 | 100 | 42 |
| /garages | **71** | 28 | 100 | 85 | 100 | 47 |
| /handyman | **71** | 28 | 100 | 88 | 100 | 43 |
| /outdoor-living/screened-porches | **71** | 28 | 100 | 88 | 100 | 45 |
| /outdoor-living/covered-patios | **71** | 28 | 100 | 85 | 100 | 46 |
| /calculator/additions.html | **71** | 44 | 100 | 81 | 100 | 24 |
| /calculator/basement-finishing.html | **71** | 44 | 100 | 81 | 100 | 23 |
| /calculator/bath-remodel.html | **71** | 44 | 100 | 81 | 100 | 25 |
| /calculator/covered-patios.html | **71** | 44 | 100 | 81 | 100 | 22 |
| /calculator/decks.html | **71** | 44 | 100 | 81 | 100 | 22 |
| /calculator/garages.html | **71** | 44 | 100 | 81 | 100 | 23 |
| /basement-finishing | **72** | 28 | 100 | 90 | 100 | 46 |
| /outdoor-living/decks | **72** | 28 | 100 | 85 | 100 | 51 |
| /calculator/porch.html | **72** | 44 | 100 | 81 | 100 | 33 |
| /calculator/ada-bath-shower.html | **73** | 44 | 100 | 81 | 100 | 40 |
| /calculator/estimate.html | **75** | 44 | 100 | 81 | 100 | 50 |
| /about.html | **80** | 65 | 93 | 85 | 100 | 53 |

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

### /projects.html — 52/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/16 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 0 FAQ blocks, 15 H2/H3, 0/15 sections in 100-220wd band
- **statisticalDensity**: 4 numeric tokens / 371 words (1.1 per 100w, target 4+)
- **uniqueness**: 6 place names, 0 license mentions, first-person=false, max cross-page containment overlap 0%

### /service-areas/five-forks.html — 56/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 11 numeric tokens / 539 words (2.0 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 47%

### /service-areas/simpsonville.html — 56/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/15 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 20 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 11 numeric tokens / 544 words (2.0 per 100w, target 4+)
- **uniqueness**: 10 place names, 5 license mentions, first-person=true, max cross-page containment overlap 47%

### /service-areas/gray-court.html — 57/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/14 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 12 numeric tokens / 557 words (2.2 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/mauldin.html — 57/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/14 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 11 numeric tokens / 532 words (2.1 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 47%

### /service-areas/greenville.html — 58/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 12 numeric tokens / 530 words (2.3 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 47%

### /service-areas/laurens.html — 58/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 13 numeric tokens / 525 words (2.5 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/woodruff.html — 58/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 12 numeric tokens / 515 words (2.3 per 100w, target 4+)
- **uniqueness**: 10 place names, 5 license mentions, first-person=true, max cross-page containment overlap 45%
