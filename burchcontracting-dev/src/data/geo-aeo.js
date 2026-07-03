export const SITE = {
  name: 'Burch Contracting',
  domain: 'https://burchcontracting.com',
  phone: '(864) 724-4600',
  phoneTel: '+18647244600',
  email: 'estimates@burchcontracting.com',
  license: 'CLG118679',
  owner: 'C. Scott Burch',
  office: '1095 Water Tank Rd, Gray Court, SC 29645',
  ogImage: '/images/custom-deck-greenville-sc.webp',
}

export const SERVICE_AREAS = [
  {
    slug: 'simpsonville',
    name: 'Simpsonville',
    state: 'SC',
    county: 'Greenville County',
    driveTime: '15 min from office',
    tagline: 'Our Home Base',
    highlight: 'Simpsonville is our highest-volume market — more garages, decks, and additions built here than anywhere else we serve.',
    about: 'Simpsonville has grown from a small railroad town into one of Upstate South Carolina\'s most desirable communities. With a thriving downtown, excellent schools, and suburban convenience, homeowners here regularly invest in decks, screened porches, garages, and room additions.',
    neighborhoods: [
      { name: 'Downtown Simpsonville', detail: 'Historic homes and walkable streets — craftsman and bungalow styles from the 1920s–1960s.' },
      { name: 'Five Forks Area', detail: 'Family-friendly communities with contemporary single-family homes built from the 1990s onward.' },
      { name: 'Hillcrest & Southeast', detail: 'Established neighborhoods with ranch and split-level homes and mature landscaping.' },
    ],
    insights: ['Highly rated Greenville County schools attract growing families.', 'Strong downtown with local shops and community events.', 'Convenient access to Greenville with small-town charm.'],
    geo: { latitude: 34.7371, longitude: -82.2543 },
  },
  {
    slug: 'fountain-inn',
    name: 'Fountain Inn',
    state: 'SC',
    county: 'Greenville County',
    driveTime: '10 min from office',
    tagline: 'Historic Downtown',
    highlight: 'Just 10 minutes from our Gray Court office — Fountain Inn is one of the closest communities we serve, with steady demand for garages, additions, and porch projects.',
    about: 'Fountain Inn blends historic downtown character with newer residential growth along the I-385 corridor. Homeowners here call us for room additions, bath remodels, detached garages, and screened porches that match existing architecture.',
    neighborhoods: [
      { name: 'Downtown Fountain Inn', detail: 'Renovated cottages and traditional homes near the historic district.' },
      { name: 'Woodfield & Neely Farm', detail: 'Newer subdivisions with open floor plans and two-story traditional designs.' },
    ],
    insights: ['Growing population along the I-385 corridor.', 'Mix of historic homes and new construction.', 'Strong demand for garage and addition projects.'],
    geo: { latitude: 34.6940, longitude: -82.1987 },
  },
  {
    slug: 'mauldin',
    name: 'Mauldin',
    state: 'SC',
    county: 'Greenville County',
    driveTime: '20 min from office',
    tagline: 'Established Community',
    highlight: 'Mauldin homeowners value contractors who show up, communicate clearly, and finish on schedule — that is how we have earned repeat business here for decades.',
    about: 'Mauldin sits between Greenville and Simpsonville with established subdivisions and steady residential investment. We build decks, garages, kitchen and bath remodels, and additions for Mauldin families who want quality work without franchise-style runaround.',
    neighborhoods: [
      { name: 'Bethel & Butler Springs', detail: 'Mature subdivisions with ranch and two-story homes from the 1980s–2000s.' },
      { name: 'BridgeWay & surrounds', detail: 'Newer construction with open-concept layouts and unfinished basements.' },
    ],
    insights: ['Central Greenville County location with easy highway access.', 'Active homeowners association communities.', 'Consistent demand for remodeling and outdoor living projects.'],
    geo: { latitude: 34.7782, longitude: -82.3101 },
  },
  {
    slug: 'greenville',
    name: 'Greenville',
    state: 'SC',
    county: 'Greenville County',
    driveTime: '25 min from office',
    tagline: 'Upstate Hub',
    highlight: 'From Taylors to the Eastside, we take on Greenville-area projects where homeowners want a licensed GC who handles permits, inspections, and finish quality.',
    about: 'Greenville is the economic center of the Upstate. Whether you are updating a bungalow near downtown, adding a screened porch in a suburban neighborhood, or building a detached garage, Burch Contracting brings 35+ years of local building experience.',
    neighborhoods: [
      { name: 'North Main & Augusta Road', detail: 'Established neighborhoods with renovation-friendly housing stock.' },
      { name: 'Taylors fringe', detail: 'Suburban lots suited for garages, decks, and additions.' },
    ],
    insights: ['Diverse housing stock from historic to new construction.', 'Strong remodeling and flood restoration demand.', 'City and county permit experience across Greenville.'],
    geo: { latitude: 34.8526, longitude: -82.3940 },
  },
  {
    slug: 'five-forks',
    name: 'Five Forks',
    state: 'SC',
    county: 'Greenville County',
    driveTime: '18 min from office',
    tagline: 'Family Friendly',
    highlight: 'Five Forks families often call us for screened porches, deck expansions, and room additions that add usable space without moving.',
    about: 'Five Forks is one of Greenville County\'s most family-oriented communities, with newer homes and active outdoor lifestyles. We build screened porches for bug-free summers, custom decks for entertaining, and additions that integrate with your home\'s existing design.',
    neighborhoods: [
      { name: 'Five Forks master plans', detail: 'Contemporary two-story homes built from the 2000s–present.' },
      { name: 'Nearby Simpsonville fringe', detail: 'Larger lots suited for detached garages and porches.' },
    ],
    insights: ['High concentration of families with school-age children.', 'Outdoor living projects are especially popular.', 'Strong resale market supports addition investments.'],
    geo: { latitude: 34.8043, longitude: -82.2296 },
  },
  {
    slug: 'woodruff',
    name: 'Woodruff',
    state: 'SC',
    county: 'Spartanburg County',
    driveTime: '20 min from office',
    tagline: 'Historic Charm',
    highlight: 'We have completed bath remodels, deck builds, and addition projects throughout Woodruff — Scott knows Spartanburg County codes and inspection requirements.',
    about: 'Woodruff offers small-town living with convenient access to Greenville and Spartanburg. Homeowners here hire Burch Contracting for kitchen and bath remodels, composite decks, room additions, and garage construction with straightforward pricing.',
    neighborhoods: [
      { name: 'Downtown Woodruff', detail: 'Traditional homes with renovation and modernization potential.' },
      { name: 'Highway 101 corridors', detail: 'Ranch homes and newer builds on larger lots.' },
    ],
    insights: ['Spartanburg County permitting experience.', 'Bath and kitchen remodels are common requests.', 'Composite decks popular for low-maintenance outdoor living.'],
    geo: { latitude: 34.7396, longitude: -82.0371 },
  },
  {
    slug: 'laurens',
    name: 'Laurens',
    state: 'SC',
    county: 'Laurens County',
    driveTime: '25 min from office',
    tagline: 'County Seat',
    highlight: 'Laurens County is our backyard — our office in Gray Court sits right in the heart of the county we have served since 1995.',
    about: 'Laurens is the county seat and a hub for surrounding rural and suburban communities. We build room additions, detached garages, and remodeling projects for Laurens homeowners who want a local contractor accountable for every detail.',
    neighborhoods: [
      { name: 'City of Laurens', detail: 'Historic downtown homes and mid-century neighborhoods.' },
      { name: 'Rural Laurens County', detail: 'Larger parcels ideal for detached garages and ADUs.' },
    ],
    insights: ['County seat with established residential core.', 'Rural properties suited for workshop garages.', 'Local contractor with Laurens County experience.'],
    geo: { latitude: 34.4990, longitude: -82.0143 },
  },
  {
    slug: 'gray-court',
    name: 'Gray Court',
    state: 'SC',
    county: 'Laurens County',
    driveTime: 'Our office location',
    tagline: 'Our Office Location',
    highlight: 'Gray Court is home to Burch Contracting\'s office at 1095 Water Tank Rd — when you hire us here, you are hiring your neighbor.',
    about: 'Gray Court is where Scott Burch built his reputation — a rural Laurens County community where word-of-mouth and repeat customers drive the business. Garages, additions, decks, and remodels for Gray Court homeowners get the shortest response times and most direct access to Scott on site.',
    neighborhoods: [
      { name: 'Gray Court & surrounds', detail: 'Rural residential properties with room for detached structures.' },
      { name: 'Water Tank Rd area', detail: 'Our office location — central to Laurens County projects.' },
    ],
    insights: ['Burch Contracting office is located here.', 'Fastest response times for local homeowners.', 'Rural and suburban project experience since 1995.'],
    geo: { latitude: 34.6082, longitude: -82.1134 },
    isOffice: true,
  },
]

