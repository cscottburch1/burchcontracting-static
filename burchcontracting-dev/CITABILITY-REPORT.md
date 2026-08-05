# Citability Report

Generated: 2026-08-05
Pages scored: 41
**Average citability score: 71/100**

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
