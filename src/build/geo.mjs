import {
  SITE,
  SERVICE_AREAS,
  CORE_SERVICES,
  GLOBAL_FAQS,
  SERVICE_FAQS,
  cityFaqs,
  faqPageSchema,
  PERMIT_OFFICES,
  SC_BUILDING_CODES_COUNCIL_URL,
  CITY_PROJECTS,
  LOCAL_CONDITIONS,
} from '../data/geo-aeo.js'
import { SERVICES, servicesByTier } from '../data/services.js'
import { COST_GUIDES } from '../data/guides-cost.js'
import { ARTICLES } from '../data/guides-articles.js'
import { LOCAL_BUSINESS_SCHEMA, ORGANIZATION_SCHEMA, SCOTT_PERSON_SCHEMA, articleSchema } from '../data/site-schema.js'
import { SITE_ORIGIN, pageUrl } from '../data/url-map.js'
import { footer, header } from '../chrome/index.mjs'
import { serviceDates } from './content-dates.mjs'


// The content-dates keys this module reads. The dates themselves arrive as a
// render() / renderSitemap() argument.
//
// Both used to be module-level constants read from a committed
// content-dates.js, each with a `?? { '2026-07-19' }` fallback. That fallback
// is how the sitemap once carried the site relaunch date on every service-area
// URL: the dates file was stale, nothing said so, and the fallback supplied a
// confident wrong answer. src/build/content-dates.mjs throws instead.
const AREA_KEY = '__datafile__src/data/geo-aeo.js'
const SERVICES_KEY = '__datafile__src/data/services.js'
const COST_KEY = '__datafile__src/data/guides-cost.js'
const BLOG_KEY = '__datafile__src/data/guides-articles.js'