export const CORE_SERVICES = [
  { name: 'Custom Decks', anchor: 'decks', summary: 'Wood and composite decks for outdoor entertaining.' },
  { name: 'Screened Porches', anchor: 'screened-porches', summary: 'Aluminum and wood-framed bug-free outdoor living.' },
  { name: 'Garages', anchor: 'garages', summary: 'Attached and detached garage construction.' },
  { name: 'Room Additions', anchor: 'additions', summary: 'Ground-floor and second-story home expansions.' },
  { name: 'Remodeling', anchor: 'remodeling', summary: 'Kitchen, bath, basement, and whole-home remodels.' },
  { name: 'Commercial', anchor: 'commercial', summary: 'Office upfits and tenant improvements.' },
]

export const GLOBAL_FAQS = [
  {
    question: 'Is Burch Contracting a licensed general contractor in South Carolina?',
    answer: 'Yes. Burch Contracting holds SC General Contractor License #CLG118679. Scott Burch has been a licensed residential builder since 1995 and a licensed general contractor since 2014. The company is fully insured and BBB A+ rated.',
  },
  {
    question: 'What areas does Burch Contracting serve in Upstate SC?',
    answer: 'Burch Contracting serves Simpsonville, Fountain Inn, Mauldin, Greenville, Five Forks, Woodruff, Laurens, Gray Court, and surrounding Upstate South Carolina communities. The office is located at 1095 Water Tank Rd, Gray Court, SC 29645.',
  },
  {
    question: 'How do I get a free consultation from Burch Contracting?',
    answer: 'Call (864) 724-4600 or submit the contact form at burchcontracting.com/contact.html. Scott will schedule a site visit, review your project scope, and provide a written estimate with price and timeline before work begins.',
  },
  {
    question: 'Does Scott Burch work on the job site?',
    answer: 'Yes. When you hire Burch Contracting, you work directly with Scott Burch — not a salesperson who disappears after you sign. Scott oversees projects and stays accountable for quality, code compliance, and communication.',
  },
  {
    question: 'What types of projects does Burch Contracting build?',
    answer: 'Burch Contracting builds custom decks, screened porches, detached and attached garages, room additions, ADUs, kitchen and bath remodels, basement finishing, flood restoration, and light commercial upfits across Upstate SC.',
  },
  {
    question: 'How much does a deck cost in Upstate SC?',
    answer: 'Custom decks in Upstate SC typically range from $33,000 to $58,000 depending on size, materials, railing, and site conditions. Use the deck cost calculator at burchcontracting.com/calculator/decks.html or request a free consultation for an exact quote.',
  },
  {
    question: 'How much does a screened porch cost in Simpsonville SC?',
    answer: 'Screened porches in Simpsonville and surrounding areas typically run $20,000 to $55,000 for new construction. Converting an existing deck can save 25–30%. Use the porch calculator at burchcontracting.com/calculator/porch.html for a planning estimate.',
  },
  {
    question: 'How much does a detached garage cost in Upstate SC?',
    answer: 'Detached two-car garages in Upstate SC commonly range from $60,000 to $108,000 depending on size, foundation, finishes, and electrical. Use the garage calculator at burchcontracting.com/calculator/garages.html or contact us for a detailed quote.',
  },
  {
    question: 'How much does a room addition cost per square foot?',
    answer: 'Room additions in Upstate SC typically cost $150 to $300 per square foot depending on scope, structural work, finishes, and HVAC integration. A 400 sq ft addition often falls between $60,000 and $120,000. Use the addition calculator for a planning range.',
  },
  {
    question: 'Does Burch Contracting handle permits and inspections?',
    answer: 'Yes. Burch Contracting pulls required building permits, coordinates HOA approvals when needed, and schedules inspections through local jurisdictions in Greenville, Laurens, and Spartanburg counties.',
  },
  {
    question: 'What is Burch Contracting\'s BBB and Google rating?',
    answer: 'Burch Contracting has a BBB A+ rating (since 2014) and a 5.0 Google rating based on verified customer reviews from homeowners across Upstate SC.',
  },
  {
    question: 'How long has Burch Contracting been in business?',
    answer: 'Scott Burch started in construction in 1987, received his residential builder\'s license in 1995, and founded Burch Contracting the same year. The company has served Upstate SC homeowners for more than 35 years.',
  },
]

