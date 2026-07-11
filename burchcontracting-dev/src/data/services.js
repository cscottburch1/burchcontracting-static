/**
 * Service Pages Data
 * Central data source for all dedicated service pages
 * Powers scripts/generate-services.mjs
 *
 * PRICING SOURCE OF TRUTH: src/js/calculator-config.js is the single
 * authoritative pricing engine for this site (see PRICING.md). Every
 * dollar figure below for decks, screened-porches, garages, additions,
 * and remodeling (bath/kitchen/whole-home) is computed from that config
 * via src/data/pricing-sync.js — none of it is hand-typed, so it can't
 * drift out of sync again. Reconciled 2026-07-05.
 *
 * covered-patios, adu-builder, commercial-upfits, and basement-finishing
 * have no equivalent service in calculator-config.js (no calculator exists
 * for them), so their figures remain hand-authored and are out of scope
 * for this reconciliation.
 */
import {
  projectCostString,
  projectEstimate,
  combinedCostString,
  tierPerSqftBand,
  tierPerSqftString,
  servicePerSqftBand,
} from './pricing-sync.js'

/** Formats a {min,max} band as "$X-Y{suffix}". */
function formatBand(band, suffix = '/sq ft') {
  return `$${Math.round(band.min)}-${Math.round(band.max)}${suffix}`
}

/** Combines two tier bands (e.g. a service's cheapest to priciest named tier) into one "$X-Y{suffix}" string. */
function spanPerSqft(lowBand, highBand, suffix = '/sq ft') {
  return formatBand({ min: lowBand.min, max: highBand.max }, suffix)
}

export const SITE = {
  name: 'Burch Contracting',
  phone: '(864) 724-4600',
  phoneLink: '8647244600',
  email: 'estimates@burchcontracting.com',
  address: '1095 Water Tank Rd',
  city: 'Gray Court',
  state: 'SC',
  zip: '29645',
  license: 'CLG118679',
  owner: 'C. Scott Burch',
  established: '1995',
  experience: '35+',
  rating: '5.0',
  bbb: 'A+',
  url: 'https://burchcontracting.com',
  domain: 'burchcontracting.com'
};