function esc(value) {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function seoHead({ title, description, canonical, ogImage = SITE.ogImage }) {
  const image = `${SITE.domain}${ogImage}`
  return `    <meta name="robots" content="index, follow" />
    <meta name="description" content="${esc(description)}" />
    <title>${esc(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <meta name="theme-color" content="#1d4ed8" />
    <meta name="google-site-verification" content="ntiguLhlJqrZC6Iwzu-HD4CGZrBaofiBXgsdc-F8B0w" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE.name}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />`
}



/**
 * The services every area page lists, in tier order (Phase 6.4) — the same
 * sort as the nav, footer and homepage grid, so a city page cannot lead with
 * decks while the site leads with bathrooms. Feeds the visible list, the
 * at-a-glance table and the Service node's serviceType, so the three agree.
 */
function coreServicesByTier() {
  const order = servicesByTier().map((s) => s.id)
  const dead = CORE_SERVICES.filter((s) => !order.includes(s.id))
  if (dead.length) throw new Error(`geo-aeo.js CORE_SERVICES: no service has id ${dead.map((s) => `'${s.id}'`).join(', ')}`)
  return [...CORE_SERVICES].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
}

/** One string for the H1 and the Article headline, which must match. */
function areaHeadline(area) {
  return `Bathroom & Kitchen Remodeling, Additions & More in ${area.name}, SC`
}

function authorBox(cityName, areaDates) {
  // cityName is 'Upstate SC' itself on faqs.html (a sitewide page, not a
  // single city) — "serving Upstate SC, SC and Upstate SC" reads as a typo,
  // so that one case drops the redundant second clause.
  const servingLine =
    cityName === 'Upstate SC'
      ? '30+ years serving Upstate SC.'
      : `30+ years serving ${esc(cityName)}, SC and Upstate SC.`
  return `          <aside class="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name">${SITE.owner}</h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #${SITE.license} | NC Licensed (Limited) #${SITE.licenseNC} | ${servingLine} Scott Burch oversees every project with transparent pricing and hands-on job-site accountability.</p>
            <p class="text-slate-500 text-xs mt-3">Published: <time datetime="${areaDates.datePublished}">${areaDates.datePublished}</time> &middot; Last reviewed: <time datetime="${areaDates.dateModified}">${areaDates.dateModified}</time></p>
          </aside>`
}

function faqHtml(faqs, idPrefix = 'faq') {
  return faqs
    .map(
      (faq, index) => `            <details class="group bg-white border border-slate-200 rounded-xl p-5 open:border-blue-200 open:shadow-sm" id="${idPrefix}-${index}">
              <summary class="font-semibold text-slate-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>${esc(faq.question)}</span>
                <span class="text-blue-700 text-lg leading-none group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
              </summary>
              <p class="mt-4 text-slate-600 text-sm leading-relaxed">${esc(faq.answer)}</p>
            </details>`
    )
    .join('\n')
}

// Collected across all 8 area pages, printed at the end for
// CITABILITY-FACTS-NEEDED.md — see Phase 5 notes there.
const areaFactsNeeded = []

// Real, county-specific permit process — not the same paragraph reworded
// per city. Greenville/Laurens County link to their real permit offices
// (same links already used in faqs.html); Spartanburg County (Woodruff)
// names the real jurisdiction but has no verified office link yet, so
// that's flagged rather than guessed.
function permitsSectionHtml(area) {
  const office = PERMIT_OFFICES[area.county]
  if (!office) throw new Error(`${area.slug}: no PERMIT_OFFICES entry for county "${area.county}"`)
  if (!office.url) {
    areaFactsNeeded.push({ area: area.name, field: `Verified ${area.county} building permits office URL (page currently omits the link, names the county only)` })
  }
  const officeLinkHtml = office.url
    ? `<a href="${esc(office.url)}" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">${esc(office.name)}</a>`
    : esc(office.name)
  return `      <section class="bg-slate-50 py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Permits in ${esc(area.name)}, ${esc(area.county)}</h2>
          <p class="text-slate-600 leading-relaxed">Projects in ${esc(area.name)} fall under ${officeLinkHtml}, working from the <a href="${SC_BUILDING_CODES_COUNCIL_URL}" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">South Carolina Building Codes Council</a>'s statewide code. As a licensed general contractor (SC #${esc(SITE.license)}), Burch Contracting pulls the required permits and schedules inspections through ${esc(area.county)} directly, so you don't have to.</p>
        </div>
      </section>`
}

// Real completed projects for this city where they exist (see
// CITY_PROJECTS in geo-aeo.js — the same facts power projects.html's
// case-study cards); an honest FACT-NEEDED prompt where they don't. Per
// the ground rules, an empty flagged section beats invented local detail.
function cityProjectsSectionHtml(area) {
  const projects = CITY_PROJECTS[area.slug]
  if (projects?.length) {
    const cards = projects
      .map(
        (p) => `            <div class="bg-white border border-slate-200 rounded-xl p-6">
              <p class="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-2">${esc(p.category)}</p>
              <h3 class="font-bold text-slate-900 text-lg mb-2">${esc(p.title)}</h3>
              <p class="text-slate-600 text-sm leading-relaxed">${esc(p.description)}</p>
            </div>`
      )
      .join('\n')
    return `      <section class="bg-white py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Recent ${esc(area.name)} Projects</h2>
          <p class="text-slate-600 mb-6">See the full write-up on our <a href="/projects" class="text-blue-700 hover:text-blue-800 underline">projects page</a>.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
${cards}
          </div>
        </div>
      </section>`
  }
  areaFactsNeeded.push({ area: area.name, field: '2-3 real completed projects in this specific city (scope, and a cost band if comfortable sharing) — no filler written in the meantime' })
  // No project data for this city yet — omit the section entirely rather
  // than render a "being finalized" stub. Adding an entry to CITY_PROJECTS
  // brings the real section back automatically (see the branch above).
  return ''
}

// Local building conditions — genuinely new per-city facts (soil, slope,
// HOA prevalence, flood risk) that don't exist anywhere else on the site
// yet. 100% FACT-NEEDED by design: writing plausible-sounding claims here
// (e.g. guessing at soil type) is exactly the kind of invented local
// detail the ground rules call out as most damaging to contractor trust.
const LOCAL_CONDITION_FIELDS = ['Typical soil/site conditions', 'Typical lot slope', 'How common HOA review is', 'Flood zone / drainage considerations']
function localConditionsSectionHtml(area) {
  const data = LOCAL_CONDITIONS[area.slug] || {}
  const rows = []
  for (const field of LOCAL_CONDITION_FIELDS) {
    const value = data[field]
    if (value) {
      rows.push(`                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">${esc(field)}</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(value)}</td>
                </tr>`)
    } else {
      areaFactsNeeded.push({ area: area.name, field })
    }
  }
  // No populated rows for this city yet — omit the whole section (heading,
  // intro, and table) rather than render an all-placeholder table. Adding
  // any field to LOCAL_CONDITIONS for this city brings the section back
  // automatically, with only the still-missing fields flagged as FACT-NEEDED.
  if (!rows.length) return ''
  return `      <section class="bg-slate-50 py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Local Building Conditions in ${esc(area.name)}</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Site-specific factors we account for when we scope a ${esc(area.name)} project</caption>
              <tbody>
${rows.join('\n')}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
}

function serviceAreaPage(area, areaDates) {
  const faqs = cityFaqs(area)
  // Same promotion pattern as src/build/services.mjs: the first 2 city FAQs
  // (does-Burch-serve-this-city + drive-time, per cityFaqs()'s own order)
  // get a visible <h2> question heading right under the hero instead of
  // only living in the accordion further down — an accordion <summary>
  // isn't a heading, so it wasn't satisfying "H1/H2 phrased as a question"
  // even though the text was already there. Nothing is removed from the
  // accordion's content set for FAQPage schema purposes; the remaining 3
  // stay visible in the accordion below.
  // 4, not 2: Phase 2's own acceptance bar is "no fewer than 4 question-form
  // headings" per page. cityFaqs() always returns 5, so this leaves exactly
  // 1 in the accordion below.
  const promotedFaqs = faqs.slice(0, 4)
  const remainingFaqs = faqs.slice(4)
  const promotedFaqSectionHtml = promotedFaqs.length
    ? `      <section class="bg-slate-50 py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
${promotedFaqs
        .map(
          (faq) => `          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">${esc(faq.question)}</h2>
            <p class="text-slate-600 leading-relaxed">${esc(faq.answer)}</p>
          </div>`
        )
        .join('\n')}
        </div>
      </section>
`
    : ''
  const canonical = `${SITE_ORIGIN}${pageUrl(`service-areas/${area.slug}.html`)}`
  // ≤60 characters (check-build check 13): the suffix and "| Additions & More"
  // cut the city off in search results at 83-88.
  const title = `Bathroom & Kitchen Remodeling in ${area.name}, SC`
  // Leads with a number (drive time) per Phase 7 — real, area-specific, and
  // distinct per city rather than a reworded generic opener.
  const driveTimeLead = area.driveTime === 'Our office location' ? 'Our home office' : `${area.driveTime.replace(' from office', '')} from our office`
  const description = `${driveTimeLead} — bathroom & kitchen remodeling, additions & more in ${area.name}, SC. SC Licensed #${SITE.license}, BBB A+, free consultations.`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      LOCAL_BUSINESS_SCHEMA,
      ORGANIZATION_SCHEMA,
      SCOTT_PERSON_SCHEMA,
      faqPageSchema(faqs),
      {
        '@type': 'Service',
        name: `Home Improvement Contractor in ${area.name}, SC`,
        provider: { '@id': `${SITE.domain}/#business` },
        areaServed: {
          '@type': 'City',
          name: area.name,
          containedInPlace: { '@type': 'AdministrativeArea', name: area.county },
        },
        serviceType: coreServicesByTier().map((s) => s.name),
      },
      articleSchema({
        headline: areaHeadline(area),
        description,
        url: canonical,
        datePublished: areaDates.datePublished,
        dateModified: areaDates.dateModified,
      }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.domain}/` },
          { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${SITE.domain}/#service-areas` },
          { '@type': 'ListItem', position: 3, name: `${area.name}, SC`, item: canonical },
        ],
      },
    ],
  }

  const neighborhoods = area.neighborhoods
    .map(
      (n) => `              <li class="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <h3 class="font-bold text-slate-900 mb-2">${esc(n.name)}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">${esc(n.detail)}</p>
              </li>`
    )
    .join('\n')

  const insights = area.insights.map((item) => `              <li class="flex items-start gap-2 text-slate-700 text-sm"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#10003;</span><span>${esc(item)}</span></li>`).join('\n')

  const services = coreServicesByTier().map(
    (service) => `              <li class="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-colors">
                <h3 class="font-bold text-slate-900 mb-2">${esc(service.name)}</h3>
                <p class="text-slate-600 text-sm mb-3">${esc(service.summary)}</p>
                <a href="${service.url}" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">Learn more &rarr;</a>
              </li>`
  ).join('\n')

  const areaLinks = SERVICE_AREAS.filter((a) => a.slug !== area.slug)
    .map(
      (a) => `            <a href="${pageUrl(`service-areas/${a.slug}.html`)}" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">${esc(a.name)}</a>`
    )
    .join('\n')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoHead({ title, description, canonical })}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" /></noscript>
    <link rel="stylesheet" href="/src/css/main.css" />
  </head>
  <body class="font-sans text-slate-800 bg-white antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
