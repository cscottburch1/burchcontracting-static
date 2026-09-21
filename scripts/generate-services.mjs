import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SITE, SERVICES } from '../src/data/services.js'
import { SERVICE_FAQS } from '../src/data/service-faqs.js'
import { LOCAL_BUSINESS_SCHEMA, ORGANIZATION_SCHEMA, SCOTT_PERSON_SCHEMA, articleSchema } from '../src/data/site-schema.js'
import { CONTENT_DATES } from '../src/data/content-dates.js'
import { SITE_ORIGIN, pageUrl } from '../src/data/url-map.js'
import { footer, header } from '../src/chrome/index.mjs'

// Real git-history-derived dates for everything driven by services.js (see
// scripts/compute-content-dates.mjs). Falls back to LAST_UPDATED_ISO below
// if the dates file hasn't been (re)generated yet, so a missing/stale
// content-dates.js can't silently break the build.
const SERVICE_DATES = CONTENT_DATES?.['__datafile__src/data/services.js']

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Fallback only, used if src/data/content-dates.js is missing or doesn't
// have an entry yet — real dates now come from git history (see above).
const LAST_UPDATED_ISO = '2026-07-19'

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function seoHead({ title, description, canonical, ogImage = '/images/custom-deck-greenville-sc.webp' }) {
  const image = `${SITE.url}${ogImage}`
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



function authorBox() {
  const published = SERVICE_DATES?.datePublished ?? LAST_UPDATED_ISO
  const modified = SERVICE_DATES?.dateModified ?? LAST_UPDATED_ISO
  return `          <aside class="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name">${SITE.owner}</h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #${SITE.license} | NC Licensed (Limited) #${SITE.licenseNC} | ${SITE.experience} years | ${SITE.rating} Google Rating | BBB ${SITE.bbb} Rated</p>
            <p class="text-slate-500 text-xs mt-3">Published: <time datetime="${published}">${published}</time> &middot; Last reviewed: <time datetime="${modified}">${modified}</time></p>
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

function servicePage(service) {
  // Every URL comes from src/data/url-map.js, the single source of truth, so
  // a canonical can never point at a URL that itself redirects. These pages
  // build to {slug}/index.html and are served at /{slug} — the trailing-slash
  // and .html forms 301 here.
  const canonical = `${SITE_ORIGIN}${pageUrl(`${service.slug}/index.html`)}`
  // Nearly every service's <title> is just "{title} | Burch Contracting" —
  // service.metaTitle is an escape hatch for pages that need a geo-targeted
  // title tag distinct from the shorter nav/breadcrumb label in
  // service.title (e.g. "Bathroom Remodeling Simpsonville SC" vs. the
  // nav's plain "Bathroom Remodeling").
  const title = service.metaTitle ?? `${service.title} | Burch Contracting`
  const description = service.description
  const faqs = SERVICE_FAQS[service.id] || []

  const published = SERVICE_DATES?.datePublished ?? LAST_UPDATED_ISO
  const modified = SERVICE_DATES?.dateModified ?? LAST_UPDATED_ISO

  const serviceSchema = {
    '@type': 'Service',
    name: service.title,
    description: service.description,
    datePublished: published,
    dateModified: modified,
    author: { '@id': SCOTT_PERSON_SCHEMA['@id'] },
    provider: { '@id': LOCAL_BUSINESS_SCHEMA['@id'] },
    areaServed: {
      '@type': 'State',
      name: 'South Carolina',
    },
  }

  // Article node — the audit's "Article + Author" gap. Reuses the same
  // Service description/dates rather than hand-typing a second headline,
  // since they describe the same page and drifting them apart would just
  // be a second place for the description to go stale.
  const articleNode = articleSchema({
    headline: service.h1 ?? service.title,
    description: service.description,
    url: canonical,
    datePublished: published,
    dateModified: modified,
    image: service.heroImage ? `${SITE.url}${service.heroImage}` : undefined,
  })

  if (service.flatFee) {
    serviceSchema.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: service.flatFee.amount.replace(/[^0-9.]/g, ''),
      description: service.flatFee.credit,
    }
  }

  const schemaGraph = [LOCAL_BUSINESS_SCHEMA, ORGANIZATION_SCHEMA, SCOTT_PERSON_SCHEMA, serviceSchema, articleNode]

  if (service.howItWorks) {
    schemaGraph.push({
      '@type': 'HowTo',
      name: `How ${service.title} Works`,
      step: service.howItWorks.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.title,
        text: step.description,
      })),
    })
  }

  // Most services are one level under Services. A few (e.g. Bathroom
  // Remodeling under Home Remodeling) sit a level deeper — breadcrumbParent
  // inserts that intermediate crumb in both the visible nav and this schema
  // without changing the shape for every other service.
  const breadcrumbTrail = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}${pageUrl('services.html')}` },
  ]
  if (service.breadcrumbParent) {
    breadcrumbTrail.push({
      '@type': 'ListItem',
      position: 3,
      name: service.breadcrumbParent.name,
      item: `${SITE.url}${service.breadcrumbParent.url}`,
    })
  }
  breadcrumbTrail.push({
    '@type': 'ListItem',
    position: breadcrumbTrail.length + 1,
    name: service.title,
    item: canonical,
  })
  schemaGraph.push({ '@type': 'BreadcrumbList', itemListElement: breadcrumbTrail })

  if (faqs.length) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  const schema = { '@context': 'https://schema.org', '@graph': schemaGraph }

  const commonProjectsHtml = (service.commonProjects || [])
    .map(
      (project) => `                  <tr class="border-t border-slate-200">
                    <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left">${esc(project.name)}</th>
                    <td class="px-4 py-4 text-slate-500 text-sm">${esc(project.size)}</td>
                    <td class="px-4 py-4 text-blue-700 font-semibold whitespace-nowrap">${esc(project.cost)}</td>
                    <td class="px-4 py-4 text-slate-600 text-sm leading-relaxed">${esc(project.details)}</td>
                  </tr>`
    )
    .join('\n')

  const pricingTiersHtml = (service.pricingTiers || [])
    .map(
      (tier) => `                  <tr class="border-t border-slate-200">
                    <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left">${esc(tier.name)}</th>
                    <td class="px-4 py-4 text-blue-700 font-bold text-lg whitespace-nowrap">${esc(tier.range)}</td>
                    <td class="px-4 py-4 text-slate-600 text-sm leading-relaxed">${esc(tier.description)}</td>
                  </tr>`
    )
    .join('\n')

  const relatedServicesHtml = service.relatedServices
    .map(
      (related) => `            <a href="${related.url}" class="block bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-blue-200 hover:bg-white transition-all">
              <p class="font-semibold text-slate-900 mb-1">${esc(related.name)}</p>
              <p class="text-blue-700 text-sm font-medium">Learn more &rarr;</p>
            </a>`
    )
    .join('\n')

  let additionalCostsHtml = ''
  if (service.additionalCosts) {
    additionalCostsHtml = `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Additional Costs to Consider</h2>
          <p class="text-slate-600 mb-8">Beyond base construction, budget for these potential expenses:</p>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-6">
${service.additionalCosts
      .map(
        (cost) => `            <li class="bg-white border border-slate-200 rounded-xl p-6">
              <h3 class="font-bold text-slate-900 mb-2">${esc(cost.item)}</h3>
              <p class="text-blue-700 font-semibold mb-2">${esc(cost.cost)}</p>
              <p class="text-slate-600 text-sm">${esc(cost.note)}</p>
            </li>`
      )
      .join('\n')}
          </ul>
        </div>
      </section>`
  }

  // A service normally links one calculator (service.calculator). Some
  // services split into multiple calculators (e.g. remodeling has separate
  // kitchen/bath/whole-home tools) — service.calculators, an array of
  // { id, label }, renders one button per entry instead. Without this, any
  // service with more than one calculator can only link one of them from
  // its own page, leaving the rest with no inbound link (orphaned in the
  // sitemap even though they're real, built pages).
  const calculatorButton = service.calculators
    ? service.calculators
        .map(
          (calc) => `            <a href="${pageUrl(`calculator/${calc.id}.html`)}" class="bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">${esc(calc.label)}</a>`
        )
        .join('\n')
    : service.calculator
      ? // Anchor text carries the cost range itself (Phase 7: "each service
        // page links to its calculator with anchor text containing the
        // price range") rather than a generic "Calculate Your Cost" —
        // reuses stats.costRange, already computed elsewhere on this page.
        `            <a href="${pageUrl(`calculator/${service.calculator}.html`)}" class="bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">Calculate Your Cost — ${esc(service.stats.costRange)}</a>`
      : ''

  const commonProjectsSectionHtml = service.commonProjects
    ? `
      <section class="bg-white py-16 lg:py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Common ${esc(service.title)} Projects</h2>
          <p class="text-slate-600 mb-8">Real-world project examples with typical costs in Upstate SC:</p>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Common ${esc(service.title)} projects and typical costs — Upstate SC</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Project Type</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Size</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Typical Cost</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Details</th>
                </tr>
              </thead>
              <tbody class="bg-white">
${commonProjectsHtml}
              </tbody>
            </table>
          </div>
${authorBox()}
        </div>
      </section>`
    : ''

  let pricingSectionHtml = ''
  if (service.pricingTiers) {
    pricingSectionHtml = `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">${esc(service.title)} Pricing Breakdown</h2>
          <p class="text-slate-600 mb-8">Three pricing tiers to match your project scope and budget:</p>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-100">${esc(service.title)} pricing tiers — Upstate SC</caption>
              <thead class="bg-slate-100">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Tier</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Price Range</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">What's Included</th>
                </tr>
              </thead>
              <tbody>
${pricingTiersHtml}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
  } else if (service.flatFee) {
    pricingSectionHtml = `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">${esc(service.title)} Package</h2>
            <p class="text-6xl font-bold text-blue-700">${esc(service.flatFee.amount)}</p>
            <p class="text-lg text-slate-600 mt-2">${esc(service.flatFee.note)}</p>
            <p class="mt-6 font-medium text-slate-900">${esc(service.flatFee.credit)}</p>
          </div>
${authorBox()}
        </div>
      </section>`
  }

  const breadcrumbParentHtml = service.breadcrumbParent
    ? `              <li><a href="${service.breadcrumbParent.url}" class="hover:text-white transition-colors">${esc(service.breadcrumbParent.name)}</a></li>
              <li aria-hidden="true"><span>/</span></li>
`
    : ''

  const heroContentHtml = `          <nav class="mb-4" aria-label="Breadcrumb">
            <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li><a href="/services" class="hover:text-white transition-colors">Services</a></li>
              <li aria-hidden="true"><span>/</span></li>
${breadcrumbParentHtml}              <li class="text-slate-200" aria-current="page">${esc(service.title)}</li>
            </ol>
          </nav>
          <p class="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">${esc(service.category)}</p>
          <h1 class="text-4xl lg:text-5xl font-bold mb-6">${esc(service.h1)}</h1>
          <p class="text-xl text-slate-300 leading-relaxed mb-8">${esc(service.intro)}</p>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p class="text-blue-300 text-xs uppercase tracking-wide mb-1">Cost Range</p>
              <p class="text-white font-bold text-lg">${esc(service.stats.costRange)}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p class="text-blue-300 text-xs uppercase tracking-wide mb-1">Timeline</p>
              <p class="text-white font-bold text-lg">${esc(service.stats.timeline)}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p class="text-blue-300 text-xs uppercase tracking-wide mb-1">Experience</p>
              <p class="text-white font-bold text-lg">${esc(service.stats.experience)}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <p class="text-blue-300 text-xs uppercase tracking-wide mb-1">Rating</p>
              <p class="text-white font-bold text-lg">${esc(service.stats.rating)}</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="/contact" class="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get Free Consultation</a>
            <a href="tel:${SITE.phoneLink}" class="border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">${SITE.phone}</a>
${calculatorButton}
          </div>`

  const heroSectionHtml = service.heroImage
    ? `      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-24">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
${heroContentHtml}
          </div>
          <img src="${esc(service.heroImage)}" alt="${esc(service.h1)}" width="640" height="480" loading="lazy" class="rounded-2xl w-full h-72 lg:h-96 object-cover shadow-lg" />
        </div>
      </section>`
    : `      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-24">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
${heroContentHtml}
        </div>
      </section>`

  const serviceCategoriesSectionHtml = service.serviceCategories
    ? `
      <section class="bg-white py-16 lg:py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-10 text-center">What We Handle</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
${service.serviceCategories
      .map(
        (cat) => `            <div class="bg-slate-50 border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-4">${esc(cat.name)}</h3>
              <ul class="space-y-2 text-sm text-slate-700">
${cat.items
          .map(
            (item) => `                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#10003;</span><span>${esc(item)}</span></li>`
          )
          .join('\n')}
              </ul>
            </div>`
      )
      .join('\n')}
          </div>
${authorBox()}
        </div>
      </section>`
    : ''

  // Phase 3 structure bar: every page needs >=1 real <table>. Services
  // with commonProjects/pricingTiers/flatFee already render one; the 4
  // that don't (commercial-roofing, insurance-restoration, ada-compliance,
  // ada-bath-to-shower) get one built from data already on the page —
  // serviceCategories where present (a "what's included" breakdown of the
  // same category/items lists already shown as cards below), or
  // howItWorks otherwise (the same 3-step process already shown as an
  // ordered list). No new facts, just a second, tabular presentation of
  // data that's already there — see generate-services.mjs's
  // serviceCategoriesSectionHtml / howItWorksSectionHtml for the source.
  const hasOtherTable = Boolean(service.commonProjects || service.pricingTiers || service.flatFee)
  const fallbackTableSectionHtml =
    hasOtherTable
      ? ''
      : service.serviceCategories
        ? `
      <section class="bg-slate-50 py-12 lg:py-16 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">${esc(service.title)} at a Glance</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">${esc(service.title)} scope by category</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Category</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">What's Included</th>
                </tr>
              </thead>
              <tbody>
${service.serviceCategories
            .map(
              (cat) => `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left align-top whitespace-nowrap">${esc(cat.name)}</th>
                  <td class="px-4 py-4 text-slate-600 text-sm leading-relaxed">${cat.items.map(esc).join('; ')}</td>
                </tr>`
            )
            .join('\n')}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
        : service.howItWorks
          ? `
      <section class="bg-slate-50 py-12 lg:py-16 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">${esc(service.title)} Process at a Glance</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">${esc(service.title)} process, step by step</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Step</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Stage</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">What Happens</th>
                </tr>
              </thead>
              <tbody>
${service.howItWorks
            .map(
              (step, i) => `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left align-top">${i + 1}</th>
                  <td class="px-4 py-4 text-slate-900 font-semibold align-top whitespace-nowrap">${esc(step.title)}</td>
                  <td class="px-4 py-4 text-slate-600 text-sm leading-relaxed">${esc(step.description)}</td>
                </tr>`
            )
            .join('\n')}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
          : ''

  const authorOnlySectionHtml = !service.commonProjects && !service.pricingTiers && !service.flatFee && !service.serviceCategories
    ? `
      <section class="bg-white py-12 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
${authorBox()}
        </div>
      </section>`
    : ''

  const howItWorksSectionHtml = service.howItWorks
    ? `
      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-10 text-center">Our Simple Process</h2>
          <ol class="grid grid-cols-1 md:grid-cols-3 gap-6">
${service.howItWorks
      .map(
        (step, i) => `            <li class="bg-white border border-slate-200 rounded-xl p-7">
              <div class="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">${i + 1}</div>
              <h3 class="font-bold text-slate-900 text-lg mb-2">${esc(step.title)}</h3>
              <p class="text-slate-600 text-sm leading-relaxed">${esc(step.description)}</p>
            </li>`
      )
      .join('\n')}
          </ol>
        </div>
      </section>`
    : ''

  const benefitsSectionHtml = service.benefits
    ? `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-8 text-center">Why Work With Us</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-5">
${service.benefits
      .map(
        (benefit) => `            <li class="flex gap-3 items-start"><span class="text-blue-700 text-xl leading-none mt-0.5" aria-hidden="true">&#10003;</span><span class="text-slate-700">${esc(benefit)}</span></li>`
      )
      .join('\n')}
          </ul>
        </div>
      </section>`
    : ''

  // First 2 FAQs (cost + timeline, by convention of how SERVICE_FAQS is
  // ordered — see service-faqs.js) get promoted to visible <h2> question
  // headings with a direct-answer paragraph, not just accordion <summary>
  // text. AI extractors look for an H1/H2 phrased as a question immediately
  // followed by a compact answer; an accordion's <summary> isn't a heading
  // at all, so it wasn't satisfying that pattern even though the same text
  // was already on the page. The remaining FAQs stay in the accordion below
  // — no content is removed, just the first two get a second, structurally
  // stronger presentation. FAQPage JSON-LD still covers the full `faqs`
  // array either way, since both forms are visible on-page.
  // 4, not 2: Phase 2's own acceptance bar is "no fewer than 4 question-form
  // headings" per page. SERVICE_FAQS entries run 4-5 per service, so this
  // promotes nearly everything and leaves at most one in the accordion.
  const promotedFaqs = faqs.slice(0, 4)
  const remainingFaqs = faqs.slice(4)

  const promotedAnswersSectionHtml = promotedFaqs.length
    ? `
      <section class="bg-white py-12 lg:py-16 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
