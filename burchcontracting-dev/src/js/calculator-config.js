export const PRICING_UPDATED = '2026-07-05'

export const PRICING_CONFIG = {
  defaultOverheadAndProfit: 0.20,
  locationFactors: {
    grayCourtArea: {
      name: 'Gray Court & Surrounding Area',
      factor: 0.98,
      cities: ['Gray Court', 'Enoree', 'Woodruff'],
    },
    fountainInnArea: {
      name: 'Fountain Inn & Surrounding Area',
      factor: 1.02,
      cities: ['Fountain Inn', 'Simpsonville (South)', 'Mauldin (South)'],
    },
    simpsonvilleArea: {
      name: 'Simpsonville & Greenville County',
      factor: 1.07,
      cities: ['Simpsonville', 'Mauldin', 'Greenville', 'Five Forks', 'Taylors'],
    },
  },
  outputRanges: {
    budgetLow: 0.93,
    mostCommon: 1,
    customHigh: 1.12,
  },
  sizeRanges: {
    decks: { min: 100, max: 800 },
    screenedPorches: { min: 100, max: 600 },
    garages: { min: 400, max: 1200 },
    homeAdditions: { min: 200, max: 1000 },
    kitchenRemodel: { min: 100, max: 400 },
    bathRemodel: { min: 35, max: 150 },
    wholeHomeRemodel: { min: 800, max: 4000 },
    basementFinishing: { min: 400, max: 2000 },
    coveredPatios: { min: 100, max: 600 },
  },
  services: {
    decks: {
      name: 'Decks',
      baseRates: {
        pressureTreated: {
          label: 'Pressure-Treated Wood Deck',
          directCost: 34,
          description: 'Standard PT lumber, code-compliant framing, basic railing',
        },
        compositeLowMaintenance: {
          label: 'Composite Low-Maintenance Deck',
          directCost: 52,
          description: 'Composite decking, aluminum railing, hidden fasteners',
        },
        premiumComposite: {
          label: 'Premium Composite + Custom Features',
          directCost: 67,
          description: 'Premium composite, custom railing, built-in features, lighting',
        },
      },
      materialFactors: { standard: 1, upgraded: 1.15, premium: 1.35 },
      complexityFactors: { simple: 1, moderate: 1.12, complex: 1.28 },
      siteConditionFactors: { flat: 1, slope: 1.08, challenging: 1.18 },
      adders: [
        { id: 'bench', label: 'Built-in Bench Seating', cost: 85, unit: 'linear foot' },
        { id: 'pergola', label: 'Pergola or Shade Structure', cost: 2500, unit: 'per structure' },
        { id: 'lighting', label: 'Deck Lighting Package', cost: 1200, unit: 'per deck' },
        { id: 'privacy', label: 'Privacy Screen or Lattice', cost: 45, unit: 'linear foot' },
      ],
    },
    screenedPorches: {
      name: 'Screened Porches',
      baseRates: {
        enclosureOnly: {
          label: 'Screen Enclosure Only (existing deck/porch)',
          directCost: 18,
          description: 'Frame and screen existing covered space',
        },
        newScreenedPorch: {
          label: 'New Screened Porch (roof, floor, screening)',
          directCost: 62,
          description: 'Complete structure, roof, screening, basic finishes',
        },
        upgradedOutdoorRoom: {
          label: 'Upgraded Outdoor Room (premium finishes)',
          directCost: 82,
          description: 'Premium materials, ceiling fans, lighting, finished trim',
        },
      },
      materialFactors: { standard: 1, upgraded: 1.12, premium: 1.25 },
      complexityFactors: { simple: 1, moderate: 1.1, complex: 1.22 },
      siteConditionFactors: {
        existingStructure: 1,
        newConstruction: 1.15,
        structuralChallenges: 1.28,
      },
      adders: [
        { id: 'fan', label: 'Ceiling Fan with Light', cost: 450, unit: 'per fan' },
        { id: 'recessed', label: 'Recessed Can Lighting', cost: 180, unit: 'per fixture' },
        { id: 'retractable', label: 'Retractable Screen System', cost: 650, unit: 'per opening' },
        { id: 'ceiling', label: 'Finished Tongue & Groove Ceiling', cost: 8, unit: 'per SF' },
      ],
    },
    garages: {
      name: 'Garages',
      baseRates: {
        attachedBasic: {
          label: 'Attached Garage (basic finish)',
          directCost: 60,
          description: 'Standard 2-car attached, basic finishes, slab foundation',
        },
        detachedStandard: {
          label: 'Detached Garage (standard finish)',
          directCost: 89,
          description: 'Detached 2-car, standard finishes, electrical, garage door',
        },
        upgradedWorkshop: {
          label: 'Upgraded Workshop/Carriage House',
          directCost: 119,
          description: 'Premium finishes, finished walls, upgraded electrical, upgraded door',
        },
      },
      materialFactors: { standard: 1, upgraded: 1.1, premium: 1.22 },
      complexityFactors: { simple: 1, moderate: 1.12, complex: 1.25 },
      siteConditionFactors: { flat: 1, slope: 1.12, challenging: 1.25 },
      adders: [
        { id: 'doors', label: 'Insulated Garage Doors (×2)', cost: 2160, unit: 'per pair' },
        { id: 'bonus', label: 'Second Floor Storage/Bonus', cost: 54, unit: 'per SF' },
        { id: 'panel', label: 'Upgraded Electrical Panel', cost: 1440, unit: 'per garage' },
        { id: 'walls', label: 'Finished Interior Walls', cost: 7.2, unit: 'per SF' },
      ],
    },
    homeAdditions: {
      name: 'Home Additions',
      baseRates: {
        basicFinish: {
          label: 'Basic Finish Addition',
          directCost: 172,
          description: 'Standard finishes, functional layout, code-compliant',
        },
        standardLivingSpace: {
          label: 'Standard Living Space Addition',
          directCost: 218,
          description: 'Quality finishes, HVAC, updated fixtures, good flow',
        },
        premiumCustom: {
          label: 'Premium Custom Addition',
          directCost: 278,
          description: 'High-end finishes, custom features, premium materials',
        },
        luxuryMasterSuite: {
          label: 'Luxury Master Suite (300+ SF)',
          directCost: 310,
          description: 'Luxury master bedroom, spa bath, custom closet, premium everything',
        },
      },
      materialFactors: { builder: 1, standard: 1.08, upgraded: 1.18, premium: 1.32 },
      complexityFactors: { simple: 1, moderate: 1.12, complex: 1.25 },
      siteConditionFactors: { straightforward: 1, moderate: 1.1, difficult: 1.22 },
      adders: [
        { id: 'bathFull', label: 'Bathroom (Full)', cost: 15000, unit: 'per bathroom' },
        { id: 'bathHalf', label: 'Bathroom (Half)', cost: 8000, unit: 'per bathroom' },
        { id: 'kitchen', label: 'Custom Kitchen Extension', cost: 25000, unit: 'per extension' },
        { id: 'secondStory', label: 'Second Story Addition Premium', cost: 35, unit: 'per SF' },
      ],
    },
    kitchenRemodel: {
      name: 'Kitchen Remodeling',
      baseRates: {
        standardRefresh: {
          label: 'Standard Kitchen Refresh',
          directCost: 110,
          description: 'Cabinet refacing or stock cabinets, laminate counters, standard fixtures',
        },
        midRangeRemodel: {
          label: 'Mid-Range Kitchen Remodel',
          directCost: 165,
          description: 'New cabinetry, quartz or granite counters, tile backsplash, updated lighting',
        },
        premiumCustom: {
          label: 'Premium Custom Kitchen',
          directCost: 235,
          description: 'Custom cabinetry, premium stone counters, high-end appliances, layout changes',
        },
      },
      materialFactors: { standard: 1, upgraded: 1.15, premium: 1.3 },
      complexityFactors: { simple: 1, moderate: 1.15, complex: 1.3 },
      siteConditionFactors: { straightforward: 1, moderate: 1.1, difficult: 1.2 },
      adders: [
        { id: 'island', label: 'Kitchen Island Addition', cost: 4500, unit: 'per island' },
        { id: 'appliances', label: 'High-End Appliance Package', cost: 8000, unit: 'per package' },
        { id: 'hood', label: 'Custom Range Hood', cost: 1800, unit: 'per hood' },
        { id: 'pantry', label: 'Pantry / Butler\'s Pantry Addition', cost: 3200, unit: 'per addition' },
      ],
    },
    bathRemodel: {
      name: 'Bathroom Remodeling',
      baseRates: {
        basicRefresh: {
          label: 'Basic Bath Refresh',
          directCost: 140,
          description: 'New fixtures, vanity, and paint with the existing layout retained',
        },
        midRangeRemodel: {
          label: 'Mid-Range Bath Remodel',
          directCost: 280,
          description: 'New tile, vanity, and tub/shower with some layout adjustments',
        },
        fullGutRenovation: {
          label: 'Full Gut Renovation',
          directCost: 550,
          description: 'Complete reconfiguration, premium tile and fixtures, custom shower',
        },
      },
      materialFactors: { standard: 1, upgraded: 1.18, premium: 1.35 },
      complexityFactors: { simple: 1, moderate: 1.15, complex: 1.3 },
      siteConditionFactors: { straightforward: 1, moderate: 1.1, difficult: 1.22 },
      adders: [
        { id: 'heatedFloor', label: 'Heated Tile Flooring', cost: 1200, unit: 'per bath' },
        { id: 'soakingTub', label: 'Freestanding Soaking Tub', cost: 3500, unit: 'per tub' },
        { id: 'curblessShower', label: 'Curbless Walk-In Shower Upgrade', cost: 2800, unit: 'per shower' },
        { id: 'doubleVanity', label: 'Double Vanity Upgrade', cost: 1800, unit: 'per vanity' },
      ],
    },
    wholeHomeRemodel: {
      name: 'Whole-Home Remodeling',
      baseRates: {
        standardRefresh: {
          label: 'Standard Whole-Home Refresh',
          directCost: 110,
          description: 'Flooring, paint, fixtures, and cosmetic updates throughout',
        },
        midRangeRemodel: {
          label: 'Mid-Range Whole-Home Remodel',
          directCost: 165,
          description: 'Kitchen and bath updates, new flooring, and updated systems',
        },
        highEndRenovation: {
          label: 'High-End Whole-Home Renovation',
          directCost: 235,
          description: 'Full reconfiguration, premium finishes throughout, structural changes',
        },
      },
      materialFactors: { builder: 1, standard: 1.08, upgraded: 1.18, premium: 1.32 },
      complexityFactors: { simple: 1, moderate: 1.12, complex: 1.25 },
      siteConditionFactors: { straightforward: 1, moderate: 1.1, difficult: 1.22 },
      adders: [
        { id: 'kitchenReno', label: 'Kitchen Renovation Inclusion', cost: 45000, unit: 'per kitchen' },
        { id: 'primarySuite', label: 'Primary Suite Renovation', cost: 28000, unit: 'per suite' },
        { id: 'flooring', label: 'Whole-Home Flooring Replacement', cost: 9, unit: 'per SF' },
        { id: 'hvac', label: 'HVAC System Replacement', cost: 9500, unit: 'per system' },
      ],
    },
    basementFinishing: {
      name: 'Basement Finishing',
      baseRates: {
        basicFinish: {
          label: 'Basic Finished Space',
          directCost: 42,
          description: 'Framing, insulation, drywall, flooring, lighting, code egress',
        },
        standardLivingSuite: {
          label: 'Standard Living Suite',
          directCost: 63,
          description: 'Adds a bedroom and full bath, upgraded flooring, dedicated HVAC zone',
        },
        premiumBuildOut: {
          label: 'Premium Build-Out',
          directCost: 88,
          description: 'Full suite with wet bar, media room, custom millwork, premium finishes',
        },
      },
      materialFactors: { builder: 1, standard: 1.08, upgraded: 1.18, premium: 1.3 },
      complexityFactors: { simple: 1, moderate: 1.14, complex: 1.3 },
      siteConditionFactors: { straightforward: 1, moderate: 1.12, difficult: 1.28 },
      adders: [
        { id: 'fullBath', label: 'Full Bathroom Addition', cost: 18500, unit: 'per bath' },
        { id: 'egressWindow', label: 'Egress Window & Well (code required for bedrooms)', cost: 4800, unit: 'per window' },
        { id: 'wetBar', label: 'Wet Bar / Kitchenette', cost: 12500, unit: 'per bar' },
        { id: 'waterproofing', label: 'Waterproofing & Sump System', cost: 7200, unit: 'per system' },
        { id: 'hvacZone', label: 'Dedicated HVAC Zone', cost: 6500, unit: 'per zone' },
      ],
    },
    coveredPatios: {
      name: 'Covered Patios',
      baseRates: {
        basicRoof: {
          label: 'Basic Roof Structure',
          directCost: 68,
          description: 'Roof over existing or new concrete slab, PT or aluminum posts, architectural shingles, basic electrical',
        },
        midRangeOutdoorRoom: {
          label: 'Mid-Range Outdoor Room',
          directCost: 88,
          description: 'Decorative columns, tongue-and-groove ceiling, ceiling fans, recessed lighting, roof line matched to home',
        },
        premiumOutdoorLiving: {
          label: 'Premium Outdoor Living Space',
          directCost: 112,
          description: 'Outdoor kitchen area, fireplace or fire pit, custom lighting, premium materials, integrated landscaping',
        },
      },
      materialFactors: { standard: 1, upgraded: 1.15, premium: 1.3 },
      complexityFactors: { simple: 1, moderate: 1.12, complex: 1.25 },
      siteConditionFactors: { flat: 1, slope: 1.1, challenging: 1.22 },
      adders: [
        { id: 'kitchen', label: 'Outdoor Kitchen Area', cost: 12000, unit: 'per kitchen' },
        { id: 'fireplace', label: 'Fireplace or Fire Pit', cost: 5500, unit: 'per feature' },
        { id: 'fan', label: 'Ceiling Fan with Light', cost: 450, unit: 'per fan' },
        { id: 'lighting', label: 'Recessed / Accent Lighting Package', cost: 1400, unit: 'per patio' },
      ],
    },
  },
}