${header(new URL(canonical).pathname)}
    <main id="main-content">
      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="mb-4" aria-label="Breadcrumb">
            <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li><a href="/#service-areas" class="hover:text-white transition-colors">Service Areas</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li class="text-slate-200" aria-current="page">${esc(area.name)}, SC</li>
            </ol>
          </nav>
          <p class="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">Service Area: ${esc(area.name)}, SC</p>
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">${esc(areaHeadline(area))}</h1>
          <p class="text-xl text-slate-300 max-w-3xl mb-8">${esc(area.highlight)}</p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="/contact" class="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get Free Consultation</a>
            <a href="tel:${SITE.phoneTel}" class="border border-white/25 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">${SITE.phone}</a>
          </div>
        </div>
      </section>

${promotedFaqSectionHtml}
      <section class="bg-white py-16 lg:py-20 border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">About ${esc(area.name)}</h2>
            <p class="text-slate-600 leading-relaxed mb-6">${esc(area.about)}</p>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">County</span><span class="font-semibold text-slate-900">${esc(area.county)}</span></li>
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">Drive Time</span><span class="font-semibold text-slate-900">${esc(area.driveTime)}</span></li>
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">Tagline</span><span class="font-semibold text-slate-900">${esc(area.tagline)}</span></li>
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">Licenses</span><span class="font-semibold text-slate-900">SC #${SITE.license} &middot; NC #${SITE.licenseNC}</span></li>
            </ul>
          </div>
          <aside class="bg-slate-50 border border-slate-100 rounded-2xl p-6 h-fit">
            <h3 class="font-bold text-slate-900 mb-4">Local Insights</h3>
            <ul class="space-y-3">