${promotedFaqs
        .map(
          (faq) => `          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">${esc(faq.question)}</h2>
            <p class="text-slate-600 leading-relaxed">${esc(faq.answer)}</p>
          </div>`
        )
        .join('\n')}
        </div>
      </section>`
    : ''

  const faqSectionHtml = remainingFaqs.length
    ? `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100" aria-labelledby="${service.id}-faqs-heading">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="${service.id}-faqs-heading" class="text-3xl font-bold text-slate-900 mb-3 text-center">More ${esc(service.title)} Questions</h2>
          <p class="text-slate-600 text-center mb-8">Direct answers for homeowners and AI search — licensed, local, and accountable.</p>
          <div class="space-y-4">
${faqHtml(remainingFaqs, service.id)}
          </div>
        </div>
      </section>`
    : ''

  const citationsSectionHtml = service.citations
    ? `
      <section class="bg-white py-8 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-sm text-slate-500">Codes &amp; permits: ${service.citations
      .map((c) => `<a href="${esc(c.url)}" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">${esc(c.text)}</a>`)
      .join(' &middot; ')}</p>
        </div>
      </section>`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoHead({ title, description, canonical, ...(service.heroImage ? { ogImage: service.heroImage } : {}) })}
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
${header}
    <main id="main-content">
${heroSectionHtml}
${promotedAnswersSectionHtml}
${commonProjectsSectionHtml}
${serviceCategoriesSectionHtml}
${fallbackTableSectionHtml}
${pricingSectionHtml}
${authorOnlySectionHtml}
${additionalCostsHtml}
${service.richContentBeforeProcess ?? ''}
${howItWorksSectionHtml}
${service.richContentAfterProcess ?? ''}
${benefitsSectionHtml}
${faqSectionHtml}
${citationsSectionHtml}

      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Related Services</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
${relatedServicesHtml}
          </div>
        </div>
      </section>

      <section class="bg-blue-700 py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Ready to Start Your ${esc(service.title)} Project?</h2>
          <p class="text-blue-100 text-lg mb-8">Free consultation and ballpark estimate. ${SITE.bbb} BBB Rating, ${SITE.rating} Google Rating, ${SITE.experience} years serving Upstate SC.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" class="bg-white hover:bg-slate-100 text-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">Request Free Consultation</a>
            <a href="tel:${SITE.phoneLink}" class="border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">${SITE.phone}</a>
          </div>
        </div>
      </section>
    </main>
${footer}
  </body>
</html>`
}

// Generate all service pages
console.log('🏗️  Generating service pages...')

for (const service of SERVICES) {
  // All service pages use nested directory + index.html pattern
  const filePath = resolve(root, service.slug, 'index.html')
  
  const dirPath = dirname(filePath)
  mkdirSync(dirPath, { recursive: true })
  writeFileSync(filePath, servicePage(service), 'utf-8')
  console.log(`✓ Generated ${service.slug}`)
}

console.log(`✅ Generated ${SERVICES.length} service pages successfully!`)