export const SERVICE_FAQS = [
  {
    category: 'Decks',
    faqs: [
      {
        question: 'What deck materials does Burch Contracting install?',
        answer: 'Burch Contracting builds decks with pressure-treated lumber, hardwood, and composite materials such as Trex. Material choice depends on budget, maintenance preference, and how you plan to use the space.',
      },
      {
        question: 'How long does it take to build a custom deck?',
        answer: 'Most custom decks take 3 to 5 weeks from permit approval to completion, depending on size, complexity, and weather. Scott provides a timeline in your written estimate.',
      },
    ],
  },
  {
    category: 'Screened Porches',
    faqs: [
      {
        question: 'What is the difference between aluminum and wood screened porches?',
        answer: 'Aluminum framing is rust-resistant and low-maintenance with a 30+ year lifespan. Wood framing allows custom columns and trim to match traditional homes. Both options provide bug-free outdoor living.',
      },
      {
        question: 'Can you convert my existing deck into a screened porch?',
        answer: 'Yes. Deck conversions are often 25–30% less expensive than new porch construction when the existing structure can support the roof and screen system. Scott evaluates your deck during the site visit.',
      },
    ],
  },
  {
    category: 'Garages',
    faqs: [
      {
        question: 'Does Burch Contracting build detached and attached garages?',
        answer: 'Yes. Burch Contracting builds both attached and detached garages including two-car, three-car, and workshop configurations with options for electrical, insulation, and custom door placements.',
      },
    ],
  },
  {
    category: 'Additions & Remodeling',
    faqs: [
      {
        question: 'Can Burch Contracting match my existing home when building an addition?',
        answer: 'Yes. Architectural matching — roofline, siding, windows, and trim — is a standard part of every room addition we build so the new space looks original to the home.',
      },
      {
        question: 'Does Burch Contracting do kitchen and bathroom remodels?',
        answer: 'Yes. Kitchen and bath renovations are core services including demolition, plumbing, tile, cabinetry, flooring, and finish work. Bath-to-shower conversions are one of our most requested remodel projects.',
      },
    ],
  },
]

