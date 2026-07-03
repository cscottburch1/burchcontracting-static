/**
 * Service Pages Data
 * Central data source for all dedicated service pages
 * Powers scripts/generate-services.mjs
 * All pricing verified from live burchcontracting.com (2026-07-01)
 */

export const SITE = {
  name: 'Burch Contracting',
  phone: '(864) 724-4600',
  phoneLink: 'tel:8647244600',
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
      costRange: '$30-50 Per Sq Ft',
      timeline: '2-4 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: '$30-50/sq ft',
    timeline: '2-4 weeks',
    commonProjects: [
      {
        name: 'Basic Pressure-Treated 12×16',
        size: '192 sq ft',
        cost: '$12,000–$15,000',
        details: 'Southern yellow pine, ground-level, basic railings'
      },
      {
        name: 'Mid-Range Composite 16×20',
        size: '320 sq ft',
        cost: '$18,000–$28,000',
        details: 'Trex or TimberTech, elevated, composite railings'
      },
      {
        name: 'Premium Two-Tier Deck',
        size: '500+ sq ft',
        cost: '$35,000–$65,000',
        details: 'Multi-level, built-in seating, lighting, pergola'
      }
    ],
    pricingTiers: [
      {
        name: 'Pressure-Treated Pine',
        range: '$30-40/sq ft',
        description: 'Southern yellow pine with standard railings and ground-level or single-story elevated design. Most economical option, requires annual maintenance.'
      },
      {
        name: 'Composite Decking',
        range: '$40-50/sq ft',
        description: 'Trex, TimberTech, or Azek composite materials with matching railings. Low maintenance, 25-year warranties, premium appearance.'
      },
      {
        name: 'Multi-Level Premium',
        range: '$50-65/sq ft',
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
      costRange: '$20,000-$55,000 Range',
      timeline: '3-6 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: '$100-175/sq ft',
    timeline: '3-6 weeks',
    commonProjects: [
      {
        name: 'Basic 12×16 Screened Porch',
        size: '192 sq ft',
        cost: '$22,000–$28,000',
        details: 'Concrete pad, PT framing, fiberglass screens, ceiling fan, basic electrical'
      },
      {
        name: 'Mid-Range 16×20 Three-Season',
        size: '320 sq ft',
        cost: '$32,000–$42,000',
        details: 'Elevated deck base, composite flooring, EZE-Breeze windows, upgraded lighting'
      },
      {
        name: 'Premium HVAC Sunroom',
        size: '300+ sq ft',
        cost: '$45,000–$55,000+',
        details: 'Insulated construction, HVAC extension, premium windows, tile flooring'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Screened Porch',
        range: '$20,000-$28,000',
        description: 'Ground-level concrete pad or existing deck conversion. PT framing, fiberglass screening, basic electrical with ceiling fan and outlets. Simple and functional.'
      },
      {
        name: 'Mid-Range Three-Season',
        range: '$28,000-$42,000',
        description: 'EZE-Breeze vinyl window system for adjustable ventilation. Composite or tongue-and-groove ceiling, upgraded lighting, decorative posts. More finished appearance.'
      },
      {
        name: 'Premium Climate-Controlled',
        range: '$42,000-$55,000+',
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
      costRange: '$28,000-$145,000 Range',
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
        cost: '$28,000–$42,000',
        details: 'Concrete slab, vinyl siding, architectural shingles, two 9×7 doors, basic electrical'
      },
      {
        name: '3-Car Garage with Workshop',
        size: '30×30 (900 sq ft)',
        cost: '$45,000–$65,000',
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
        range: '$28,000-$42,000',
        description: 'Standard 24×24 garage with 4" concrete slab, vinyl siding to match home, two 9×7 insulated garage doors, basic electrical. Most popular choice.'
      },
      {
        name: '3-Car or Workshop',
        range: '$45,000-$65,000',
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
      costRange: '$150-300 Per Sq Ft',
      timeline: '8-16 Weeks Typical',
      experience: '35+ Years Experience',
      rating: 'BBB A+ Rated'
    },
    pricePerSqFt: '$150-300/sq ft',
    timeline: '8-16 weeks',
    commonProjects: [
      {
        name: 'Single Bedroom Addition',
        size: '16×20 (320 sq ft)',
        cost: '$48,000–$64,000',
        details: 'Foundation to roof, HVAC extension, closet, matching exterior, basic finishes'
      },
      {
        name: 'Master Suite Addition',
        size: '16×24 with bath (384 sq ft)',
        cost: '$77,000–$96,000',
        details: 'Bedroom, walk-in closet, full master bath with tile shower, upgraded finishes'
      },
      {
        name: 'Two-Story Addition',
        size: '760 sq ft (380 per floor)',
        cost: '$190,000–$228,000',
        details: 'Bedroom suite over family room, complex framing, structural engineering'
      }
    ],
    pricingTiers: [
      {
        name: 'Basic Addition',
        range: '$150-200/sq ft',
        description: 'Single-story room with foundation, framing, roofing, basic electrical/plumbing, drywall, and standard finishes. HVAC extension included.'
      },
      {
        name: 'Mid-Range Addition',
        range: '$200-250/sq ft',
        description: 'Upgraded materials, better windows, hardwood floors, tile bathrooms, crown molding, custom closet systems. More finished appearance.'
      },
      {
        name: 'Premium Addition',
        range: '$250-300/sq ft',
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
      costRange: '$8,000-$60,000 Typical',
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
        cost: '$10,000–$15,000',
        details: 'New tub/shower, vanity, toilet, flooring, tile work, updated electrical and plumbing'
      },
      {
        name: 'Mid-Range Kitchen Remodel',
        size: '10×12 kitchen',
        cost: '$35,000–$50,000',
        details: 'New cabinets, countertops, appliances, flooring, lighting, backsplash, reconfigured layout'
      },
      {
        name: 'Luxury Master Bath',
        size: '8×12 or larger',
        cost: '$20,000–$35,000',
        details: 'Custom tile shower, soaking tub, double vanity, heated floors, premium fixtures'
      }
    ],
    pricingTiers: [
      {
        name: 'Bathroom Remodeling',
        range: '$8,000-$25,000',
        description: 'Full bathroom renovation including new fixtures, tile, vanity, flooring, and updated plumbing/electrical. Modest remodel $10-15K, luxury master bath $20-35K.'
      },
      {
        name: 'Kitchen Remodeling',
        range: '$20,000-$60,000',
        description: 'Complete kitchen renovation with new cabinets, countertops, appliances, flooring, lighting. Budget refresh $20-30K, mid-range remodel $35-50K, high-end custom $50-60K+.'
      },
      {
        name: 'Whole-House Remodel',
        range: '$50,000-$150,000+',
        description: 'Comprehensive home renovation including multiple rooms, structural changes, systems upgrades, complete interior refresh. Custom scope and pricing.'
      }
    ],
    timelines: {
      kitchen: '4-8 weeks',
      bathroom: '2-4 weeks',
      wholeHouse: '12-20 weeks'
    },
    calculator: null,
    relatedServices: [
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
      { name: 'General Contracting', url: '/services' }
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
    calculator: null,
    relatedServices: [
      { name: 'Room Additions', url: '/additions' },
      { name: 'Remodeling Services', url: '/remodeling' },
      { name: 'ADU Construction', url: '/adu-builder' }
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
