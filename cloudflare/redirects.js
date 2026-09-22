/**
 * The retired Next.js site's URLs, and where each one goes now.
 *
 * Extracted from public/.htaccess in Phase 4 by running the parser this
 * replaces and serialising its output, so these 161 entries are by
 * construction exactly what shipped. Nothing was retyped.
 *
 * WHY THIS IS DATA AND NOT A PARSED APACHE FILE
 *
 * The Worker used to import public/.htaccess as text and parse it at startup,
 * so an Apache config was the source of truth for a site with no Apache. That
 * cost a wrangler.jsonc "rules" entry to make the import work, a parser with
 * its own view of RewriteCond semantics, and a standing question nobody could
 * answer quickly: does this rule apply on Cloudflare or not? It also meant
 * Hostinger's config could not be deleted without breaking the Worker.
 *
 * EVERY ENTRY IS A 301 TO A PATH ON THIS SITE
 *
 * [pattern, target]. The pattern is matched against the path WITHOUT its
 * leading slash, in file order, first match wins — Apache's per-directory
 * semantics, kept because these patterns were written for it. $1-$9 in the
 * target take the capture groups. The original query string is appended
 * unless the target carries its own.
 *
 * The three rules that Apache guarded with a RewriteCond are not here:
 * the www and HTTPS canonicalisations, which Cloudflare does at the edge
 * before the Worker runs, and the two internal .html rewrites, which are
 * servePage() in worker.js. The one REQUEST_FILENAME-guarded redirect — the
 * legacy /calculator/* catch-all — IS here, because worker.js tries a real
 * page before consulting this table, which is the same guard.
 */