/**
 * ADA Bath-to-Shower Conversion pricing.
 * This is a fixed-scope itemized project, not a per-sqft service, so it
 * doesn't fit calculateEstimate()'s sqft x rate model — it has its own
 * calculator (src/js/ada-bath-calculator.js) that sums applicable items
 * and applies the same location factor and overhead & profit rate used
 * everywhere else on the site. This is still the single source of truth
 * for these dollar figures; nothing should hand-type them elsewhere.
 */
export const ADA_BATH_SHOWER_ITEMS = [
  { id: 'demo', label: 'Demo & Removal of Old Tub', low: 800, high: 1400, note: 'Includes haul away', always: true },
  { id: 'plumbing', label: 'Plumbing Rough-In & Relocation', low: 1200, high: 2200, note: 'New drain, supply lines', always: true },
  { id: 'waterproofing', label: 'Waterproofing & Backing', low: 600, high: 1000, note: 'Schluter or equivalent', always: true },
  { id: 'showerBase', label: 'ADA Roll-In Shower Base', low: 1800, high: 3500, note: 'Fiberglass or tile-ready', always: true },
  { id: 'tileSurround', label: 'Tile / Surround (Materials + Labor)', low: 2800, high: 5500, note: '3x6 or larger tile', group: 'finish', groupValue: 'tile' },
  { id: 'grabBars', label: 'ADA Grab Bars (2-3)', low: 350, high: 650, note: 'Installed', optional: true, defaultOn: true },
  { id: 'valve', label: 'Shower Valve & Trim', low: 450, high: 850, note: 'Thermostatic recommended', hasThermostatic: true },
  { id: 'door', label: 'Door / Curtain & Accessories', low: 300, high: 700, always: true },
  { id: 'labor', label: 'Labor & Finishing', low: 2500, high: 4000, always: true },
]

