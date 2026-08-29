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
    'Garage construction, room additions, screened porches, decks, remodeling, commercial upfits, insurance restoration, and ADA compliance in Upstate SC. Transparent pricing. SC Licensed #CLG118679 | NC Licensed (Limited) #107292.',
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
  geo: { '@type': 'GeoCoordinates', latitude: 34.6465, longitude: -82.1158 },
  openingHours: 'Mo-Fr 08:00-17:00',
  // LocalBusiness and Organization otherwise describe the same company
  // with no stated relationship between the two @ids — an ambiguous
  // entity graph. This is the one-line fix, done here so every page that
  // imports LOCAL_BUSINESS_SCHEMA picks it up automatically.
  parentOrganization: { '@id': 'https://burchcontracting.com/#organization' },
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
  identifier: [
    {
      '@type': 'PropertyValue',
      propertyID: 'SC Contractor License',
      value: 'CLG118679',
    },
    {
      '@type': 'PropertyValue',
      propertyID: 'NC Contractor License (Limited)',
      value: '107292',
    },
  ],
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

/**
 * Canonical Person node for Scott Burch, shared by every page's Article
 * schema (see articleSchema() below) via @id reference — same pattern
 * generate-services.mjs already used for its per-page Service.author before
 * this existed. One definition here so hasCredential/jobTitle can't drift
 * per page the way sameAs once did (see LOCAL_BUSINESS_SCHEMA comment).
 */
export const SCOTT_PERSON_SCHEMA = {
  '@type': 'Person',
  '@id': 'https://burchcontracting.com/#scott-burch',
  name: 'C. Scott Burch',
  jobTitle: 'Owner & Lead Contractor',
  url: 'https://burchcontracting.com/about.html',
  worksFor: { '@id': 'https://burchcontracting.com/#organization' },
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      recognizedBy: { '@type': 'Organization', name: 'South Carolina LLR' },
      identifier: 'CLG118679',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      recognizedBy: { '@type': 'Organization', name: 'North Carolina Licensing Board for General Contractors' },
      identifier: '107292',
    },
  ],
}

/**
 * Canonical WebSite node — the site as a whole, referenced by every page's
 * WebPage node via isPartOf (see webPageSchema() below).
 */
export const WEBSITE_SCHEMA = {
  '@type': 'WebSite',
  '@id': 'https://burchcontracting.com/#website',
  url: 'https://burchcontracting.com/',
  name: 'Burch Contracting',
  publisher: { '@id': ORGANIZATION_SCHEMA['@id'] },
}

/**
 * Article schema for a content page. datePublished/dateModified should come
 * from src/data/content-dates.js (real git-history-derived dates), not be
 * guessed — see that file's generator, scripts/compute-content-dates.mjs,
 * for why they're checked in rather than computed live at build time.
 *
 * Carries its own '@id' (url + '#article') so a page's WebPage node can
 * reference it via mainEntityOfPage without a second, redundant copy of
 * the same facts.
 */
export function articleSchema({ headline, description, url, datePublished, dateModified, image }) {
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: { '@id': SCOTT_PERSON_SCHEMA['@id'] },
    publisher: { '@id': ORGANIZATION_SCHEMA['@id'] },
    ...(image ? { image } : {}),
  }
}

/**
 * WebPage node for a page whose main content is the given Article — links
 * the two per Google's recommended CreativeWork/WebPage pairing instead of
 * leaving Article as a free-floating node with no page-level wrapper.
 */
export function webPageSchema({ url, name, articleId }) {
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    isPartOf: { '@id': WEBSITE_SCHEMA['@id'] },
    mainEntityOfPage: { '@id': articleId },
  }
}