${insights}
            </ul>
          </aside>
        </div>
      </section>

      <section class="bg-slate-50 py-16 lg:py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-8">Neighborhoods We Serve in ${esc(area.name)}</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
${neighborhoods}
          </ul>
        </div>
      </section>

      <section class="bg-white py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">${esc(area.name)}, SC Service Snapshot</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Quick facts for Burch Contracting projects in ${esc(area.name)}, SC</caption>
              <tbody>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">County</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(area.county)}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Drive Time from Our Gray Court Office</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${esc(area.driveTime)}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Neighborhoods Served</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${area.neighborhoods.map((n) => esc(n.name)).join('; ')}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Core Services Offered</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">${coreServicesByTier().map((s) => esc(s.name)).join('; ')}</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Contractor Licenses</th>
                  <td class="px-4 py-3 text-slate-600 text-sm">SC #${SITE.license} &middot; NC #${SITE.licenseNC}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

${permitsSectionHtml(area)}
${cityProjectsSectionHtml(area)}
${localConditionsSectionHtml(area)}
      <section class="bg-white py-16 lg:py-20 border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-8">Our Services in ${esc(area.name)}</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
${services}
          </ul>
        </div>
      </section>

      <section class="bg-slate-50 py-16 lg:py-20" aria-labelledby="faqs-${area.slug}">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faqs-${area.slug}" class="text-3xl font-bold text-slate-900 mb-3">More ${esc(area.name)}, SC Questions</h2>
          <p class="text-slate-600 mb-8">Direct answers for homeowners and AI search — licensed, local, and accountable.</p>
          <div class="space-y-4">
