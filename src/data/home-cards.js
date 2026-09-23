/**
 * The homepage service grid, one card per service, keyed by service id.
 *
 * Phase 6.1b. This file says what each card shows; it does NOT say what order
 * they appear in. Order comes from servicesByTier() in services.js, the same
 * sort the nav and footer use, so the homepage cannot lead with decks again
 * while the rest of the site leads with bathrooms. Before this the grid was
 * thirteen hand-written <article>s in an order nobody chose, with no card at
 * all for bathroom or kitchen remodeling — the two lead offers.
 *
 * A service with no entry here gets no card (handyman, today). That is a
 * choice made here, not an omission the renderer papers over; a key here that
 * matches no service is a build failure.
 *
 * Plain text, not HTML: the renderer escapes on the way out.
 *
 * Blurbs are the owner's words or copy that was already on the page. Where the
 * owner has not supplied one, the entry carries TODO(owner) — check-build's
 * check 10 fails the build if that reaches a reader, which is the point: a
 * lead-offer card must not ship with invented copy.
 */
export const HOME_SERVICE_CARDS = {
  'bathroom-remodeling': {
    heading: 'Bathroom Remodeling',
    image: '/images/bath-shower-conversion-woodruff-sc-1.webp',
    alt: 'Tub-to-shower conversion bathroom remodel with custom tile surround in Woodruff South Carolina',
    blurb: 'Update your old bathroom with all-new finishes and fixtures for a clean, updated look.',
  },
  'kitchen-remodeling': {
    heading: 'Kitchen Remodeling',
    image: '/images/kitchen-remodeling-sc.webp',
    alt: 'Complete kitchen remodel with custom cabinets granite countertops and new appliances in Upstate South Carolina',
    blurb: 'Tired of that old kitchen? Let our highly experienced crews update it to the fresh new look you have been dreaming of.',
  },
  'ada-bath-to-shower': {
    heading: 'ADA Bath to Shower Conversions',
    image: '/images/ada-bath-to-shower/ada-bath-to-shower-conversion-simpsonville.webp',
    alt: 'Accessible zero-entry roll-in shower conversion with grab bars in Simpsonville South Carolina',
    blurb: 'We professionally convert existing bathtubs into accessible, low to zero-entry roll-in showers with ADA-compliant grab bars and non-slip surfaces.',
  },
  remodeling: {
    heading: 'Home Remodeling',
    image: '/images/newly-remodeled-whole-home-interior.webp',
    alt: 'Remodeled open-plan living and dining area with wide-plank wood floors, opening into a kitchen with white shaker cabinets and stainless appliances',
    blurb: 'We provide turnkey remodeling and renovation services to your home using our professional crews.',
  },
  additions: {
    heading: 'Home Additions',
    image: '/images/room-addition-fountain-inn-sc.webp',
    alt: 'Custom home addition construction with matching siding and roofing in Fountain Inn SC',
    blurb: 'Room additions and expansions that add valuable square footage to your home.',
  },
  'basement-finishing': {
    heading: 'Basement Finishing',
    image: '/images/finished-basement.webp',
    alt: 'Finished basement renovation with living space in Upstate South Carolina',
    blurb: 'Egress windows, moisture control, and complete interior build-out to turn your basement into living space.',
  },
  decks: {
    heading: 'Decks',
    image: '/images/custom-deck-greenville-sc.webp',
    alt: 'Custom multi-level composite deck construction with outdoor bar and built-in seating in Greenville SC by Burch Contracting',
    blurb: 'Custom wood and composite decks for outdoor living and entertaining.',
  },
  'screened-porches': {
    heading: 'Screened Porches',
    image: '/images/2024-05-24.webp',
    alt: 'Aluminum screened porch enclosure with outdoor living furniture built in Upstate South Carolina',
    blurb: 'Bug-free outdoor comfort with aluminum screened porch construction.',
  },
  'covered-patios': {
    heading: 'Covered Patios',
    image: '/images/aluminum-screened-patio-enclosure.webp',
    alt: 'Covered patio construction with ceiling fan and outdoor living space in Upstate South Carolina',
    blurb: 'Custom covered patios that extend your outdoor living space with protection from sun and rain.',
  },
  garages: {
    heading: 'Garages',
    image: '/images/2-car-garage.webp',
    alt: 'Detached two-car garage construction with overhead doors in Simpsonville South Carolina',
    blurb: 'Attached and detached garage construction for vehicle protection and storage.',
  },
  'adu-builder': {
    heading: 'ADU Builder',
    image: '/images/adu-cottage-addition.webp',
    alt: 'Accessory dwelling unit garage apartment construction with rental income potential in Upstate South Carolina',
    blurb: 'Garage apartments and backyard cottages for rental income or multi-generational living.',
  },
  'commercial-upfits': {
    heading: 'Commercial Upfits',
    image: '/images/commercial-office-renovations.webp',
    alt: 'Commercial office renovation and tenant upfit with new flooring and lighting in Upstate South Carolina',
    blurb: 'Tenant upfits and buildouts for Upstate SC business spaces.',
  },
  'commercial-roofing': {
    heading: 'Commercial Roofing',
    image: '/images/commercial-tpo-roof.webp',
    alt: 'White TPO commercial roof membrane on a flat roof building in Upstate South Carolina',
    blurb: 'Flat and metal roof installation, repair, and maintenance — plus everything under it, in one contract.',
  },
  'insurance-restoration': {
    heading: 'Insurance Restoration & Repair Services',
    image: '/images/finished-basement.webp',
    alt: 'Finished basement living space in Upstate South Carolina',
    blurb: 'Storm damage, water damage, and insurance claim repairs. Free consultation and ballpark range to start, full restoration services from there.',
  },
  'ada-compliance': {
    heading: 'ADA Compliance & Accessibility',
    image: '/images/ada-compliance-residential.webp',
    alt: 'Accessible bathroom conversion with grab bars and roll-in shower in Upstate South Carolina',
    blurb: 'Ramps, bathrooms, doorways, and other accessibility improvements for commercial and residential properties to meet current ADA standards.',
  },
}