export const CALCULATOR_PAGES = {
  decks: {
    serviceKey: 'decks',
    title: 'Deck Cost Calculator',
    metaTitle: 'Deck Cost Calculator Simpsonville & Fountain Inn SC | Burch Contracting',
    description: 'Estimate custom deck costs in Upstate SC by size, material, and location. Transparent 20% overhead & profit. SC Licensed #CLG118679.',
    intro: 'Decks in Upstate SC typically cost $40–$85 per square foot installed — a 12×16 deck (192 sqft) runs $7,400–$8,950 in pressure-treated lumber or $11,350–$13,700 in composite. Size, height, railing, and stairs are the biggest cost drivers.',
    marketArea: 'Simpsonville, Fountain Inn, Gray Court & Greenville County',
  },
  garages: {
    serviceKey: 'garages',
    title: 'Garage Cost Calculator',
    metaTitle: 'Garage Cost Calculator Simpsonville & Fountain Inn SC | Burch Contracting',
    description: 'Plan detached and attached garage construction costs in Upstate SC. Transparent pricing with 20% overhead & profit.',
    intro: 'A standard two-car detached garage (24×24, 576 sqft) in Upstate SC costs $58,000–$70,000 fully finished — slab, framing, roof, doors, and basic electrical. A comparable attached garage runs $39,000–$47,000, and workshop upgrades or larger 3-car footprints (900 sqft) commonly run $122,000–$147,000.',
    marketArea: 'Simpsonville, Fountain Inn, Gray Court & Greenville County',
  },
  porch: {
    serviceKey: 'screenedPorches',
    title: 'Screened Porch Cost Calculator',
    metaTitle: 'Screened Porch Cost Calculator Simpsonville SC | Burch Contracting',
    description: 'Estimate screened porch and outdoor room costs in Upstate SC. New construction or deck conversions.',
    intro: 'Screened porches in Upstate SC typically run $15,000–$65,000 depending on size, roof structure, and finishes. Converting an existing deck can save 50–70% versus new construction since the framing and floor are already in place.',
    marketArea: 'Simpsonville, Fountain Inn, Greenville County, and Laurens County',
  },
  additions: {
    serviceKey: 'homeAdditions',
    title: 'Home Addition Cost Calculator',
    metaTitle: 'Room Addition Cost Calculator Upstate SC | Burch Contracting',
    description: 'Estimate room addition and home expansion costs in Upstate SC. $200–$340/sq ft typical range.',
    intro: 'Room additions in Upstate SC typically cost $200–$340 per square foot depending on finishes, HVAC, plumbing, and structural complexity — a 400 sqft addition typically runs $78,000–$152,000. Use this calculator for a realistic planning range.',
    marketArea: 'Simpsonville, Fountain Inn, Gray Court & Greenville County',
  },
  kitchen: {
    serviceKey: 'kitchenRemodel',
    title: 'Kitchen Remodel Cost Calculator',
    metaTitle: 'Kitchen Remodel Cost Calculator Greenville & Laurens County SC | Burch Contracting',
    description: 'Estimate kitchen remodeling costs in Greenville and Laurens County SC. Transparent 20% overhead & profit. SC Licensed #CLG118679.',
    intro: 'Kitchen remodels in Greenville and Laurens County SC typically cost $135–$290 per square foot — a 200 sqft kitchen runs $25,000–$64,500 depending on cabinetry, counters, and layout changes.',
    marketArea: 'Greenville County & Laurens County',
  },
  bath: {
    serviceKey: 'bathRemodel',
    title: 'Bathroom Remodel Cost Calculator',
    metaTitle: 'Bathroom Remodel Cost Calculator Greenville & Laurens County SC | Burch Contracting',
    description: 'Estimate bathroom remodeling costs in Greenville and Laurens County SC. Transparent 20% overhead & profit. SC Licensed #CLG118679.',
    intro: 'Bathroom remodels in Greenville and Laurens County SC typically run $5,600–$75,000 depending on scope — a small powder room refresh starts around $5,600, while a full primary bath gut renovation with premium finishes can run $65,000–$75,000+.',
    marketArea: 'Greenville County & Laurens County',
  },
  wholeHome: {
    serviceKey: 'wholeHomeRemodel',
    title: 'Whole-Home Remodel Cost Calculator',
    metaTitle: 'Whole-Home Remodel Cost Calculator Greenville & Laurens County SC | Burch Contracting',
    description: 'Estimate whole-home remodeling costs in Greenville and Laurens County SC. Transparent 20% overhead & profit. SC Licensed #CLG118679.',
    intro: 'Whole-home remodels in Greenville and Laurens County SC typically cost $135–$290 per square foot — a 2,000 sqft home runs $250,000–$645,000 depending on scope and finish level.',
    marketArea: 'Greenville County & Laurens County',
  },
  coveredPatios: {
    serviceKey: 'coveredPatios',
    title: 'Covered Patio Cost Calculator',
    metaTitle: 'Covered Patio Cost Calculator Simpsonville & Fountain Inn SC | Burch Contracting',
    description: 'Estimate covered patio and outdoor living space costs in Upstate SC by size, finish level, and location. Transparent 20% overhead & profit. SC Licensed #CLG118679.',
    intro: 'Covered patios in Upstate SC typically cost $77–$154 per square foot — a 320 sqft mid-range outdoor room with decorative columns and lighting runs $32,055–$38,604. Roof structure, columns, and finish level are the biggest cost drivers.',
    marketArea: 'Simpsonville, Fountain Inn, Gray Court & Greenville County',
  },
  basement: {
    serviceKey: 'basementFinishing',
    title: 'Basement Finishing Cost Calculator',
    metaTitle: 'Basement Finishing Cost Calculator Upstate SC | Burch Contracting',
    description: 'Estimate basement finishing costs in Upstate SC — basic living space, a full bedroom/bath suite, or a premium build-out. Transparent 20% overhead & profit. SC Licensed #CLG118679.',
    intro: 'Basement finishing in Upstate SC typically costs $48–$121 per square foot — a 1,000 sqft basement runs $47,809–$120,637 depending on scope, from a basic finished space to a full living suite with bedroom and bath, up to a premium build-out with wet bar and media room.',
    marketArea: 'Simpsonville, Fountain Inn, Gray Court & Greenville County',
  },
}