export function cityFaqs(area) {
  return [
    {
      question: `Does Burch Contracting serve ${area.name}, ${area.state}?`,
      answer: `Yes. Burch Contracting actively serves ${area.name}, ${area.state} and ${area.county}. ${area.highlight}`,
    },
    {
      question: `How far is Burch Contracting from ${area.name}, SC?`,
      answer: `Burch Contracting is ${area.driveTime} from ${area.name}. Our office is at 1095 Water Tank Rd, Gray Court, SC 29645.`,
    },
    {
      question: `What home improvement services are available in ${area.name}, SC?`,
      answer: `Homeowners in ${area.name} hire Burch Contracting for custom decks, screened porches, garage construction, room additions, kitchen and bath remodeling, basement finishing, and commercial upfits.`,
    },
    {
      question: `Is Burch Contracting licensed to work in ${area.county}?`,
      answer: `Yes. Burch Contracting holds SC General Contractor License #CLG118679 and pulls permits in ${area.county} and surrounding jurisdictions. The company is fully insured with BBB A+ rating.`,
    },
    {
      question: `How do I get a construction estimate in ${area.name}, SC?`,
      answer: `Call (864) 724-4600 or request an estimate at burchcontracting.com/contact.html. Scott Burch will visit your ${area.name} property and provide a written quote with scope, price, and timeline.`,
    },
  ]
}

export function faqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}