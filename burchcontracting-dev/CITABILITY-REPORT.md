# Citability Report

Generated: 2026-08-05
Pages scored: 41
**Average citability score: 67/100**

Sorted worst-first. Sub-scores are 0-100; overall = 25% Answer + 20% Self-Containment + 20% Structure + 20% Stats + 15% Uniqueness.

## Calibration notes (Phase 0)

This is a local heuristic proxy for the SEOmator GEO audit, not a reproduction of it — it exists for fast iteration between real audit re-runs. After two tuning passes (Answer Quality now requires breadth — 4+ question headings — not just one well-formed answer; Uniqueness now measures cross-page *containment* of 8-word shingles rather than Jaccard, so a short boilerplate block copy-pasted into an otherwise-long page still gets caught) it tracks the audit's shape on most of the floor: `/projects.html` and all 8 service-area pages cluster at the bottom in both, and calculators moved from this scorer's top-ranked pages to mid-pack, matching the audit's "calculators score respectably but not at the top" pattern. It does **not** reproduce the audit ranking `/` and `/services.html` as the single worst pages on the site — both land mid-pack here (71) instead of at the floor (audit: 45, 43). Likely cause: those two pages are mostly service/FAQ card grids with light connective prose, which this heuristic does not penalize as heavily as SEOmator evidently does. Treat this tool's *ranking shape* and *relative before/after deltas* as signal; treat any single absolute score, and especially this gap on `/` and `/services.html`, with skepticism until the real audit re-runs (planned after Phase 4).

| Page | Total | Answer | Self-Cont. | Structure | Stats | Unique |
|---|---|---|---|---|---|---|
| /terms-of-service.html | **47** | 25 | 71 | 64 | 38 | 38 |
| /privacy-policy.html | **51** | 28 | 83 | 62 | 53 | 32 |
| /projects.html | **59** | 28 | 100 | 67 | 62 | 42 |
| /service-areas/five-forks.html | **60** | 28 | 100 | 79 | 69 | 22 |
| /service-areas/gray-court.html | **60** | 28 | 100 | 79 | 71 | 21 |
| /service-areas/mauldin.html | **60** | 28 | 100 | 79 | 70 | 22 |
| /service-areas/simpsonville.html | **60** | 28 | 100 | 79 | 68 | 22 |
| /service-areas/greenville.html | **61** | 28 | 100 | 79 | 75 | 22 |
| /service-areas/laurens.html | **62** | 28 | 100 | 79 | 80 | 21 |
| /service-areas/woodruff.html | **62** | 28 | 100 | 79 | 77 | 23 |
| /commercial-roofing | **63** | 33 | 100 | 88 | 68 | 24 |
| /service-areas/fountain-inn.html | **63** | 28 | 100 | 79 | 85 | 22 |
| /faqs.html | **65** | 28 | 100 | 81 | 83 | 33 |
| /insurance-restoration | **66** | 30 | 92 | 85 | 100 | 22 |
| /ada-compliance | **69** | 33 | 100 | 85 | 100 | 24 |
| /ada-bath-to-shower | **70** | 33 | 100 | 85 | 100 | 30 |
| /adu-builder | **70** | 28 | 91 | 88 | 100 | 50 |
| /remodeling | **70** | 28 | 100 | 85 | 100 | 43 |
| /calculator/covered-patios.html | **70** | 44 | 100 | 83 | 100 | 18 |
| /calculator/decks.html | **70** | 44 | 100 | 83 | 100 | 18 |
| /calculator/kitchen-remodel.html | **70** | 44 | 100 | 83 | 100 | 17 |
| /calculator/whole-home-remodel.html | **70** | 44 | 100 | 83 | 100 | 17 |
| /services.html | **71** | 35 | 100 | 93 | 76 | 57 |
| /contact.html | **71** | 28 | 100 | 89 | 100 | 43 |
| /additions | **71** | 28 | 100 | 85 | 100 | 48 |
| /commercial-upfits | **71** | 28 | 100 | 88 | 100 | 41 |
| /garages | **71** | 28 | 100 | 85 | 100 | 47 |
| /handyman | **71** | 28 | 100 | 88 | 100 | 42 |
| /outdoor-living/screened-porches | **71** | 28 | 100 | 88 | 100 | 44 |
| /outdoor-living/covered-patios | **71** | 28 | 100 | 85 | 100 | 46 |
| /calculator/additions.html | **71** | 44 | 100 | 83 | 100 | 20 |
| /calculator/basement-finishing.html | **71** | 44 | 100 | 83 | 100 | 21 |
| /calculator/bath-remodel.html | **71** | 44 | 100 | 83 | 100 | 23 |
| /calculator/garages.html | **71** | 44 | 100 | 83 | 100 | 20 |
| / | **72** | 35 | 100 | 89 | 91 | 51 |
| /basement-finishing | **72** | 28 | 100 | 90 | 100 | 46 |
| /outdoor-living/decks | **72** | 28 | 100 | 85 | 100 | 50 |
| /calculator/porch.html | **72** | 44 | 100 | 83 | 100 | 27 |
| /calculator/ada-bath-shower.html | **73** | 44 | 100 | 83 | 100 | 33 |
| /calculator/estimate.html | **73** | 44 | 100 | 83 | 100 | 36 |
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

### /projects.html — 59/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/17 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 0 FAQ blocks, 16 H2/H3, 0/15 sections in 100-220wd band
- **statisticalDensity**: 10 numeric tokens / 401 words (2.5 per 100w, target 4+)
- **uniqueness**: 6 place names, 2 license mentions, first-person=false, max cross-page containment overlap 9%

### /service-areas/five-forks.html — 60/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 15 numeric tokens / 544 words (2.8 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/gray-court.html — 60/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/14 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 16 numeric tokens / 562 words (2.8 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 49%

### /service-areas/mauldin.html — 60/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/14 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 15 numeric tokens / 537 words (2.8 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/simpsonville.html — 60/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/15 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 20 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 15 numeric tokens / 549 words (2.7 per 100w, target 4+)
- **uniqueness**: 10 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/greenville.html — 61/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 16 numeric tokens / 535 words (3.0 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/laurens.html — 62/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 17 numeric tokens / 530 words (3.2 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 49%

### /service-areas/woodruff.html — 62/100
- **answerQuality**: 1 question headings (coverage 25%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 5 FAQ blocks, 19 H2/H3, 0/6 sections in 100-220wd band
- **statisticalDensity**: 16 numeric tokens / 520 words (3.1 per 100w, target 4+)
- **uniqueness**: 10 place names, 5 license mentions, first-person=true, max cross-page containment overlap 46%