export const LEGACY_REDIRECTS = [

  // --- Trailing-slash forms -> the canonical URL -------------------------- The retired Next.js site redirected these, and they are still linked from elsewhere on the web (see migration/legacy-urls.txt).
  ["^about/$", "/about"],
  ["^calculator/ada-bath-shower/$", "/calculator/ada-bath-shower"],
  ["^calculator/additions/$", "/calculator/additions"],
  ["^calculator/basement-finishing/$", "/calculator/basement-finishing"],
  ["^calculator/bath-remodel/$", "/calculator/bath-remodel"],
  ["^calculator/covered-patios/$", "/calculator/covered-patios"],
  ["^calculator/decks/$", "/calculator/decks"],
  ["^calculator/estimate/$", "/calculator/estimate"],
  ["^calculator/garages/$", "/calculator/garages"],
  ["^calculator/kitchen-remodel/$", "/calculator/kitchen-remodel"],
  ["^calculator/porch/$", "/calculator/porch"],
  ["^calculator/whole-home-remodel/$", "/calculator/whole-home-remodel"],
  ["^contact/$", "/contact"],
  ["^faqs/$", "/faqs"],
  ["^privacy-policy/$", "/privacy-policy"],
  ["^projects/$", "/projects"],
  ["^service-areas/five-forks/$", "/service-areas/five-forks"],
  ["^service-areas/fountain-inn/$", "/service-areas/fountain-inn"],
  ["^service-areas/gray-court/$", "/service-areas/gray-court"],
  ["^service-areas/greenville/$", "/service-areas/greenville"],
  ["^service-areas/laurens/$", "/service-areas/laurens"],
  ["^service-areas/mauldin/$", "/service-areas/mauldin"],
  ["^service-areas/simpsonville/$", "/service-areas/simpsonville"],
  ["^service-areas/woodruff/$", "/service-areas/woodruff"],
  ["^services/$", "/services"],
  ["^terms-of-service/$", "/terms-of-service"],

  // --- 2026-07 rebuild URLs -> restored URLs ------------------------------
  ["^calculator/whole-home-remodel\\.html$", "/calculator/whole-home-remodel"],
  ["^calculator/basement-finishing\\.html$", "/calculator/basement-finishing"],
  ["^outdoor-living/screened-porches/$", "/outdoor-living/screened-porches"],
  ["^calculator/kitchen-remodel\\.html$", "/calculator/kitchen-remodel"],
  ["^calculator/ada-bath-shower\\.html$", "/calculator/ada-bath-shower"],
  ["^service-areas/simpsonville\\.html$", "/service-areas/simpsonville"],
  ["^service-areas/fountain-inn\\.html$", "/service-areas/fountain-inn"],
  ["^outdoor-living/covered-patios/$", "/outdoor-living/covered-patios"],
  ["^calculator/covered-patios\\.html$", "/calculator/covered-patios"],
  ["^service-areas/greenville\\.html$", "/service-areas/greenville"],
  ["^service-areas/five-forks\\.html$", "/service-areas/five-forks"],
  ["^service-areas/gray-court\\.html$", "/service-areas/gray-court"],
  ["^calculator/bath-remodel\\.html$", "/calculator/bath-remodel"],
  ["^service-areas/woodruff\\.html$", "/service-areas/woodruff"],
  ["^service-areas/mauldin\\.html$", "/service-areas/mauldin"],
  ["^service-areas/laurens\\.html$", "/service-areas/laurens"],
  ["^calculator/additions\\.html$", "/calculator/additions"],
  ["^calculator/estimate\\.html$", "/calculator/estimate"],
  ["^calculator/garages\\.html$", "/calculator/garages"],
  ["^insurance-restoration/$", "/insurance-restoration"],
  ["^terms-of-service\\.html$", "/terms-of-service"],
  ["^outdoor-living/decks/$", "/outdoor-living/decks"],
  ["^calculator/decks\\.html$", "/calculator/decks"],
  ["^calculator/porch\\.html$", "/calculator/porch"],
  ["^bathroom-remodeling/$", "/bathroom-remodeling"],
  ["^privacy-policy\\.html$", "/privacy-policy"],
  ["^kitchen-remodeling/$", "/kitchen-remodeling"],
  ["^basement-finishing/$", "/basement-finishing"],
  ["^commercial-roofing/$", "/commercial-roofing"],
  ["^ada-bath-to-shower/$", "/ada-bath-to-shower"],
  ["^commercial-upfits/$", "/commercial-upfits"],
  ["^ada-compliance/$", "/ada-compliance"],
  ["^services\\.html$", "/services"],
  ["^projects\\.html$", "/projects"],
  ["^contact\\.html$", "/contact"],
  ["^adu-builder/$", "/adu-builder"],
  ["^remodeling/$", "/remodeling"],
  ["^about\\.html$", "/about"],
  ["^additions/$", "/room-additions"],
  ["^faqs\\.html$", "/faqs"],
  ["^additions$", "/room-additions"],
  ["^handyman/$", "/handyman"],
  ["^garages/$", "/garage-builder"],
  ["^garages$", "/garage-builder"],

  // removed (now served directly at /contact): RewriteRule ^contact/?$ /contact.html [R=301,L] removed (now served directly at /about): RewriteRule ^about/?$ /about.html [R=301,L] removed (now served directly at /projects): RewriteRule ^projects/?$ /projects.html [R=301,L] removed (now served directly at /services): RewriteRule ^services/?$ /services.html [R=301,L] Fragment redirect (NE keeps "#" from being percent-encoded to %23).
  ["^areas/?$", "/#service-areas"],
  ["^service-areas/?$", "/#service-areas"],
  ["^calculator/decks-screened-porches/?$", "/calculator/porch"],

  // BROADENED from a 5-service alternation to a wildcard: the GSC export showed real city-sc/kitchen-remodeling and city-sc/bathroom-remodeling URLs (e.g. gray-court-sc/kitchen-remodeling, 1 real click) that a fixed (deck-builder|garage-builder|room-additions|screened-porches|adu-builder) alternation would have missed entirely -> 404, since these 6 known-city rules had no fallback beneath them (unlike clinton/ora/joanna below, which already used a wildcard). Matching that same wildcard approach here for consistency and to cover any other legacy service slug not seen in this sample.
  ["^simpsonville-sc/([a-z-]+)/?$", "/service-areas/simpsonville"],
  ["^fountain-inn-sc/([a-z-]+)/?$", "/service-areas/fountain-inn"],
  ["^mauldin-sc/([a-z-]+)/?$", "/service-areas/mauldin"],
  ["^gray-court-sc/([a-z-]+)/?$", "/service-areas/gray-court"],
  ["^laurens-sc/([a-z-]+)/?$", "/service-areas/laurens"],
  ["^woodruff-sc/([a-z-]+)/?$", "/service-areas/woodruff"],

  // Cities with NO page on the new site. All three are Laurens County; nearest existing coverage is the Laurens page. RESOLVED via GSC (see cross-check block below): 0 real clicks across all three cities — redirect, not dedicated pages, is the safe call.
  ["^clinton-sc/([a-z-]+)/?$", "/service-areas/laurens"],
  ["^ora-sc/([a-z-]+)/?$", "/service-areas/laurens"],
  ["^joanna-sc/([a-z-]+)/?$", "/service-areas/laurens"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/simpsonville/?$", "/service-areas/simpsonville"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/fountain-inn/?$", "/service-areas/fountain-inn"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/mauldin/?$", "/service-areas/mauldin"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/gray-court/?$", "/service-areas/gray-court"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/laurens/?$", "/service-areas/laurens"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/woodruff/?$", "/service-areas/woodruff"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/greenville/?$", "/service-areas/greenville"],
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/five-forks/?$", "/service-areas/five-forks"],

  // greer already redirects to greenville elsewhere in this file — stay consistent.
  ["^(deck-builder|garage-builder|room-additions|screened-porches|adu-builder)/greer/?$", "/service-areas/greenville"],

  // travelers-rest, duncan, taylors: no page anywhere. Fall through to the service page rather than a city page — preserves service intent, loses geo intent.
  ["^deck-builder/[a-z-]+/?$", "/outdoor-living/decks"],
  ["^screened-porches/[a-z-]+/?$", "/outdoor-living/screened-porches"],
  ["^garage-builder/[a-z-]+/?$", "/garage-builder"],
  ["^room-additions/[a-z-]+/?$", "/room-additions"],
  ["^adu-builder/[a-z-]+/?$", "/adu-builder"],
  ["^locations/deck-builder-[a-z-]+-sc/?$", "/outdoor-living/decks"],

  // FIXED: the real legacy slug is "screened-porch-builder-{city}-sc" (confirmed via GSC — e.g. /locations/screened-porch-builder-greenville-sc, 71 impressions), not "screened-porches-{city}-sc" as originally drafted. The original pattern wouldn't 404 (the generic /locations/[a-z-]+ catch-all below still catches it) but would send real traffic to the homepage anchor instead of the actually-relevant screened-porches page.
  ["^locations/screened-porch-builder-[a-z-]+-sc/?$", "/outdoor-living/screened-porches"],
  ["^locations/garage-builder-[a-z-]+-sc/?$", "/garage-builder"],
  ["^locations/room-additions-[a-z-]+-sc/?$", "/room-additions"],
  ["^locations/adu-builder-[a-z-]+-sc/?$", "/adu-builder"],
  ["^locations/kitchen-remodeling-[a-z-]+-sc/?$", "/kitchen-remodeling"],
  ["^locations/bathroom-remodeling-[a-z-]+-sc/?$", "/calculator/bath-remodel"],
  ["^locations/basement-finishing-[a-z-]+-sc/?$", "/basement-finishing"],

  // The /locations index itself, and any unmatched child (safety net — this already prevents the above gaps from 404ing, just with less topical relevance than a specific rule).
  ["^locations/?$", "/#service-areas"],
  ["^locations/[a-z-]+/?$", "/#service-areas"],
  ["^deck-builder/?$", "/outdoor-living/decks"],
  ["^screened-porches/?$", "/outdoor-living/screened-porches"],
  ["^services/additions/?$", "/room-additions"],
  ["^services/decks/?$", "/outdoor-living/decks"],
  ["^services/screened-porches/?$", "/outdoor-living/screened-porches"],
  ["^services/garages/?$", "/garage-builder"],
  ["^services/remodeling/?$", "/remodeling"],
  ["^services/[a-z-]+/?$", "/services"],
  ["^calculator/room-additions/?$", "/calculator/additions"],

  // Confirmed against the 2026-07-11 GSC Performance export (Pages.csv) — these legacy calculator slugs have real clicks/impressions and an exact-matching new-site calculator, so they get a hand-checked target instead of falling through to the generic estimate calculator below.
  ["^calculator/screened-porches/?$", "/calculator/porch"],
  ["^calculator/bathroom-remodeling/?$", "/calculator/bath-remodel"],
  ["^calculator/kitchen-remodeling/?$", "/calculator/kitchen-remodel"],
  ["^calculator/remodeling/?$", "/calculator/whole-home-remodel"],

  // DEVIATION FROM INSTRUCTION, FLAGGING: was told to delete this rule outright ("the page is now real, same path"), but the legacy URL is extensionless (/calculator/basement-finishing) while the new page — like every other calculator on this site — is served at .../basement-finishing.html. Those are NOT the same path; deleting the rule would 404 a URL with 1178 impressions, the 3rd-highest of any calculator. Repointed instead of deleted, matching how every other calculator/* legacy slug on this site redirects extensionless -> .html. If a bare (no .html) URL was actually intended for this one specifically, say so and I'll change it. removed (now served directly at /calculator/basement-finishing): RewriteRule ^calculator/basement-finishing/?$ /calculator/basement-finishing.html [R=301,L] Handyman now has a real service page on the new site (added 2026-07-11, built from the old Next.js site's real handyman calculator pricing data) — was falling into the generic estimator (61 impressions).
  ["^calculator/handyman/?$", "/handyman"],

  // Bare "/calculators" (plural) — distinct legacy URL, 1 click / 64 impressions.
  ["^calculators/?$", "/calculator/estimate"],

  // Different legacy naming convention entirely (underscore, trailing slash, no /calculator/ prefix) — 1 click / 137 impressions, no exact new-site match.
  ["^remodeling_cost_calculator/?$", "/calculator/whole-home-remodel"],

  // Remaining legacy calculator slugs with no exact new-site equivalent (adus, commercial-renovations, handyman) fall through to the all-purpose estimator below rather than a mismatched specific page.
  ["^calculator/?$", "/calculator/estimate"],

  // Only for legacy calculator slugs with no page of their own (adus, commercial-renovations, ...). Without this condition the rule also matches real pages like /calculator/garages, which are served extensionless now.
  ["^calculator/([a-z-]+)/?$", "/calculator/estimate"],
  ["^cost/home-addition-cost-[a-z-]+-sc/?$", "/calculator/additions"],
  ["^cost/room-addition-cost-[a-z-]+-sc/?$", "/calculator/additions"],
  ["^cost/screened-porch-vs-sunroom-sc/?$", "/calculator/porch"],
  ["^cost/garage-construction-cost-[a-z-]+-sc/?$", "/calculator/garages"],
  ["^cost/cost-to-build-a-deck-[a-z-]+-sc/?$", "/calculator/decks"],
  ["^cost/kitchen-remodel-cost-[a-z-]+-sc/?$", "/kitchen-remodeling"],
  ["^cost/bathroom-remodel-cost-[a-z-]+-sc/?$", "/calculator/bath-remodel"],

  // RESOLVED 2026-07-12: repointed from the service page to the new real basement-finishing calculator now that one exists.
  ["^cost/basement-finishing-cost-[a-z-]+-sc/?$", "/calculator/basement-finishing"],

  // Any other /cost/{slug} not matched above falls through to the all-purpose estimator rather than a 404 — verify against a fuller GSC export if one with more rows becomes available (this pass covered the top ~200 pages).
  ["^cost/[a-z0-9-]+/?$", "/calculator/estimate"],
  ["^bath_remodeling/?$", "/calculator/bath-remodel"],

  // REMOVED 2026-08-29: /kitchen-remodeling/ is now a real generated page
  ["^kitchen_remodeling/?$", "/kitchen-remodeling"],
  ["^basement_remodeling/?$", "/basement-finishing"],
  ["^room_additions/?$", "/room-additions"],
  ["^commercial-renovations/?$", "/commercial-upfits"],
  ["^commercial_remodeling_company/?$", "/commercial-upfits"],
  ["^screened_patios/?$", "/outdoor-living/screened-porches"],

  // RESOLVED 2026-07-11 (owner decision): handyman is now a real lower-tier service on the new site (see /handyman); these two legacy URLs (0 clicks, 13+6 impressions) now have a real target instead of being left open.
  ["^handyman-services-estimator/?$", "/handyman"],
  ["^handyman-services-near-you/?$", "/handyman"],

  // UPDATED 2026-07-23: commercial roofing is now a real service on the new site (see /commercial-roofing) — superseding the 2026-07-11 decision that sent these to the services listing.
  ["^commercial-roofing_company/?$", "/commercial-roofing"],
  ["^roofing/?$", "/commercial-roofing"],
  ["^commercial-roof-repair/?$", "/commercial-roofing"],
  ["^flat-roof(ing)?/?$", "/commercial-roofing"],

  // RESOLVED 2026-07-11 (owner decision): no admin/employee/subcontractor application features on the new site yet. /admin is intentionally left unmapped (almost certainly an accidentally-indexed CMS backend URL, not real content — correct to leave 404ing). Employment/subcontractor pages get a same-intent fallback to contact rather than 404ing outright.
  ["^employment/direct-hire/?$", "/contact"],
  ["^employment/?$", "/contact"],
  ["^subcontractors/join/?$", "/contact"],

  // CONFIRMED via the old Next.js site's own CLAUDE.md ("/work redirects here 301" under "Canonical Routes") — /work was already a portfolio alias for /projects there, not a careers page. Same mapping here.
  ["^work/?$", "/projects"],

  // RESOLVED 2026-07-12: the real /clients/ page is planned for later but not built yet, and this URL has 3 real clicks — a bookmarked customer would 404 on cutover otherwise. Remove this rule once the real page ships.
  ["^clients/?$", "/contact"],

  // Unambiguous single-page matches, all 0 clicks / low impressions:
  ["^pricing/?$", "/services"],
  ["^request_a_free_estimate/?$", "/contact"],
  ["^commercial-services/?$", "/commercial-upfits"],
  ["^home-renovations/?$", "/remodeling"],

  // No single "outdoor living" hub page exists on the new site (only the three child pages) — services.html covers the same ground at the top level.
  ["^outdoor-living/?$", "/services"],

  // Ten individual /projects/{case-study-slug} pages, 0 clicks each but ~205 impressions combined — consolidated to the projects listing rather than 404ing. Same fallback pattern as /cost/* and /calculator/* above: safe default, not a hand-picked target (there's no per-project equivalent on the new site to pick).
  ["^projects/[a-z0-9-]+/?$", "/projects"],

  // --- Family 7: orphans -------------------------------------------------------- /portal — customer portal. RESOLVED 2026-07-11 (owner decision): no customer portal on the new site yet — redirect to contact stands.
  ["^portal/?$", "/contact"],

  // Renamed service area (must come before the generic rule below).
  ["^service-areas/greer/?$", "/service-areas/greenville"],

  // FOUND VIA GSC: legacy "-sc"-suffixed city slugs under /service-areas/ (e.g. /service-areas/simpsonville-sc, 32 impressions; also fountain-inn-sc, mauldin-sc, woodruff-sc). Without this rule they'd fall into the generic rule below and 301 to a file that doesn't exist (service-areas/ simpsonville-sc.html is not a real page — the real one is simpsonville.html) i.e. a redirect straight into a 404. Must come before the generic rule.
  ["^service-areas/([a-z-]+)-sc/?$", "/service-areas/$1"],

  // removed (now served directly at /privacy-policy): RewriteRule ^privacy-policy/?$ /privacy-policy.html [R=301,L] removed (now served directly at /terms-of-service): RewriteRule ^terms-of-service/?$ /terms-of-service.html [R=301,L]
  ["^editorial-policy/?$", "/about"],
]

/** Compiled once. The patterns are literals above, so this cannot throw at runtime. */
const COMPILED = LEGACY_REDIRECTS.map(([pattern, target]) => ({ regex: new RegExp(pattern), target }))

/**
 * { status, location } for the first matching rule, or null.
 *
 * Every rule is a 301; there is no second status to carry, and a rule that
 * needs one should be added as data rather than special-cased here.
 */
export function findLegacyRedirect(pathname, search = '') {
  let path = pathname
  try {
    path = decodeURIComponent(pathname)
  } catch {
    // Malformed escape sequence — match against the raw path instead.
  }
  const subject = path.replace(/^\//, '')

  for (const rule of COMPILED) {
    const match = rule.regex.exec(subject)
    if (!match) continue
    let location = rule.target.replace(/\$(\d)/g, (_, n) => match[Number(n)] ?? '')
    if (search && !location.includes('?')) location += search
    return { status: 301, location }
  }
  return null
}
