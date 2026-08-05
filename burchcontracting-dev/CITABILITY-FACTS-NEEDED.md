# Facts Needed From Scott — AI Citability Project

Plain-English questions, grouped by page/topic, ordered roughly by scoring
impact. None of this was invented — every item below is a real gap found
while adding structure/schema, not filler. Estimated total time: **~10
minutes** for Phase 1's 2 items, **~35-45 minutes** for Phase 4's project
questions below (7 projects x ~4 quick questions each). Phase 5 (per-city
local detail — permits, HOA prevalence, 2-3 more real projects per city)
will add the bulk of what's left; budget a longer sitting once it lands.

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