export const SERVICES = [
  {
    id: 'decks',
    title: 'Custom Deck Builder',
    slug: 'outdoor-living/decks',
    category: 'Outdoor Living',
    description: 'Professional deck construction with pressure-treated and composite materials. Licensed contractor serving Upstate SC since 1995.',
    h1: 'Custom Deck Builder - Upstate SC',
    intro: "From pressure-treated pine to premium composite materials, I handle every aspect of custom deck construction: design, permits, footings, framing, and finishing. Every deck engineered for Upstate SC weather and built to last decades.",
    stats: {
      costRange: formatBand(servicePerSqftBand('decks'), ' Per Sq Ft'),
      timeline: '2-4 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: formatBand(servicePerSqftBand('decks')),
    timeline: '2-4 weeks',
    commonProjects: [
      {
        name: 'Basic Pressure-Treated 12×16',
        size: '192 sq ft',
        cost: projectCostString('decks', 'pressureTreated', 192),
        details: 'Southern yellow pine, ground-level, basic railings'
      },
      {
        name: 'Mid-Range Composite 16×20',
        size: '320 sq ft',
        cost: projectCostString('decks', 'compositeLowMaintenance', 320),
        details: 'Trex or TimberTech, elevated, composite railings'
      },
      {
        name: 'Premium Two-Tier Deck',
        size: '500+ sq ft',
        cost: projectCostString('decks', 'premiumComposite', 500),
        details: 'Multi-level, built-in seating, lighting, pergola'
      }
    ],
    pricingTiers: [
      {
        name: 'Pressure-Treated Pine',
        range: tierPerSqftString('decks', 'pressureTreated'),
        description: 'Southern yellow pine with standard railings and ground-level or single-story elevated design. Most economical option, requires annual maintenance.'
      },
      {
        name: 'Composite Decking',
        range: tierPerSqftString('decks', 'compositeLowMaintenance'),
        description: 'Trex, TimberTech, or Azek composite materials with matching railings. Low maintenance, 25-year warranties, premium appearance.'
      },
      {
        name: 'Multi-Level Premium',
        range: tierPerSqftString('decks', 'premiumComposite'),
        description: 'Two-tier designs with built-in seating, planters, lighting, pergolas, or screened sections. Custom features and premium materials.'
      }
    ],
    calculator: 'decks',
    relatedServices: [
      { name: 'Screened Porch Additions', url: '/outdoor-living/screened-porches' },
      { name: 'Covered Patios', url: '/outdoor-living/covered-patios' },
      { name: 'Room Additions', url: '/additions' }
    ]
  },
  {
    id: 'screened-porches',
    title: 'Screened Porch Builder',
    slug: 'outdoor-living/screened-porches',
    category: 'Outdoor Living',
    description: 'Custom screened porches and three-season rooms. Licensed contractor serving Upstate SC since 1995.',
    h1: 'Screened Porch Builder - Upstate SC',
    intro: "From simple porch conversions to luxury three-season rooms with HVAC, I handle all aspects: foundation work, framing, screening systems, electrical, and interior finishing. Every porch designed for year-round comfort in Upstate SC's climate.",
    stats: {
      costRange: '$15,000-$65,000 Range',
      timeline: '3-6 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: spanPerSqft(
      tierPerSqftBand('screenedPorches', 'newScreenedPorch'),
      tierPerSqftBand('screenedPorches', 'upgradedOutdoorRoom', { material: 'premium', complexity: 'complex' })
    ),
    timeline: '3-6 weeks',
    commonProjects: [
      {
        name: 'Basic 12×16 Screened Porch',
        size: '192 sq ft',
        cost: projectCostString('screenedPorches', 'newScreenedPorch', 192),
        details: 'Concrete pad, PT framing, fiberglass screens, ceiling fan, basic electrical'
      },
      {
        name: 'Mid-Range 16×20 Three-Season',
        size: '320 sq ft',
        cost: projectCostString('screenedPorches', 'newScreenedPorch', 320, { material: 'upgraded' }),
        details: 'Elevated deck base, composite flooring, EZE-Breeze windows, upgraded lighting'
      },
      {
        name: 'Premium HVAC Sunroom',
        size: '300+ sq ft',
        cost: projectCostString('screenedPorches', 'upgradedOutdoorRoom', 300, { material: 'premium', complexity: 'complex' }),
        details: 'Insulated construction, HVAC extension, premium windows, tile flooring'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Screened Porch',
        range: tierPerSqftString('screenedPorches', 'newScreenedPorch'),
        description: 'Ground-level concrete pad or existing deck conversion. PT framing, fiberglass screening, basic electrical with ceiling fan and outlets. Simple and functional.'
      },
      {
        name: 'Mid-Range Three-Season',
        range: tierPerSqftString('screenedPorches', 'newScreenedPorch', { material: 'upgraded' }),
        description: 'EZE-Breeze vinyl window system for adjustable ventilation. Composite or tongue-and-groove ceiling, upgraded lighting, decorative posts. More finished appearance.'
      },
      {
        name: 'Premium Climate-Controlled',
        range: tierPerSqftString('screenedPorches', 'upgradedOutdoorRoom', { material: 'premium', complexity: 'complex' }),
        description: 'Insulated walls and roof, HVAC extension for year-round use. Premium vinyl windows, tile or hardwood flooring, coffered ceilings, built-in features.'
      }
    ],
    calculator: 'porch',
    relatedServices: [
      { name: 'Custom Deck Building', url: '/outdoor-living/decks' },
      { name: 'Covered Patios', url: '/outdoor-living/covered-patios' },
      { name: 'Room Additions', url: '/additions' }
    ]
  },
  {
    id: 'covered-patios',
    title: 'Covered Patio Builder',
    slug: 'outdoor-living/covered-patios',
    category: 'Outdoor Living',
    description: 'Custom covered patios and outdoor living spaces. Professional construction serving Upstate SC since 1995.',
    h1: 'Covered Patio Builder - Upstate SC',
    intro: "I build custom covered patios that extend your outdoor living space with protection from sun and rain. From simple roof extensions to fully-featured outdoor kitchens with lighting and ceiling fans, every patio is designed to complement your home's architecture and maximize your outdoor enjoyment.",
    stats: {
      costRange: '$15,000-$45,000 Range',
      timeline: '2-5 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: '$75-150/sq ft',
    timeline: '2-5 weeks',
    commonProjects: [
      {
        name: 'Basic 12×16 Covered Patio',
        size: '192 sq ft',
        cost: '$15,000–$22,000',
        details: 'Concrete slab, PT or aluminum posts, architectural shingles, basic electrical'
      },
      {
        name: 'Mid-Range 16×20 Patio',
        size: '320 sq ft',
        cost: '$25,000–$35,000',
        details: 'Decorative columns, ceiling fans, recessed lighting, matching roof line'
      },
      {
        name: 'Premium Outdoor Living Space',
        size: '400+ sq ft',
        cost: '$40,000–$55,000+',
        details: 'Outdoor kitchen, fireplace, custom lighting, premium materials'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Covered Patio',
        range: '$15,000-$22,000',
        description: 'Simple roof structure over existing concrete pad or new slab. PT or aluminum posts, architectural shingles, basic electrical for lights and fans.'
      },
      {
        name: 'Mid-Range Outdoor Room',
        range: '$25,000-$35,000',
        description: 'Decorative columns, tongue-and-groove ceiling, ceiling fans, recessed lighting, upgraded materials. Roof line matches home architecture.'
      },
      {
        name: 'Premium Outdoor Living',
        range: '$40,000-$55,000+',
        description: 'Complete outdoor living space with kitchen area, fireplace or fire pit, custom lighting, premium materials, integrated landscaping features.'
      }
    ],
    calculator: null,
    relatedServices: [
      { name: 'Custom Deck Building', url: '/outdoor-living/decks' },
      { name: 'Screened Porches', url: '/outdoor-living/screened-porches' },
      { name: 'Room Additions', url: '/additions' }
    ]
  },
  {
    id: 'garages',
    title: 'Garage Builder',
    slug: 'garages',
    category: 'Construction',
    description: 'Custom garage construction: detached, attached, workshop, and garage apartments. Licensed contractor serving Upstate SC since 1995.',
    h1: 'Garage Builder - Upstate SC',
    intro: "From basic 2-car detached garages to luxury 3-car workshops with apartments above, I handle everything: site prep, foundation, framing, roofing, electrical, and finishing. Every garage engineered to match your home's architecture and meet your specific needs.",
    stats: {
      // Low end reconciled to calculator-config.js (attachedBasic @576sf). High end
      // ($145,000) is the apartment-above-garage tier below, which calculator-config.js
      // has no equivalent for (it prices the garage structure only, not living space) —
      // left as the original hand-authored figure.
      costRange: '$39,000-$145,000 Range',
      timeline: '6-10 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: 'Varies by type',
    timeline: '6-10 weeks',
    commonProjects: [
      {
        name: '2-Car Detached Garage',
        size: '24×24 (576 sq ft)',
        cost: projectCostString('garages', 'detachedStandard', 576),
        details: 'Concrete slab, vinyl siding, architectural shingles, two 9×7 doors, basic electrical'
      },
      {
        name: '3-Car Garage with Workshop',
        size: '30×30 (900 sq ft)',
        cost: projectCostString('garages', 'upgradedWorkshop', 900),
        details: 'Extended depth for storage, upgraded electrical (220V), workbench area, epoxy floor'
      },
      {
        name: 'Garage with Apartment Above',
        size: '24×30 + 720 sq ft living',
        cost: '$85,000–$145,000',
        details: 'Two-story construction, full apartment finish, separate HVAC, rental income potential'
      }
    ],
    pricingTiers: [
      {
        name: '2-Car Detached',
        range: projectCostString('garages', 'detachedStandard', 576),
        description: 'Standard 24×24 garage with 4" concrete slab, vinyl siding to match home, two 9×7 insulated garage doors, basic electrical. Most popular choice.'
      },
      {
        name: '3-Car or Workshop',
        range: projectCostString('garages', 'upgradedWorkshop', 900),
        description: '30×30 or larger, upgraded electrical (220V for tools/chargers), additional windows, workbench area, epoxy floor coating, storage loft option.'
      },
      {
        name: 'Garage with Apartment',
        range: '$85,000-$145,000',
        description: 'Two-story construction with 576-720 sq ft apartment above garage. Full living space with kitchenette, bath, bedroom. Generates $850-$1,200/month rental income.'
      }
    ],
    calculator: 'garages',
    rentalIncome: '$850-$1,200/month for garage apartment',
    relatedServices: [
      { name: 'ADU Construction', url: '/adu-builder' },
      { name: 'Room Additions', url: '/additions' },
      { name: 'Basement Finishing', url: '/basement-finishing' }
    ]
  },
  {
    id: 'additions',
    title: 'Room Additions',
    slug: 'additions',
    category: 'Construction',
    description: 'Custom room additions: bedrooms, master suites, sunrooms, in-law suites. Full design-build service from foundation to finish.',
    h1: 'Room Addition Contractor - Upstate SC',
    intro: "From single-story bedroom additions to two-story master suites, I handle all phases: design, foundation work, framing, roofing, HVAC integration, and complete interior finishing to seamlessly match your existing home's style and quality.",
    stats: {
      costRange: spanPerSqft(
        tierPerSqftBand('homeAdditions', 'basicFinish'),
        tierPerSqftBand('homeAdditions', 'premiumCustom'),
        ' Per Sq Ft'
      ),
      timeline: '8-16 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: spanPerSqft(
      tierPerSqftBand('homeAdditions', 'basicFinish'),
      tierPerSqftBand('homeAdditions', 'premiumCustom')
    ),
    timeline: '8-16 weeks',
    commonProjects: [
      {
        name: 'Single Bedroom Addition',
        size: '16×20 (320 sq ft)',
        cost: projectCostString('homeAdditions', 'basicFinish', 320),
        details: 'Foundation to roof, HVAC extension, closet, matching exterior, basic finishes'
      },
      {
        name: 'Master Suite Addition',
        size: '16×24 with bath (384 sq ft)',
        cost: projectCostString('homeAdditions', 'premiumCustom', 384),
        details: 'Bedroom, walk-in closet, full master bath with tile shower, upgraded finishes'
      },
      {
        name: 'Two-Story Addition',
        size: '760 sq ft (380 per floor)',
        cost: projectCostString('homeAdditions', 'premiumCustom', 760, { complexity: 'complex' }),
        details: 'Bedroom suite over family room, complex framing, structural engineering'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Addition',
        range: tierPerSqftString('homeAdditions', 'basicFinish'),
        description: 'Single-story room with foundation, framing, roofing, basic electrical/plumbing, drywall, and standard finishes. HVAC extension included.'
      },
      {
        name: 'Mid-Range Addition',
        range: tierPerSqftString('homeAdditions', 'standardLivingSpace'),
        description: 'Upgraded materials, better windows, hardwood floors, tile bathrooms, crown molding, custom closet systems. More finished appearance.'
      },
      {
        name: 'Premium Addition',
        range: tierPerSqftString('homeAdditions', 'premiumCustom'),
        description: 'Two-story construction, luxury finishes, high-end fixtures, custom cabinetry, architectural details. Complex structural work and engineering.'
      }
    ],
    calculator: 'additions',
    relatedServices: [
      { name: 'Basement Finishing', url: '/basement-finishing' },
      { name: 'ADU Construction', url: '/adu-builder' },
      { name: 'Garage Builder', url: '/garages' }
    ]
  },
  {
    id: 'adu-builder',
    title: 'ADU Builder',
    slug: 'adu-builder',
    category: 'Construction',
    description: 'Accessory Dwelling Unit construction: garage apartments, backyard cottages, in-law suites. Rental income potential $850-$1,500/month.',
    h1: 'ADU Builder - Accessory Dwelling Units Upstate SC',
    intro: "From garage apartments to detached backyard cottages, I handle all aspects of ADU construction: zoning review, design, construction, and utilities. ADUs provide rental income ($850-$1,500/month) or flexible living space for family members.",
    stats: {
      costRange: '$65,000-$220,000 Range',
      timeline: '10-16 Weeks Typical',
      experience: '35+ Years Experience',
      rental: 'Income $850-$1,500/mo'
    },
    pricePerSqFt: '$110-185/sq ft',
    timeline: '10-16 weeks',
    rentalIncome: '$850-$1,500/month',
    commonProjects: [
      {
        name: 'Garage Apartment',
        size: '576 sq ft above 2-car garage',
        cost: '$65,000–$95,000',
        details: 'Studio or 1-bed layout, kitchenette, full bath, separate entrance, rental income $850-$1,200/mo'
      },
      {
        name: '1-Bedroom Detached Cottage',
        size: '600-800 sq ft',
        cost: '$125,000–$185,000',
        details: 'Full kitchen, bathroom, living area, separate utilities, full-time living capable'
      },
      {
        name: '2-Bedroom ADU',
        size: '900-1,200 sq ft',
        cost: '$175,000–$220,000',
        details: 'Full home features, 2 bed/1-2 bath, complete kitchen, laundry, rental income $1,200-$1,500/mo'
      }
    ],
    pricingTiers: [
      {
        name: 'Garage Apartment',
        range: '$65,000-$95,000',
        description: '576 sq ft above new or existing 2-car garage. Open studio or 1-bedroom layout, kitchenette, full bath, HVAC, separate entrance. Most economical ADU option.'
      },
      {
        name: 'Detached Cottage',
        range: '$125,000-$185,000',
        description: '600-800 sq ft detached structure. Complete kitchen, bathroom, bedroom, living area. Separate utilities, full code compliance. Perfect for in-law suite or long-term rental.'
      },
      {
        name: 'Premium 2-Bedroom',
        range: '$175,000-$220,000',
        description: '900-1,200 sq ft full-featured home. Two bedrooms, 1-2 bathrooms, complete kitchen, laundry room. Highest rental income potential at $1,200-$1,500/month.'
      }
    ],
    calculator: null,
    relatedServices: [
      { name: 'Garage Builder', url: '/garages' },
      { name: 'Room Additions', url: '/additions' },
      { name: 'Basement Finishing', url: '/basement-finishing' }
    ]
  },
  {
    id: 'remodeling',
    title: 'Home Remodeling',
    slug: 'remodeling',
    category: 'Remodeling',
    description: 'Complete home remodeling: kitchens, bathrooms, whole-house renovations. Professional design-build service.',
    h1: 'Home Remodeling Contractor - Upstate SC',
    intro: "From kitchen and bathroom renovations to whole-house remodels, I handle all phases: design, demolition, structural work, electrical, plumbing, and complete finishing. Every project managed personally from start to finish.",
    stats: {
      // Bath + kitchen scope only (see note on the Whole-House tier below for
      // why that one isn't rolled into this headline figure).
      costRange: '$5,600-$75,000 Typical',
      timeline: '2-8 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: 'Varies by scope',
    timeline: '2-8 weeks',
    commonProjects: [
      {
        name: 'Modest Bathroom Remodel',
        size: '5×8 full bath',
        cost: projectCostString('bathRemodel', 'basicRefresh', 40),
        details: 'New tub/shower, vanity, toilet, flooring, tile work, updated electrical and plumbing'
      },
      {
        name: 'Mid-Range Kitchen Remodel',
        size: '10×12 kitchen',
        cost: projectCostString('kitchenRemodel', 'midRangeRemodel', 120),
        details: 'New cabinets, countertops, appliances, flooring, lighting, backsplash, reconfigured layout'
      },
      {
        name: 'Luxury Master Bath',
        size: '8×12 or larger',
        cost: projectCostString('bathRemodel', 'fullGutRenovation', 96),
        details: 'Custom tile shower, soaking tub, double vanity, heated floors, premium fixtures'
      }
    ],
    pricingTiers: [
      {
        name: 'Bathroom Remodeling',
        range: combinedCostString(
          projectEstimate('bathRemodel', 'basicRefresh', 35),
          projectEstimate('bathRemodel', 'fullGutRenovation', 100)
        ),
        description: 'Full bathroom renovation including new fixtures, tile, vanity, flooring, and updated plumbing/electrical. Modest remodel $6-8K, luxury master bath $60-72K.'
      },
      {
        name: 'Kitchen Remodeling',
        range: combinedCostString(
          projectEstimate('kitchenRemodel', 'standardRefresh', 200),
          projectEstimate('kitchenRemodel', 'premiumCustom', 200)
        ),
        description: 'Complete kitchen renovation with new cabinets, countertops, appliances, flooring, lighting. Budget refresh $25-30K, mid-range remodel $38-45K, high-end custom $54-64K+.'
      },
      {
        name: 'Whole-House Remodel',
        // NOTE: large increase from the original "$50,000-$150,000+". The
        // wholeHomeRemodel service in calculator-config.js (added 2026-07-05)
        // is scoped to comprehensive renovation of a typical 2,000 sqft home
        // at $135-290/sqft — its mathematical floor is well above the old
        // figure. Flagged for visibility in the reconciliation PR.
        range: combinedCostString(
          projectEstimate('wholeHomeRemodel', 'standardRefresh', 2000),
          projectEstimate('wholeHomeRemodel', 'highEndRenovation', 2000),
          { plus: true }
        ),
        description: 'Comprehensive home renovation including multiple rooms, structural changes, systems upgrades, complete interior refresh. Custom scope and pricing.'
      }
    ],
    timelines: {
      kitchen: '4-8 weeks',
      bathroom: '2-4 weeks',
      wholeHouse: '12-20 weeks'
    },
    // Three separate calculators exist for this service (kitchen, bath,
    // whole-home) — a single `calculator` field can't link all three, which
    // is why kitchen-remodel.html and whole-home-remodel.html had no
    // inbound link from anywhere despite being real, sitemapped pages.
    calculators: [
      { id: 'kitchen-remodel', label: 'Kitchen Cost Calculator' },
      { id: 'bath-remodel', label: 'Bath Cost Calculator' },
      { id: 'whole-home-remodel', label: 'Whole-Home Cost Calculator' }
    ],
    relatedServices: [
      { name: 'ADA Bath to Shower Conversions', url: '/ada-bath-to-shower' },
      { name: 'Room Additions', url: '/additions' },
      { name: 'Basement Finishing', url: '/basement-finishing' },
      { name: 'ADU Construction', url: '/adu-builder' }
    ]
  },
  {
    id: 'commercial-upfits',
    title: 'Commercial Upfits',
    slug: 'commercial-upfits',
    category: 'Commercial',
    description: 'Commercial tenant improvements and build-outs: retail, office, food service. Complete design-build service.',
    h1: 'Commercial Upfits & Tenant Improvements - Upstate SC',
    intro: "From retail spaces to medical offices and restaurant build-outs, I handle all phases: space planning, permitting, construction, inspections, and final finishes. Every project delivered on time and within budget.",
    stats: {
      costRange: '$30-100+ Per Sq Ft',
      timeline: '4-16 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: '$30-100+/sq ft',
    timeline: '4-16 weeks',
    commonProjects: [
      {
        name: 'Small Retail or Office',
        size: '1,000-2,000 sq ft',
        cost: '$30,000–$80,000',
        details: 'Interior walls, flooring, lighting, HVAC, restroom updates, storefront modifications. 4-8 week timeline.'
      },
      {
        name: 'Medical or Professional Office',
        size: '2,000-3,500 sq ft',
        cost: '$80,000–$200,000',
        details: 'Multiple exam rooms, reception area, ADA compliance, specialized HVAC, medical plumbing. 8-12 week timeline.'
      },
      {
        name: 'Restaurant or Food Service',
        size: '2,500-4,000 sq ft',
        cost: '$150,000–$400,000+',
        details: 'Commercial kitchen equipment, hood systems, grease trap, dining area finishes, health dept compliance. 12-16 week timeline.'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Office/Retail',
        range: '$30-50/sq ft',
        description: 'Simple build-out with interior walls, flooring, lighting, basic electrical, HVAC adjustments. Minimal plumbing. Standard finishes. 4-8 weeks for 1K-2K sf spaces.'
      },
      {
        name: 'Mid-Range Professional',
        range: '$50-80/sq ft',
        description: 'Multiple rooms, upgraded finishes, ADA compliance, restroom additions, specialized systems. Medical, dental, or professional office. 8-12 weeks typical timeline.'
      },
      {
        name: 'Complex Food Service',
        range: '$80-100+/sq ft',
        description: 'Restaurant or food service with commercial kitchen, hood systems, grease trap, health department compliance, heavy electrical/plumbing. 12-16 weeks for 2.5K-4K sf.'
      }
    ],
    calculator: null,
    relatedServices: [
      { name: 'Remodeling Services', url: '/remodeling' },
      { name: 'Room Additions', url: '/additions' },
      { name: 'General Contracting', url: '/services.html' }
    ]
  },
  {
    id: 'basement-finishing',
    title: 'Basement Finishing',
    slug: 'basement-finishing',
    category: 'Construction',
    description: 'Professional basement finishing with moisture control, egress windows, and complete interior build-out. Licensed contractor serving Upstate SC since 1995.',
    h1: 'Basement Finishing Contractor - Upstate SC',
    intro: "From simple storage spaces to luxury home theaters, I handle all aspects of basement finishing: egress windows, moisture control, electrical, plumbing, and complete interior finishing. Every project code-compliant and built to last.",
    stats: {
      costRange: '$30-75 Per Sq Ft',
      timeline: '6-10 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: '$30-75/sq ft',
    timeline: '6-10 weeks',
    commonProjects: [
      {
        name: 'Basic 1,000 sq ft Finish',
        size: '1,000 sq ft',
        cost: '$30,000–$45,000',
        details: 'Egress windows, vapor barrier, framing, insulation, drywall, paint, LVP flooring, basic electrical, HVAC extension'
      },
      {
        name: 'Mid-Range with Bedroom & Bath',
        size: '1,000 sq ft',
        cost: '$45,000–$60,000',
        details: 'Everything in Basic plus full bathroom with ejector pump, bedroom closet, upgraded lighting, premium finishes'
      },
      {
        name: 'High-End Luxury Basement',
        size: '1,000 sq ft',
        cost: '$60,000–$75,000+',
        details: 'Multiple bedrooms/baths, wet bar, home theater wiring, custom built-ins, premium tile, soundproofing'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Finish',
        range: '$30-45/sq ft',
        description: 'Simple living space conversion with egress windows, vapor barrier, framing, R-13 insulation, drywall, paint, LVP flooring, basic electrical (recessed lights, outlets), HVAC extension.'
      },
      {
        name: 'Mid-Range Finish',
        range: '$45-60/sq ft',
        description: 'Everything in Basic plus full bathroom with ejector pump, bedroom closet framing, upgraded lighting (dimmers, decorative fixtures), premium paint, upgraded flooring (carpet in bedrooms, tile in bath).'
      },
      {
        name: 'High-End Finish',
        range: '$60-75/sq ft',
        description: 'Luxury finishes including multiple bedrooms/bathrooms, wet bar with plumbing, home theater wiring (dedicated circuits, speaker pre-wire), custom built-ins, premium tile work, soundproofing.'
      }
    ],
    additionalCosts: [
      { item: 'Moisture Remediation', cost: '$2,500-$6,000', note: 'if waterproofing or sump pump needed' },
      { item: 'Building Permits', cost: '$450-$850', note: 'Greenville County, includes all inspections' },
      { item: 'HVAC Upgrade', cost: '$0-$3,500', note: 'depending on existing system capacity' },
      { item: 'Structural Repairs', cost: '$1,500-$4,000', note: 'if foundation cracks or floor leveling required' }
    ],
    calculator: 'basement-finishing',
    relatedServices: [
      { name: 'Room Additions', url: '/additions' },
      { name: 'Remodeling Services', url: '/remodeling' },
      { name: 'ADU Construction', url: '/adu-builder' }
    ]
  },
  {
    id: 'insurance-restoration',
    title: 'Insurance Restoration & Repair Services',
    slug: 'insurance-restoration',
    category: 'Insurance Restoration',
    description: 'Professional storm damage, water damage, and insurance claim restoration services in Upstate SC. Free consultations and full repair services.',
    h1: 'Insurance Restoration & Repair Services',
    intro: "Professional storm damage, water damage, and insurance claim restoration in Upstate SC — from a free consultation to full quality repairs. Scott Burch personally oversees every project.",
    stats: {
      costRange: 'Custom Quote',
      timeline: 'Varies by Scope',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    howItWorks: [
      {
        title: 'Free Consultation',
        description: 'Discuss the damage and situation. Get a ballpark range.'
      },
      {
        title: 'On-Site Assessment',
        description: 'On-site inspection and a free ballpark range. A detailed written estimate with full documentation is available for a fee, credited back if you hire us.'
      },
      {
        title: 'Quality Repairs',
        description: 'We complete the approved work with full attention to detail.'
      }
    ],
    benefits: [
      'Free consultation and ballpark range',
      'Clear communication with insurance companies',
      'Scott on the job site',
      '35+ years local experience'
    ],
    calculator: null,
    relatedServices: [
      { name: 'ADA Bath to Shower Conversions', url: '/ada-bath-to-shower' },
      { name: 'Home Remodeling', url: '/remodeling' },
      { name: 'Basement Finishing', url: '/basement-finishing' },
      { name: 'Room Additions', url: '/additions' }
    ]
  },
  {
    id: 'ada-compliance',
    title: 'ADA Compliance & Accessibility Modifications',
    slug: 'ada-compliance',
    category: 'Accessibility',
    description: 'Ramps, bathrooms, doorways, and other accessibility improvements for commercial and residential properties to meet current ADA standards.',
    h1: 'ADA Compliance & Accessibility Modifications',
    intro: "From aging-in-place bathroom conversions to commercial ramps and doorway widening, we design and build accessibility modifications that meet current ADA standards — for homeowners and business owners across Upstate SC.",
    heroImage: '/images/ada-compliance-commercial.webp',
    stats: {
      costRange: 'Custom Quote',
      timeline: 'Varies by Scope',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    serviceCategories: [
      {
        name: 'Residential Accessibility',
        items: [
          'Curbless / roll-in shower conversions',
          'Grab bars and ADA-height fixtures',
          'Widened doorways and hallways',
          'Wheelchair ramps and threshold ramps',
          'Accessible flooring transitions'
        ]
      },
      {
        name: 'Commercial ADA Compliance',
        items: [
          'Accessible entrance ramps and handrails',
          'ADA-compliant restroom retrofits',
          'Door width and hardware upgrades',
          'Parking and path-of-travel accessibility',
          'Code compliance review and permitting'
        ]
      }
    ],
    howItWorks: [
      {
        title: 'Free Consultation',
        description: 'Discuss your accessibility needs or compliance requirements. No obligation.'
      },
      {
        title: 'On-Site Assessment',
        description: 'We evaluate the space against current ADA standards and identify what needs to change.'
      },
      {
        title: 'Compliant Construction',
        description: 'We complete the approved modifications to code, with full attention to detail.'
      }
    ],
    benefits: [
      'Full compliance with current ADA standards',
      'Improved safety for residents, employees, and customers',
      'Greater independence and accessibility at home',
      '35+ years local experience with permits and inspections'
    ],
    calculator: null,
    relatedServices: [
      { name: 'ADA Bath to Shower Conversions', url: '/ada-bath-to-shower' },
      { name: 'Home Remodeling', url: '/remodeling' },
      { name: 'Basement Finishing', url: '/basement-finishing' },
      { name: 'Commercial Upfits', url: '/commercial-upfits' }
    ]
  },
  {
    id: 'ada-bath-to-shower',
    title: 'ADA Bath to Shower Conversions',
    slug: 'ada-bath-to-shower',
    category: 'Accessibility Remodeling',
    description: 'Convert bathtubs into accessible, zero-entry roll-in showers with ADA-compliant grab bars, low-threshold entry, and non-slip surfaces.',
    h1: 'ADA Bath to Shower Conversions',
    intro: "Convert your existing bathtub into a safe, accessible, zero-entry roll-in shower — ADA-compliant grab bars, low-threshold entry, and non-slip surfaces, built for aging-in-place and long-term safety.",
    heroImage: '/images/ada-bath-to-shower/ada-bath-to-shower-conversion-simpsonville.webp',
    // Fixed-scope itemized pricing (see ADA_BATH_SHOWER_ITEMS in
    // calculator-config.js) — not sqft-based, so this range is
    // informational only, not computed via pricing-sync.js.
    stats: {
      costRange: '$10,500-$19,800 Typical',
      timeline: '1-2 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    serviceCategories: [
      {
        name: 'Structural & Mechanical',
        items: [
          'Demo and removal of the existing tub',
          'Plumbing rough-in and relocation',
          'Waterproofing and backing (Schluter or equivalent)',
          'ADA roll-in shower base, fiberglass or tile-ready'
        ]
      },
      {
        name: 'Finishes & Fixtures',
        items: [
          'Tile or fiberglass surround',
          'ADA grab bars, installed',
          'Shower valve and trim, thermostatic available',
          'Accessible door or curtain and accessories'
        ]
      }
    ],
    howItWorks: [
      {
        title: 'Free Consultation',
        description: 'Discuss your accessibility needs and get a ballpark range. No obligation.'
      },
      {
        title: 'On-Site Assessment',
        description: 'We evaluate tub size, plumbing access, and wall condition to confirm scope.'
      },
      {
        title: 'Conversion Installed',
        description: 'Demo through finish, completed to ADA standards with full attention to detail.'
      }
    ],
    benefits: [
      'Improved safety and fall prevention',
      'ADA-compliant grab bars and low-threshold entry',
      'Supports aging-in-place and independent living',
      'Insurance-friendly documentation available on request'
    ],
    calculator: 'ada-bath-shower',
    relatedServices: [
      { name: 'ADA Compliance & Accessibility', url: '/ada-compliance' },
      { name: 'Home Remodeling', url: '/remodeling' },
      { name: 'Insurance Restoration', url: '/insurance-restoration' }
    ]
  },
  {
    id: 'handyman',
    title: 'Handyman Services',
    slug: 'handyman',
    category: 'Handyman & Repairs',
    description: 'Small plumbing, electrical, carpentry, and painting jobs — a lower-tier service for homeowners who need a task list handled without a full remodel. Licensed contractor serving Upstate SC since 1995.',
    h1: 'Handyman Services - Upstate SC',
    intro: "From a single outlet swap to a water heater replacement, I handle the smaller jobs too — plumbing fixtures, electrical, doors and windows, carpentry, drywall repair, and interior painting. Same licensing and accountability as every larger project, just sized for a shorter task list.",
    stats: {
      costRange: '$125-$4,400 Typical',
      timeline: 'Same-Day to 1 Week',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: 'Priced per task',
    timeline: 'Same-day to 1 week',
    commonProjects: [
      {
        name: 'Outlet or Light Fixture Swap',
        size: 'Single fixture',
        cost: '$125–$730',
        details: 'Outlet and switch replacement, GFCI upgrades, light fixture or ceiling fan installation.'
      },
      {
        name: 'Interior Door or Room Paint',
        size: 'Single room',
        cost: '$400–$2,050',
        details: 'Interior or exterior door installation, baseboards, crown molding, or a full room repaint.'
      },
      {
        name: 'Water Heater Replacement',
        size: '40-50 gal or tankless',
        cost: '$1,100–$4,400',
        details: 'Standard tank or tankless water heater installation, fully licensed and code-compliant.'
      }
    ],
    pricingTiers: [
      {
        name: 'Small Repairs & Fixture Swaps',
        range: '$125-$730',
        description: 'Outlet and switch replacement, light fixtures, GFCI and dimmer upgrades, small drywall patches, ceiling fans, faucet and toilet installation.'
      },
      {
        name: 'Installations & Carpentry',
        range: '$400-$2,050',
        description: 'Interior and exterior doors, windows, baseboards, crown molding, custom shelving, and full-room interior painting.'
      },
      {
        name: 'Larger Plumbing & Repairs',
        range: '$1,100-$4,400',
        description: 'Standard or tankless water heater replacement, large drywall repairs, and popcorn ceiling removal.'
      }
    ],
    calculator: null,
    relatedServices: [
      { name: 'Home Remodeling', url: '/remodeling' },
      { name: 'ADA Bath to Shower Conversions', url: '/ada-bath-to-shower' },
      { name: 'Insurance Restoration', url: '/insurance-restoration' }
    ]
  }
];

/**
 * Get service by ID
 */
export function getServiceById(id) {
  return SERVICES.find(s => s.id === id);
}

/**
 * Get service by slug
 */
export function getServiceBySlug(slug) {
  return SERVICES.find(s => s.slug === slug);
}

/**
 * Get services by category
 */
export function getServicesByCategory(category) {
  return SERVICES.filter(s => s.category === category);
}