${faqHtml(remainingFaqs, area.slug)}
          </div>
${authorBox(area.name, areaDates)}
          <p class="mt-6 text-center"><a href="/faqs" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">View all FAQs &rarr;</a></p>
        </div>
      </section>

      <section class="bg-white py-12 border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-lg font-bold text-slate-900 mb-4">More Service Areas</h2>
          <div class="flex flex-wrap gap-3">
${areaLinks}
          </div>
        </div>
      </section>

      <section class="bg-blue-700 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-2xl lg:text-3xl font-bold mb-4">Ready to Start Your ${esc(area.name)} Project?</h2>
          <p class="text-blue-100 mb-8 max-w-xl mx-auto">Contact us for a free consultation. We are proud to serve ${esc(area.name)}, SC with quality craftsmanship and reliable service.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" class="inline-block bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold transition-colors">Request Free Consultation</a>
            <a href="tel:${SITE.phoneTel}" class="inline-block border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-bold transition-colors">Call Now</a>
          </div>
        </div>
      </section>
    </main>
${footer}
  </body>
</html>`
}

function faqsPage(areaDates) {
  const canonical = `${SITE_ORIGIN}${pageUrl('faqs.html')}`
  const title = 'FAQs | Burch Contracting Upstate SC Contractor'
  const allFaqs = [
    ...GLOBAL_FAQS,
    ...SERVICE_FAQS.flatMap((group) => group.faqs),
  ]
  // Leads with a number (the real, computed count) per Phase 7.
  const description = `${allFaqs.length} real answers on costs, permits, decks, additions and garages in Upstate SC, from a licensed contractor. SC Licensed #${SITE.license}, BBB A+.`

  // Same promotion pattern as service/service-area pages: first 2 global
  // FAQs (licensing + service area, per GLOBAL_FAQS's own order) become a
  // visible <h2> question heading right under the hero; the rest stay in
  // the "General Questions" accordion below.
  const promotedFaqs = GLOBAL_FAQS.slice(0, 4)
  const remainingGlobalFaqs = GLOBAL_FAQS.slice(4)
  const promotedFaqSectionHtml = `      <section class="bg-slate-50 py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
${promotedFaqs
    .map(
      (faq) => `          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">${esc(faq.question)}</h2>
            <p class="text-slate-600 leading-relaxed">${esc(faq.answer)}</p>
          </div>`
    )
    .join('\n')}
        </div>
      </section>
`

  const globalSection = faqHtml(remainingGlobalFaqs, 'global')
  const serviceSections = SERVICE_FAQS.map(
    (group) => `          <div class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-5">${esc(group.category)}</h2>
            <div class="space-y-4">
${faqHtml(group.faqs, group.category.toLowerCase().replace(/\s+/g, '-'))}
            </div>
          </div>`
  ).join('\n')

  const areaLinks = SERVICE_AREAS.map(
    (area) => `            <a href="${pageUrl(`service-areas/${area.slug}.html`)}" class="rounded-xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <h3 class="font-bold text-slate-900">${esc(area.name)}</h3>
              <p class="text-sm text-slate-500 mt-1">${esc(area.county)} &middot; ${esc(area.driveTime)}</p>
            </a>`
  ).join('\n')

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      LOCAL_BUSINESS_SCHEMA,
      ORGANIZATION_SCHEMA,
      SCOTT_PERSON_SCHEMA,
      articleSchema({
        headline: 'Frequently Asked Questions',
        description,
        url: canonical,
        datePublished: areaDates.datePublished,
        dateModified: areaDates.dateModified,
      }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.domain}/` },
          { '@type': 'ListItem', position: 2, name: 'FAQs', item: canonical },
        ],
      },
      faqPageSchema(allFaqs),
    ],
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoHead({ title, description, canonical })}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" /></noscript>
    <link rel="stylesheet" href="/src/css/main.css" />
  </head>
  <body class="font-sans text-slate-800 bg-white antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
${header(new URL(canonical).pathname)}
    <main id="main-content">
      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="mb-4" aria-label="Breadcrumb">
            <ol class="flex items-center gap-2 text-sm text-slate-400">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li class="text-slate-200" aria-current="page">FAQs</li>
            </ol>
          </nav>
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p class="text-xl text-slate-300 max-w-3xl">Clear answers about pricing, licensing, service areas, and project types — from C. Scott Burch, owner of Burch Contracting.</p>
        </div>
      </section>

${promotedFaqSectionHtml}
      <section class="bg-white py-16 lg:py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-5">General Questions</h2>
          <div class="space-y-4 mb-12">
${globalSection}
          </div>
${serviceSections}
${authorBox('Upstate SC', areaDates)}
          <div class="mt-10 overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Building permit &amp; code offices for counties Burch Contracting serves</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Jurisdiction</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Office</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Statewide (SC)</th>
                  <td class="px-4 py-3 text-sm"><a href="https://llr.sc.gov/bcc/" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">South Carolina Building Codes Council</a></td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Greenville County</th>
                  <td class="px-4 py-3 text-sm"><a href="https://www.greenvillecounty.org/buildingsafety/Permits.aspx" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">Greenville County building permits</a></td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">Laurens County</th>
                  <td class="px-4 py-3 text-sm"><a href="https://www.laurenscountysc.gov/departments/building_codes/permits___documents.php" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">Laurens County building permits &amp; documents</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="bg-slate-50 py-16 lg:py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-8 text-center">City-Specific FAQs</h2>
          <p class="text-center text-slate-600 mb-10 max-w-2xl mx-auto">Each service area page includes localized questions about permits, drive time, and project types in your community.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
${areaLinks}
          </div>
        </div>
      </section>

      <section class="bg-blue-700 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-2xl lg:text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p class="text-blue-100 mb-8 max-w-xl mx-auto">Call Scott directly or request a free site visit anywhere in Upstate SC.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" class="inline-block bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold transition-colors">Get Free Consultation</a>
            <a href="tel:${SITE.phoneTel}" class="inline-block border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-bold transition-colors">${SITE.phone}</a>
          </div>
        </div>
      </section>
    </main>
${footer}
  </body>
</html>`
}

