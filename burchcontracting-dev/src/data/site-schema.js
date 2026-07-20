/**
 * Canonical LocalBusiness + Organization JSON-LD nodes, shared by every
 * page generator (generate-services.mjs, generate-geo-aeo.mjs) so entity
 * data — address, geo, sameAs, license, areas served — can't drift between
 * generators the way it did before this file existed: the 13 service pages
 * and the 8 service-area + faqs.html pages had no LocalBusiness/Organization
 * node on the page at all, and service-area pages referenced "#business" by
 * @id without ever defining it anywhere — a dangling reference. Other pages
 * (index.html, about.html, services.html, calculator/*.html) are hand-authored
 * and already inline an identical copy of this same data; this file is not
 * wired into those, so keep this in sync with services.html's JSON-LD by
 * hand if the business's address, phone, or sameAs profiles ever change.
 */
export const LOCAL_BUSINESS_SCHEMA = {
  '@type': ['LocalBusiness', 'GeneralContractor'],
  '@id': 'https://burchcontracting.com/#business',
  name: 'Burch Contracting',
  url: 'https://burchcontracting.com/',
  image: 'https://burchcontracting.com/images/burch-contracting-logo.webp',
  logo: 'https://burchcontracting.com/images/burch-contracting-logo.webp',
  description:
    'Garage construction, room additions, screened porches, decks, remodeling, commercial upfits, insurance restoration, and ADA compliance in Upstate SC. Transparent pricing. SC Licensed #CLG118679.',
  telephone: '+18647244600',
  email: 'estimates@burchcontracting.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1095 Water Tank Rd',
    addressLocality: 'Gray Court',
    addressRegion: 'SC',
    postalCode: '29645',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 34.6082, longitude: -82.1134 },
  openingHours: 'Mo-Fr 08:00-17:00',
  areaServed: [
    { '@type': 'City', name: 'Simpsonville' },
    { '@type': 'City', name: 'Fountain Inn' },
    { '@type': 'City', name: 'Mauldin' },
    { '@type': 'City', name: 'Greenville' },
    { '@type': 'City', name: 'Five Forks' },
    { '@type': 'City', name: 'Woodruff' },
    { '@type': 'City', name: 'Laurens' },
    { '@type': 'City', name: 'Gray Court' },
  ],
  priceRange: '$$',
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'SC Contractor License',
    value: 'CLG118679',
  },
}

export const ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': 'https://burchcontracting.com/#organization',
  name: 'Burch Contracting',
  url: 'https://burchcontracting.com/',
  logo: 'https://burchcontracting.com/images/burch-contracting-logo.webp',
  sameAs: [
    'https://share.google/punCyIgljtaPkt03e',
    'https://www.facebook.com/BurchContracting',
    'https://www.instagram.com/burchcontracting',
    'https://www.linkedin.com/company/burch-contracting',
    'https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875',
  ],
}