const FACTOR_LABELS = {
  standard: 'Contractor-grade, solid value',
  upgraded: 'Quality mid-range materials',
  premium: 'Architectural or luxury grade',
  builder: 'Basic contractor-grade',
  simple: 'Standard layout, no special features',
  moderate: 'Custom angles or added elements',
  complex: 'Multi-level, curves, or built-ins',
  flat: 'Level site, easy equipment access',
  slope: 'Sloped yard or moderate grading',
  challenging: 'Steep slope or restricted access',
  existingStructure: 'Adding to an existing structure',
  newConstruction: 'Full new ground-up construction',
  structuralChallenges: 'Complex roof or foundation tie-in',
  straightforward: 'Level site, standard access',
  difficult: 'Major structural work required',
}

export function getFactorLabel(key) {
  return FACTOR_LABELS[key] ?? key
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(rate) {
  const pct = rate * 100
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`
}

export function defaultSquareFootage(serviceKey) {
  const range = PRICING_CONFIG.sizeRanges[serviceKey]
  if (!range) return 250
  return 50 * Math.round((range.min + range.max) / 2 / 50)
}

export function calculateEstimate({
  squareFootage,
  baseDirectCost,
  locationFactor,
  materialFactor,
  complexityFactor,
  siteConditionFactor,
  addersTotal,
  overheadAndProfit,
  outputRanges,
}) {
  const directCost = squareFootage * baseDirectCost
  const adjustedDirectCost = directCost * locationFactor * materialFactor * complexityFactor * siteConditionFactor
  const subtotalBeforeOP = adjustedDirectCost + addersTotal
  const finalPrice = subtotalBeforeOP * (1 + overheadAndProfit)

  return {
    directCost,
    adjustedDirectCost,
    subtotalBeforeOP,
    finalPrice,
    budgetLow: finalPrice * outputRanges.budgetLow,
    mostCommon: finalPrice * outputRanges.mostCommon,
    customHigh: finalPrice * outputRanges.customHigh,
    overheadAndProfitAmount: finalPrice - subtotalBeforeOP,
  }
}