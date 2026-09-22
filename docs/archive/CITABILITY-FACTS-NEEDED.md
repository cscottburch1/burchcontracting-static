# Facts Needed From Scott — AI Citability Project

Plain-English questions, grouped by page/topic, ordered roughly by scoring
impact. None of this was invented — every item below is a real gap found
while adding structure/schema, not filler. Estimated total time: **~10
minutes** for Phase 1's 2 items, **~35-45 minutes** for Phase 4's project
questions, **~30-40 minutes** for Phase 5's 8-city local-conditions grid
(4 quick questions x 8 cities, most answerable in one or two sentences
each) plus a few minutes per city for the 4 cities with no project yet,
**~2 minutes** for Phase 7's one methodology question. Total remaining:
roughly **75-90 minutes** across everything in this file.

---

## Phase 7 — Calculator methodology (one answer covers all 11 pages)

Every calculator now has a "How We Price This" box explaining the
*formula* (base cost/sq ft, adjusted for material/complexity/site, plus
20% overhead & profit — all real, already published). What it can't say
yet is what real-world data set the *base rates* themselves — the
starting numbers the formula adjusts from.

**Question for Scott:** Are the base cost-per-square-foot figures in
`calculator-config.js` built from Burch Contracting's own completed-
project invoices (which years?), current supplier/material quotes, or
some combination? A one-sentence answer is enough — this fills in the
one placeholder currently showing on all 11 calculator pages.

---

## Phase 5 — Service-area local detail (8 cities)

Each of the 8 `/service-areas/*.html` pages now has a real, county-specific
permits section (Greenville/Laurens County link to their real permits
office; the other real facts — neighborhoods, drive time, insights — were
already on these pages before this project started). Two things are
genuinely missing per city:

### A. Local Building Conditions (all 8 cities, same 4 questions each)
Shows "Not yet published" on every page right now. For each of Simpsonville,
Fountain Inn, Mauldin, Greenville, Five Forks, Woodruff, Laurens, and Gray
Court:
1. Typical soil/site conditions you run into there?
2. Typical lot slope (flat, rolling, steep lots common)?
3. How common is HOA review/approval in this area?
4. Any flood zone or drainage considerations worth noting?

A short, honest answer per city is fine — "mostly flat, red clay, HOA
common in newer subdivisions, no particular flood concerns" is a
perfectly good answer for one city. Doesn't need to be different for
every city if it genuinely isn't.

### B. Missing real projects (4 of 8 cities have none yet)
Mauldin, Five Forks, Laurens, and Gray Court have no project case study on
their page — Greenville, Fountain Inn, Simpsonville, and Woodruff already
do (reused from `/projects.html`, see Phase 4). 2-3 real completed
projects per city (scope + rough cost band, same format as the Phase 4
list) would close this gap and be reused across `/projects.html` and that
city's page simultaneously.

