/**
 * Head metadata for the eleven calculator pages.
 *
 * Phase 3.3b, and the same shape as pages.js: extracted from the pages rather
 * than retyped, plain text not HTML (seoHead() escapes on the way out), and
 * carrying every value the chrome would otherwise default.
 *
 * ogType is the one that matters. All eleven shipped og:type "website" and
 * documentHead() defaults to "article" — the identical trap that silently
 * reclassified seven pages in 3.3a-ii. It is stored explicitly here, and the
 * extraction asserted it rather than assuming it.
 *
 * `schema` is absent by design. These pages carry exactly one JSON-LD block
 * and every node in it — Person, Article, FAQPage, LocalBusiness, Organization,
 * WebSite, WebPage, BreadcrumbList — is built by trustRender() from the
 * template's own <h1>, the pricing table's <h2>, and src/data/. There is
 * nothing left to store.
 */
export const CALCULATOR_PAGES_META = [
  {
    "file": "calculator/ada-bath-shower.html",
    "title": "ADA Bath-to-Shower Cost Calculator | Burch Contracting",
    "description": "$10,500-$19,800 for an ADA bath-to-shower conversion in Upstate SC. Roll-in showers, grab bars. SC Licensed #CLG118679.",
    "canonical": "https://burchcontracting.com/calculator/ada-bath-shower",
    "ogImage": "/images/ada-compliance-residential.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/ada-bath-calculator.js"
    ]
  },
  {
    "file": "calculator/additions.html",
    "title": "Room Addition Cost Calculator Upstate SC | Burch Contracting",
    "description": "Estimate room addition and home expansion costs in Upstate SC. $196–$425/sq ft typical range.",
    "canonical": "https://burchcontracting.com/calculator/additions",
    "ogImage": "/images/room-addition-fountain-inn-sc.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/basement-finishing.html",
    "title": "Basement Finishing Cost Calculator Upstate SC | Burch Contracting",
    "description": "$30-$75/sq ft basement finishing costs in Upstate SC — basic space up to a premium build-out. SC Licensed #CLG118679.",
    "canonical": "https://burchcontracting.com/calculator/basement-finishing",
    "ogImage": "/images/finished-basement.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/bath-remodel.html",
    "title": "Bathroom Remodel Calculator Greenville SC | Burch Contracting",
    "description": "Bathroom remodels in Greenville & Laurens County SC run $5,578-$113,098. Get a personalized estimate in minutes — transparent pricing, SC Licensed #CLG118679.",
    "canonical": "https://burchcontracting.com/calculator/bath-remodel",
    "ogImage": "/images/bath-shower-conversion-woodruff-sc-1.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/covered-patios.html",
    "title": "Covered Patio Calculator Simpsonville SC | Burch Contracting",
    "description": "$77-$154/sq ft covered patio costs in Upstate SC by size & finish level. SC Licensed #CLG118679, transparent pricing.",
    "canonical": "https://burchcontracting.com/calculator/covered-patios",
    "ogImage": "/images/custom-deck-greenville-sc.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/decks.html",
    "title": "Deck Cost Calculator Simpsonville SC | Burch Contracting",
    "description": "$39-$92/sq ft deck costs in Upstate SC by size, material & location. SC Licensed #CLG118679, transparent 20% overhead & profit.",
    "canonical": "https://burchcontracting.com/calculator/decks",
    "ogImage": "/images/custom-deck-greenville-sc.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/estimate.html",
    "title": "Project Cost Calculator | All Services | Burch Contracting",
    "description": "Estimate decks, garages, porches & additions in Upstate SC with one all-in-one calculator. SC Licensed #CLG118679.",
    "canonical": "https://burchcontracting.com/calculator/estimate",
    "ogImage": "/images/custom-deck-greenville-sc.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/garages.html",
    "title": "Garage Cost Calculator Simpsonville SC | Burch Contracting",
    "description": "Plan detached and attached garage construction costs in Upstate SC. Transparent pricing with 20% overhead & profit.",
    "canonical": "https://burchcontracting.com/calculator/garages",
    "ogImage": "/images/screened-patio-simpsonville-sc.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/kitchen-remodel.html",
    "title": "Kitchen Remodel Calculator Greenville SC | Burch Contracting",
    "description": "$125-$322/sq ft kitchen remodeling costs in Greenville & Laurens County SC. SC Licensed #CLG118679, transparent pricing.",
    "canonical": "https://burchcontracting.com/calculator/kitchen-remodel",
    "ogImage": "/images/kitchen-remodeling-sc.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/porch.html",
    "title": "Screened Porch Cost Calculator Simpsonville SC | Burch Contracting",
    "description": "Estimate screened porch and outdoor room costs in Upstate SC. New construction or deck conversions.",
    "canonical": "https://burchcontracting.com/calculator/porch",
    "ogImage": "/images/2024-05-24.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  },
  {
    "file": "calculator/whole-home-remodel.html",
    "title": "Whole-Home Remodel Calculator Greenville SC | Burch Contracting",
    "description": "$125-$322/sq ft whole-home remodeling in Greenville & Laurens County SC. SC Licensed #CLG118679, transparent pricing.",
    "canonical": "https://burchcontracting.com/calculator/whole-home-remodel",
    "ogImage": "/images/finished-basement.webp",
    "ogType": "website",
    "scripts": [
      "/src/js/calculator.js"
    ]
  }
]
