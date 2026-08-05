# Citability Report

Generated: 2026-08-05
Pages scored: 41
**Average citability score: 72/100**

Sorted worst-first. Sub-scores are 0-100; overall = 25% Answer + 20% Self-Containment + 20% Structure + 20% Stats + 15% Uniqueness.

## Calibration notes (Phase 0)

This is a local heuristic proxy for the SEOmator GEO audit, not a reproduction of it — it exists for fast iteration between real audit re-runs. After two tuning passes (Answer Quality now requires breadth — 4+ question headings — not just one well-formed answer; Uniqueness now measures cross-page *containment* of 8-word shingles rather than Jaccard, so a short boilerplate block copy-pasted into an otherwise-long page still gets caught) it tracks the audit's shape on most of the floor: `/projects.html` and all 8 service-area pages cluster at the bottom in both, and calculators moved from this scorer's top-ranked pages to mid-pack, matching the audit's "calculators score respectably but not at the top" pattern. It does **not** reproduce the audit ranking `/` and `/services.html` as the single worst pages on the site — both land mid-pack here (71) instead of at the floor (audit: 45, 43). Likely cause: those two pages are mostly service/FAQ card grids with light connective prose, which this heuristic does not penalize as heavily as SEOmator evidently does. Treat this tool's *ranking shape* and *relative before/after deltas* as signal; treat any single absolute score, and especially this gap on `/` and `/services.html`, with skepticism until the real audit re-runs (planned after Phase 4).

| Page | Total | Answer | Self-Cont. | Structure | Stats | Unique |
|---|---|---|---|---|---|---|
| /terms-of-service.html | **47** | 25 | 71 | 64 | 38 | 38 |
| /privacy-policy.html | **51** | 28 | 83 | 62 | 53 | 32 |
| /service-areas/five-forks.html | **62** | 35 | 100 | 81 | 70 | 22 |
| /service-areas/mauldin.html | **62** | 35 | 100 | 81 | 70 | 22 |
| /service-areas/simpsonville.html | **62** | 35 | 100 | 81 | 69 | 22 |
| /commercial-roofing | **63** | 35 | 100 | 87 | 68 | 24 |
| /service-areas/greenville.html | **63** | 35 | 100 | 81 | 75 | 22 |
| /service-areas/woodruff.html | **64** | 35 | 100 | 81 | 78 | 23 |
| /service-areas/gray-court.html | **66** | 48 | 100 | 81 | 72 | 21 |
| /insurance-restoration | **67** | 35 | 92 | 85 | 100 | 22 |
| /service-areas/laurens.html | **68** | 48 | 100 | 81 | 81 | 21 |
| /service-areas/fountain-inn.html | **69** | 48 | 100 | 81 | 86 | 22 |
| /projects.html | **70** | 65 | 100 | 67 | 70 | 43 |
| /ada-bath-to-shower | **72** | 54 | 100 | 85 | 100 | 7 |
| /ada-compliance | **72** | 44 | 100 | 85 | 100 | 24 |
| /remodeling | **72** | 48 | 100 | 87 | 100 | 17 |
| /services.html | **73** | 46 | 100 | 89 | 76 | 57 |
| / | **74** | 44 | 100 | 88 | 92 | 48 |
| /calculator/bath-remodel.html | **74** | 68 | 100 | 78 | 100 | 10 |
| /calculator/covered-patios.html | **74** | 68 | 100 | 78 | 100 | 9 |
| /calculator/kitchen-remodel.html | **74** | 68 | 100 | 78 | 100 | 6 |
| /calculator/porch.html | **74** | 68 | 100 | 78 | 100 | 6 |
| /calculator/whole-home-remodel.html | **74** | 68 | 100 | 78 | 100 | 8 |
| /outdoor-living/screened-porches | **75** | 61 | 100 | 88 | 100 | 13 |
| /calculator/ada-bath-shower.html | **75** | 68 | 100 | 78 | 100 | 17 |
| /faqs.html | **76** | 74 | 100 | 80 | 83 | 32 |
| /additions | **76** | 61 | 100 | 87 | 100 | 24 |
| /handyman | **76** | 48 | 100 | 87 | 100 | 43 |
| /outdoor-living/decks | **76** | 61 | 100 | 87 | 100 | 22 |
| /outdoor-living/covered-patios | **76** | 61 | 100 | 87 | 100 | 19 |
| /calculator/estimate.html | **76** | 68 | 100 | 78 | 100 | 25 |
| /contact.html | **78** | 61 | 100 | 84 | 100 | 37 |
| /calculator/garages.html | **78** | 84 | 100 | 78 | 100 | 12 |
| /commercial-upfits | **79** | 61 | 100 | 88 | 100 | 42 |
| /garages | **79** | 74 | 100 | 87 | 100 | 23 |
| /calculator/additions.html | **79** | 84 | 100 | 78 | 100 | 13 |
| /basement-finishing | **80** | 74 | 100 | 88 | 100 | 24 |
| /calculator/decks.html | **80** | 84 | 100 | 78 | 100 | 23 |
| /about.html | **81** | 74 | 94 | 85 | 100 | 47 |
| /calculator/basement-finishing.html | **81** | 84 | 100 | 78 | 100 | 29 |
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

### /service-areas/five-forks.html — 62/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 1 FAQ blocks, 23 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 15 numeric tokens / 539 words (2.8 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/mauldin.html — 62/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/14 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 1 FAQ blocks, 23 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 15 numeric tokens / 532 words (2.8 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/simpsonville.html — 62/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/15 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 1 FAQ blocks, 24 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 15 numeric tokens / 544 words (2.8 per 100w, target 4+)
- **uniqueness**: 10 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /commercial-roofing — 63/100
- **answerQuality**: 7 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/12 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 2 ol, 1 FAQ blocks, 16 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 20 numeric tokens / 731 words (2.7 per 100w, target 4+)
- **uniqueness**: 1 place names, 2 license mentions, first-person=true, max cross-page containment overlap 30%

### /service-areas/greenville.html — 63/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 1 FAQ blocks, 23 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 16 numeric tokens / 530 words (3.0 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 48%

### /service-areas/woodruff.html — 64/100
- **answerQuality**: 5 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 0/13 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 1 FAQ blocks, 23 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 16 numeric tokens / 515 words (3.1 per 100w, target 4+)
- **uniqueness**: 10 place names, 5 license mentions, first-person=true, max cross-page containment overlap 46%

### /service-areas/gray-court.html — 66/100
- **answerQuality**: 5 question headings (coverage 100%), 1 with a qualifying direct-answer paragraph
- **selfContainment**: 0/14 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 1 ol, 1 FAQ blocks, 23 H2/H3, 1/10 sections in 100-220wd band
- **statisticalDensity**: 16 numeric tokens / 557 words (2.9 per 100w, target 4+)
- **uniqueness**: 9 place names, 5 license mentions, first-person=true, max cross-page containment overlap 49%

### /insurance-restoration — 67/100
- **answerQuality**: 6 question headings (coverage 100%), 0 with a qualifying direct-answer paragraph
- **selfContainment**: 1/12 paragraphs open with an unresolved reference
- **structure**: 0 table(s), 0 dl, 2 ol, 1 FAQ blocks, 13 H2/H3, 0/9 sections in 100-220wd band
- **statisticalDensity**: 20 numeric tokens / 486 words (4.1 per 100w, target 4+)
- **uniqueness**: 1 place names, 2 license mentions, first-person=false, max cross-page containment overlap 22%