### C. Spartanburg County permits office link (Woodruff only)
The page names "Spartanburg County" as the jurisdiction (that's real —
already stated in geo-aeo.js's insights) but has no specific permits-office
URL the way Greenville and Laurens counties do. If you have one, it's a
one-line add.

### D. A known limitation, not a question for Scott
Direct pairwise text comparison across the 8 pages currently shows
41-51% overlap (target from the original plan: under 30%). This isn't
filler — it's the shared section scaffolding ("About [City]", "Our
Services in [City]", the FAQ intro line, the CTA) that's genuinely the
same pattern reworded per city, plus (correctly) near-identical permits
paragraphs for the 5 cities that share Greenville County's office. Filling
in A and B above will narrow this — real per-city facts are the actual
fix, not further phrasing tweaks to already-honest boilerplate.

---

## Phase 4 — Project case studies (`/projects.html`) — HIGHEST IMPACT

`/projects.html` already had 14 real project photo cards; 7 of them have a
specific city (not just "Upstate SC") and got promoted to full case-study
cards with a Location/Scope/Materials/Size/Duration/Cost Band/Challenge
Solved breakdown. Location, Scope, and (where the existing photo caption
already said so) Materials are filled in for real — everything else below
shows "Not yet published" on the live page until answered. This is the
single highest-value fact set in the whole project: real project data is
what the audit calls unfakeable by competitors, and it gets reused by
`/projects.html`, the service-area pages, and the service hub pages
simultaneously once it exists.

For each project, a few quick questions — a round number/range is fine:

### 1. Custom Multi-Level Deck — Greenville, SC
Size (sq ft)? Duration, start to finish? Final cost band? One problem on
this job and how you solved it?

### 2. Screened Porch Addition — Fountain Inn, SC
Materials (framing — wood or aluminum? screening or EZE-Breeze?)? Size?
Duration? Cost band? Problem solved?

### 3. Detached Two-Car Garage — Simpsonville, SC
Size (sq ft)? Duration? Cost band? Problem solved?

### 4. Detached Two-Car Garage — Greenville County, SC
Materials (siding type, foundation)? Size? Duration? Cost band? Problem
solved?

### 5. Room Addition — Fountain Inn, SC
Materials? Size? Duration? Cost band? Problem solved?

### 6. Bath-to-Shower Conversion — Woodruff, SC
Size (or just "standard bathroom")? Duration? Cost band? Problem solved?

### 7. Walk-In Shower Remodel — Woodruff, SC
Size? Duration? Cost band? Problem solved?

**Bonus, not required:** 3-6 more real projects (any city, any service
type) would round out `/projects.html` toward the 6-10 the plan calls for
and give Phase 5's service-area pages more real material to draw on.

---

## Phase 1 — Trust & freshness layer

### 1. Original publish date for the business's own content
**What's needed:** The `datePublished` dates now on every page (see
`src/data/content-dates.js`) are derived from this git repo's history —
i.e. "when this page first entered this repository" (mostly June-July
2026, when the site migration project started), not "when this
information/business first existed." Burch Contracting has operated since
1995; the content itself (pricing philosophy, service descriptions) may be
older than its first commit here.
**Why it matters:** `datePublished` in Article schema is a mild trust/
freshness signal. Using a migration-repo date isn't wrong, but it
understates how long this business and its public information have
existed if a truer origin date exists (e.g. an old website, GMB profile
creation date, first indexed page via Wayback Machine).
**Which page/section:** Sitewide (`src/data/content-dates.js`,
`scripts/compute-content-dates.mjs`).
**Question for Scott:** Is there an earlier public version of this
content (old website, old GMB listing) with a known first-live date we
should use instead of the repo's own history? If not, the repo-derived
dates stand as-is — no action needed.

### 2. Additional real `sameAs` profiles
**What's needed:** `Organization.sameAs` currently lists Google Business
Profile, Facebook, Instagram, LinkedIn, and BBB (already fixed before this
project started — the two docs `SCHEMAS-BY-PAGE.md` and
`STRUCTURED-DATA-AUDIT.md` still describe `PLACEHOLDER_` URLs but that's
stale, dated 2026-06-30; the live schema has real URLs for all five).
**Why it matters:** More verified `sameAs` profiles strengthen entity
grounding for AI systems trying to confirm "which Burch Contracting is
this." The audit's Brand Authority sub-score (54/100, explicitly
out-of-scope for code changes per this project's brief) references
Wikidata/YouTube/Reddit — those need real profiles to exist before they
can be linked.
**Which page/section:** `src/data/site-schema.js` (`ORGANIZATION_SCHEMA.sameAs`).
**Question for Scott:** Do any of these exist and should be added:
a YouTube channel, a Yelp profile, an Angi/HomeAdvisor profile, an X/
Twitter account, a Houzz profile? Only real, currently-active profiles —
skip anything inactive or you don't check.

---

## Notes on what did NOT need to go in this file

- **Byline/credentials text** — didn't need new facts; SC #CLG118679, NC
  #107292, 35+ years, BBB A+, 5.0 Google rating were all already published
  elsewhere on the site and just needed to be repeated in the new byline
  blocks.
- **Article schema dates** — used git history per item 1 above rather than
  guessing; flagged as an open question, not fabricated.
- **Meta description length** — the audit's "indexability failure" claim
  didn't reproduce as a *missing* description anywhere (checked all 41
  pages); it's more likely the systemic over-155-char issue on ~24 pages,
  which Phase 7 fixes directly by rewriting descriptions to lead with the
  number. No new facts needed there either — existing copy, just too long.
- **services.html "Permit Required" column** — only asserts "Yes" where an
  existing FAQ answer already says so explicitly (decks, garages,
  additions, commercial-upfits); everything else shows "Case-by-case"
  rather than a guessed yes/no. If you want firmer answers for
  screened-porches/covered-patios/remodeling/basement-finishing/
  commercial-roofing/insurance-restoration/ada-bath-to-shower/handyman,
  that'd be a fact worth adding, but the honest default works fine as-is.
- **services.html "Typical Budget: Custom Quote" bug** — not a new fact,
  a bug fix: 11 of 14 service cards were hardcoded to "Custom Quote" even
  though their real cost range was already computed elsewhere on the site
  (`SERVICES[].stats.costRange`). Fixed by reading that instead.