// lastmod must equal the actual page's actual last content change, not the
// date the sitemap happened to be built — a blanket build-date stamp on
// every URL is exactly what makes Google stop trusting (and eventually
// ignore) lastmod across the whole file. Real per-page dates come from
// the dates passed in, which src/build/content-dates.mjs derives from git on
// every build. changefreq/priority are dropped entirely per Google's own
// guidance that both are ignored.
/**
 * Every public URL paired with the date entry it takes lastmod from.
 *
 * Exported because scripts/dates-set-by-head.mjs needs the same mapping to
 * answer "which pages does __datafile__src/data/geo-aeo.js actually reach".
 * That script read the previously built sitemap for it, so a stale build
 * artifact silently answered "none" — it reported one date key and no URLs,
 * which is the understatement the script exists to prevent. Deriving the report
 * and the sitemap from one function means they cannot disagree.
 */
export function sitemapEntries(dates) {
  // Hand-authored static pages: the second element is the page's own key in
  // the dates map. Generated pages (faqs.html, service pages, service-area
  // pages) get their driving data file's shared pair instead.
  const staticPages = [
    ['/', 'index.html'],
    ['/services', 'services.html'],
    ['/projects', 'projects.html'],
    ['/about', 'about.html'],
    ['/contact', 'contact.html'],
    ['/faqs', dates[AREA_KEY]],
    ['/calculator/decks', 'calculator/decks.html'],
    ['/calculator/garages', 'calculator/garages.html'],
    ['/calculator/porch', 'calculator/porch.html'],
    ['/calculator/additions', 'calculator/additions.html'],
    ['/calculator/estimate', 'calculator/estimate.html'],
    ['/calculator/kitchen-remodel', 'calculator/kitchen-remodel.html'],
    ['/calculator/bath-remodel', 'calculator/bath-remodel.html'],
    ['/calculator/whole-home-remodel', 'calculator/whole-home-remodel.html'],
    ['/calculator/ada-bath-shower', 'calculator/ada-bath-shower.html'],
    ['/calculator/basement-finishing', 'calculator/basement-finishing.html'],
    ['/calculator/covered-patios', 'calculator/covered-patios.html'],
    ['/privacy-policy', 'privacy-policy.html'],
    ['/terms-of-service', 'terms-of-service.html'],
  ].map(([path, dateKeyOrDates]) => [
    path,
    typeof dateKeyOrDates === 'string' ? dates[dateKeyOrDates] : dateKeyOrDates,
  ])

  // Derived from SERVICES (src/data/services.js) so every dedicated
  // service page — including future ones — is automatically indexed
  // without needing to remember to update this list by hand.
  // Both lists read their URLs from src/data/url-map.js, so the sitemap can
  // only ever list the final, non-redirecting address of each page.
  const servicePages = SERVICES.map((service) => [pageUrl(`${service.slug}/index.html`), serviceDates(dates, service)])

  const areaPages = SERVICE_AREAS.map((area) => [pageUrl(`service-areas/${area.slug}.html`), dates[AREA_KEY]])

  // Cost guides and articles (src/build/guides.mjs). Derived from the
  // same data the generator uses, so a restored guide can't be published and
  // then left out of the sitemap. Their datePublished is the archived original
  // (see RESTORED_PUBLISHED there); lastmod here is the data file's real git
  // dateModified, which is what lastmod is actually for.
  const guideDates = {
    cost: dates[COST_KEY],
    blog: dates[BLOG_KEY],
  }
  const guidePages = [
    [pageUrl('cost/index.html'), guideDates.cost],
    ...COST_GUIDES.map((guide) => [pageUrl(`cost/${guide.slug}.html`), guideDates.cost]),
    [pageUrl('blog/index.html'), guideDates.blog],
    ...ARTICLES.map((guide) => [pageUrl(`blog/${guide.slug}.html`), guideDates.blog]),
  ]

  return [...staticPages, ...servicePages, ...areaPages, ...guidePages]
}

