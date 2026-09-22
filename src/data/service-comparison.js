/**
 * The two editorial columns of the "Compare All Services" table on /services.
 *
 * Data, not build logic, which is why they live here rather than in
 * src/build/trust-layer.mjs where they were written: scripts/check-build.mjs
 * asserts their coverage, and a gate reaching into a build module to do that
 * had the dependency pointing the wrong way.
 */

// "Choose this if" one-liners: editorial framing, not factual claims beyond
// what each service's own intro/description (services.js) already says —
// no new capability or number asserted here.
//
// KEYED BY SLUG, and check-build now asserts an entry for every slug. Two of
// these were keyed by service.id ('garages', 'additions') while the lookup used
// s.slug, so they matched nothing and /services shipped a row reading
// "Choose this if" followed by nothing — for copy that had already been written
// and reviewed. docs/archive/FINDINGS.md #2 recorded this gap for bathroom- and
// kitchen-remodeling, which genuinely had no entry, and missed these two:
// in the rendered output a dead key and a missing key look identical.
export const CHOOSE_IF = {
  'outdoor-living/decks': 'you want outdoor entertaining space and can choose your budget tier (PT lumber to premium composite).',
  'outdoor-living/screened-porches': 'you want bug-free outdoor living, from a basic screened enclosure to a climate-controlled room.',
  'outdoor-living/covered-patios': 'you want an open-air, roofed outdoor space rather than a fully screened-in one.',
  'garage-builder': 'you need vehicle storage, workshop space, or a garage apartment for rental/guest use.',
  'room-additions': 'you need more square footage — a bedroom, suite, or multi-generational space — without moving.',
  'adu-builder': 'you want a separate income-producing or in-law living space on your existing lot.',
  remodeling: 'your kitchen, bath, basement, or whole home needs updating rather than expanding.',
  // The two FINDINGS.md #2 flagged as blank. Both derived from these services'
  // own description and intro in services.js — the same rule as every line
  // above, no new capability or number.
  //
  // TODO(phase-6): revisit as lead offers. Phase 6 makes bathroom and kitchen
  // remodeling the lead services, at which point these stop being one row in a
  // comparison table and start carrying real weight. They were written to fill
  // a blank cell honestly, not to sell.
  'bathroom-remodeling': 'you want one bathroom done properly — design, plumbing, waterproofing, tile and finish work — rather than a whole-home project.',
  'kitchen-remodeling': 'you want cabinetry, countertops, backsplash and lighting replaced in the kitchen rather than throughout the house.',
  'commercial-upfits': 'you are building out a leased commercial space for your business.',
  'commercial-roofing': 'you need commercial roof installation, repair, or a maintenance/inspection agreement.',
  'basement-finishing': 'you have unfinished basement square footage you want converted to living space.',
  'insurance-restoration': 'you have storm or water damage and need documentation plus repairs.',
  'ada-compliance': 'you need ramps, doorway widening, or other ADA modifications for a home or business.',
  'ada-bath-to-shower': 'you specifically need a tub converted to a curbless, accessible roll-in shower.',
  handyman: 'you need one or a few small tasks done, not a full construction project.',
}

// Permit-required column: "Yes" only where a SERVICE_FAQS or GLOBAL_FAQS answer
// on the site already says so explicitly (see service-faqs.js). Everything else
// is an honest "Case-by-case" rather than a guessed yes/no, per the ground rule
// against inventing facts.
//
// EVERY SLUG IS LISTED, and check-build now asserts that. This was six entries
// and a `?? 'Case-by-case'` fallback, so ten services rendered a default nobody
// had decided — indistinguishable, in the output, from a service someone had
// looked at and judged case-by-case. The same two dead id-keys were here too,
// so garages and room additions rendered "Case-by-case" while this map said
// "Yes"; writing every value out is what makes those two disagree visibly
// instead of silently. The fallback is gone.
export const PERMIT_REQUIRED = {
  'outdoor-living/decks': 'Yes',
  'outdoor-living/screened-porches': 'Case-by-case',
  'outdoor-living/covered-patios': 'Case-by-case',
  'garage-builder': 'Yes',
  'room-additions': 'Yes',
  'adu-builder': 'Depends on zoning',
  remodeling: 'Case-by-case',
  'bathroom-remodeling': 'Case-by-case',
  'kitchen-remodeling': 'Case-by-case',
  'commercial-upfits': 'Yes',
  'commercial-roofing': 'Case-by-case',
  'basement-finishing': 'Case-by-case',
  'insurance-restoration': 'Case-by-case',
  'ada-compliance': 'Case-by-case',
  'ada-bath-to-shower': 'Case-by-case',
  handyman: 'Case-by-case',
}