function generateSitemap(dates) {
  const urls = sitemapEntries(dates)
    .map(
      ([path, entry]) => `  <url>
    <loc>${SITE.domain}${path}</loc>
    <lastmod>${entry.dateModified}</lastmod>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

/**
 * Pure render: data in, pages out. No filesystem, no side effects.
 *
 * areaFactsNeeded is module-level state that the page builders append to as
 * they run, so calling render() twice used to double it. It is cleared here and
 * returned alongside the pages, which makes render() genuinely repeatable
 * rather than only correct on first call.
 *
 * faqs.html is a generated page and rides in the same list as the eight service
 * areas — it is not special, and treating it as such is how it ended up
 * hand-maintained-looking in a repo that generates everything else.
 */
export function render({ dates }) {
  areaFactsNeeded.length = 0
  const areaDates = dates[AREA_KEY]
  if (!areaDates) throw new Error(`geo: no content dates under ${AREA_KEY}`)

  const pages = SERVICE_AREAS.map((area) => ({
    url: pageUrl(`service-areas/${area.slug}.html`),
    file: `service-areas/${area.slug}.html`,
    html: serviceAreaPage(area, areaDates),
  }))

  pages.push({
    url: pageUrl('faqs.html'),
    file: 'faqs.html',
    html: faqsPage(areaDates),
  })

  return { pages, factsNeeded: [...areaFactsNeeded] }
}

/**
 * The sitemap, deliberately a SEPARATE export rather than another entry in
 * pages[].
 *
 * It is not a page: it has its own destination, no chrome, and none of the
 * gates that apply to pages apply to it. Folding it into the page list would
 * mean Phase 3.2d swept it into .build/pages/ and vite tried to treat it as a
 * build input.
 *
 * Phase 3.2d routes this into the build output rather than public/, and Phase
 * 3.5 then drops public/sitemap.xml from git. It is a committed build artifact
 * today — the same anti-pattern as the committed generated HTML, and subject to
 * the same rule: if it can be built, it is built. check-build, check-links and
 * generate-cloudflare-files all read it from dist/, so nothing that consumes it
 * is affected.
 */
export function renderSitemap({ dates }) {
  for (const key of [AREA_KEY, SERVICES_KEY, COST_KEY, BLOG_KEY]) {
    if (!dates[key]) throw new Error(`sitemap: no content dates under ${key}`)
  }
  return generateSitemap(dates)
}
