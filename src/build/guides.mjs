/**
 * Generates the 25 restored content pages and their two hubs:
 *
 *   cost/<slug>.html   -> /cost/<slug>    11 cost guides  (src/data/guides-cost.js)
 *   blog/<slug>.html   -> /blog/<slug>    14 articles     (src/data/guides-articles.js)
 *   cost/index.html    -> /cost           hub
 *   blog/index.html    -> /blog           hub
 *
 * Why: the 2026-07 rebuild dropped all 25. The 14 /blog/* URLs 404'd and the
 * 11 /cost/* URLs were 301'd to calculators. Search Console measured
 * cost/estimate queries losing 1,347 impressions over the eight weeks that
 * followed, 225 of those queries losing every impression they had
 * (migration/baseline-2026-09.md). A calculator is a tool; it does not answer
 * "how much does a garage cost in Laurens SC", and neither Google nor an AI
 * assistant can quote one.
 *
 * Every dollar figure on these pages is computed from src/js/calculator-config.js
 * through the `p` helper handed to each lead/section/FAQ — see priceHelper()
 * below. Nothing is hand-typed, because the legacy versions were hand-typed and
 * had drifted into contradicting the site's own calculators (the old garage
 * guide claimed $46,080-$93,600 where the calculator computes about
 * $27,300-$32,900 for the same 400 sq ft attached build).
 *
 * URLs come from src/data/url-map.js. Build inputs are auto-discovered from the
 * cost/ and blog/ directories by vite.config.js, so a new guide cannot be
 * generated and then silently left out of dist/.
 */
import { SITE } from '../data/services.js'
import { PERMIT_OFFICES, SC_BUILDING_CODES_COUNCIL_URL } from '../data/geo-aeo.js'
import {
  LOCAL_BUSINESS_SCHEMA,
  ORGANIZATION_SCHEMA,
  SCOTT_PERSON_SCHEMA,
  WEBSITE_SCHEMA,
  articleSchema,
  webPageSchema,
} from '../data/site-schema.js'
import { SITE_ORIGIN, pageUrl } from '../data/url-map.js'
import { COST_GUIDES } from '../data/guides-cost.js'
import { ARTICLES } from '../data/guides-articles.js'
import { projectCostString, servicePerSqftBand, tierPerSqftBand } from '../data/pricing-sync.js'
import { authorBox, documentHead, esc, footer } from '../chrome/index.mjs'

/**
 * These pages are restorations, not new writing, so datePublished has to
 * predate this repo. The Wayback Machine's capture of the retired Next.js
 * versions is dated 2026-05-14; the true first-publication dates are earlier
 * and unrecoverable (no reliable per-URL first-capture data, and the archive
 * was intermittently unavailable while checking). 2026-05-14 is the earliest
 * date that can actually be evidenced, so it is the one used — deliberately
 * not a flattering guess, and deliberately not today's date, which would
 * claim brand-new content for text that has existed for months.
 *
 * dateModified is real: src/build/content-dates.mjs derives it from the git
 * history of the data file behind each kind, and render() takes it as an
 * argument. The '2026-09-11' fallback that used to sit here is gone — it stood
 * in for a missing content-dates.js, which no longer exists to be missing.
 */
const RESTORED_PUBLISHED = '2026-05-14'
const DATA_FILE_KEY = {
  cost: '__datafile__src/data/guides-cost.js',
  blog: '__datafile__src/data/guides-articles.js',
}

const KINDS = {
  cost: {
    dir: 'cost',
    hubTitle: 'Cost Guides',
    hubH1: 'Project Cost Guides for Upstate South Carolina',
    hubMetaTitle: 'Project Cost Guides — Upstate SC | Burch Contracting',
    hubMetaDescription:
      'What building and remodeling projects actually cost in Upstate South Carolina, by project type and city. Every figure computed from our own pricing, not estimated.',
    hubIntro:
      'Straight answers on what projects cost in the Upstate, by type and by city. Every dollar figure on these pages is computed from the same pricing engine behind our calculators, so the guide and the calculator can never disagree.',
    entries: COST_GUIDES,
  },
  blog: {
    dir: 'blog',
    hubTitle: 'Guides & Articles',
    hubH1: 'Remodeling & Construction Guides',
    hubMetaTitle: 'Remodeling & Construction Guides — Upstate SC | Burch Contracting',
    hubMetaDescription:
      'Practical guides on costs, materials, timelines and permits for South Carolina remodeling and construction projects, written by a licensed contractor.',
    hubIntro:
      'Practical answers to the questions homeowners actually ask before starting a project — costs, materials, timelines, permits and what holds its value. Written from 30+ years of building in the Upstate, with prices computed from our own pricing engine.',
    entries: ARTICLES,
  },
}

function money(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function bandString({ min, max }) {
  return `${money(min)}–${money(max)}`
}

/** Schema text must be plain: strip the tags the visible copy carries. */
function plain(value) {
  return String(value)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * The price helper handed to every lead/section/FAQ function in the data
 * files. Bands are formatted here rather than via pricing-sync's *String
 * helpers on purpose: servicePerSqftString() returns "$68-$145 Per Sq Ft" and
 * tierPerSqftString() "$68-$145/sq ft", both of which bake in a unit and a
 * capitalisation that read wrong mid-sentence — the copy supplies its own
 * ("... runs $68–$145 per square foot").
 *
 * A guide with no serviceKey (the permits and property-value articles) gets a
 * helper that throws if a price is requested, rather than one that silently
 * renders "undefined" into a published page.
 */
function priceHelper(serviceKey, slug) {
  const require = (helper) => {
    if (!serviceKey) {
      throw new Error(`generate-guides: ${slug} calls p.${helper}() but has no serviceKey`)
    }
    return serviceKey
  }
  return {
    get perSqft() {
      return bandString(servicePerSqftBand(require('perSqft')))
    },
    tier: (rateId, sqft) => projectCostString(require('tier'), rateId, sqft),
    perSqftTier: (rateId) => bandString(tierPerSqftBand(require('perSqftTier'), rateId)),
    // Cross-service comparison ("a basement costs less per foot than an
    // addition") — takes its own service key, so it works on pages that have
    // no serviceKey of their own.
    perSqftOther: (otherServiceKey) => bandString(servicePerSqftBand(otherServiceKey)),
  }
}

function tierTableHtml(guide, p) {
  if (!guide.tiers?.length) return ''
  const rows = guide.tiers
    .map(
      (tier) => `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left align-top">${esc(tier.label)}</th>
                  <td class="px-4 py-4 text-blue-700 font-semibold whitespace-nowrap align-top">${esc(p.tier(tier.rateId, tier.sqft))}</td>
                  <td class="px-4 py-4 text-slate-500 text-sm align-top whitespace-nowrap">${tier.sqft.toLocaleString('en-US')} sq ft</td>
                  <td class="px-4 py-4 text-slate-600 text-sm leading-relaxed">${esc(tier.note)}</td>
                </tr>`
    )
    .join('\n')

  return `
      <section class="bg-white py-14 lg:py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">${esc(guide.service)} Cost by Scope</h2>
          <p class="text-slate-600 mb-8">Computed from the same pricing engine as our calculators — <a href="${pageUrl(guide.calculator)}" class="text-blue-700 hover:text-blue-800 underline">run your own numbers</a> to change size, materials or site conditions.</p>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">${esc(guide.service)} cost by scope — ${esc(guide.city)}</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Scope</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Typical Cost</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Size</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">What's Included</th>
                </tr>
              </thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
}

function driversHtml(guide) {
  if (!guide.drivers?.length) return ''
  return `
      <section class="bg-slate-50 py-14 lg:py-16 border-t border-slate-100">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-8">What Moves the Price</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-5">
${guide.drivers
    .map(
      (driver) => `            <li class="flex gap-3 items-start"><span class="text-blue-700 text-xl leading-none mt-0.5" aria-hidden="true">&#10003;</span><span class="text-slate-700">${esc(driver)}</span></li>`
    )
    .join('\n')}
          </ul>
        </div>
      </section>`
}

function sectionsHtml(guide, p) {
  if (!guide.sections?.length) return ''
  return `
      <section class="bg-white py-14 lg:py-16 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
${guide.sections
    .map(
      (section) => `          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-3">${esc(section.heading)}</h2>
            <div class="text-slate-600 leading-relaxed space-y-4">${section.body(p)}</div>
          </div>`
    )
    .join('\n')}
        </div>
      </section>`
}

/**
 * Every FAQ becomes a real <h2> question followed by its answer, not an
 * accordion <summary>: a <summary> is not a heading, so the question/answer
 * pattern extractors look for wasn't being satisfied even though the text was
 * on the page. The same questions also go into FAQPage JSON-LD below — both
 * forms are visible, which is Google's actual requirement.
 */
function faqsHtml(guide, p) {
  if (!guide.faqs?.length) return ''
  return `
      <section class="bg-slate-50 py-14 lg:py-16 border-t border-slate-100" aria-labelledby="faq-heading">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" class="text-3xl font-bold text-slate-900 mb-8">${esc(guide.service)} Questions</h2>
          <div class="space-y-8">
${guide.faqs
    .map(
      (faq) => `            <div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">${esc(faq.q)}</h3>
              <p class="text-slate-600 leading-relaxed">${esc(plain(faq.a(p)))}</p>
            </div>`
    )
    .join('\n')}
          </div>
        </div>
      </section>`
}

function permitsHtml(guide) {
  if (!guide.permitCounty) return ''
  const office = PERMIT_OFFICES[guide.permitCounty]
  if (!office) return ''
  // Spartanburg County has no permit URL in PERMIT_OFFICES — render the name
  // without a link rather than an href to nowhere.
  const officeText = office.url
    ? `<a href="${esc(office.url)}" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">${esc(office.name)}</a>`
    : esc(office.name)
  return `
      <section class="bg-white py-8 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-sm text-slate-500">Permits &amp; codes: ${officeText} &middot; <a href="${SC_BUILDING_CODES_COUNCIL_URL}" class="text-blue-700 hover:text-blue-800 underline" rel="noopener" target="_blank">SC Building Codes Council</a></p>
        </div>
      </section>`
}

function relatedHtml(related, kind) {
  if (!related.length) return ''
  return `
      <section class="bg-white py-14 lg:py-16 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Related Guides</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
${related
    .map(
      (item) => `            <a href="${pageUrl(`${item.kind}/${item.slug}.html`)}" class="block bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-blue-200 hover:bg-white transition-all">
              <p class="font-semibold text-slate-900 mb-1">${esc(item.h1)}</p>
              <p class="text-blue-700 text-sm font-medium">Read more &rarr;</p>
            </a>`
    )
    .join('\n')}
          </div>
          <p class="mt-6 text-sm"><a href="${pageUrl(`${kind}/index.html`)}" class="text-blue-700 hover:text-blue-800 underline">See all ${esc(KINDS[kind].hubTitle.toLowerCase())} &rarr;</a></p>
        </div>
      </section>`
}

function guidePage(guide, kind, related, modified) {
  const file = `${KINDS[kind].dir}/${guide.slug}.html`
  const url = pageUrl(file)
  const canonical = `${SITE_ORIGIN}${url}`
  const p = priceHelper(guide.serviceKey, guide.slug)
  const published = RESTORED_PUBLISHED
  const hubUrl = pageUrl(`${KINDS[kind].dir}/index.html`)

  const article = articleSchema({
    headline: guide.h1,
    description: guide.metaDescription,
    url: canonical,
    datePublished: published,
    dateModified: modified,
  })

  const schemaGraph = [
    LOCAL_BUSINESS_SCHEMA,
    ORGANIZATION_SCHEMA,
    SCOTT_PERSON_SCHEMA,
    WEBSITE_SCHEMA,
    article,
    webPageSchema({ url: canonical, name: guide.h1, articleId: article['@id'] }),
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: KINDS[kind].hubTitle, item: `${SITE_ORIGIN}${hubUrl}` },
        { '@type': 'ListItem', position: 3, name: guide.h1, item: canonical },
      ],
    },
  ]

  if (guide.faqs?.length) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: plain(faq.a(p)) },
      })),
    })
  }

  const schema = { '@context': 'https://schema.org', '@graph': schemaGraph }

  return `${documentHead({
    title: guide.metaTitle,
    description: guide.metaDescription,
    canonical,
    schema,
  })}
    <main id="main-content">
      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="mb-4" aria-label="Breadcrumb">
            <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li><a href="${hubUrl}" class="hover:text-white transition-colors">${esc(KINDS[kind].hubTitle)}</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li class="text-slate-200" aria-current="page">${esc(guide.service)}</li>
            </ol>
          </nav>
          <p class="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">${esc(guide.service)} &middot; ${esc(guide.city)}</p>
          <h1 class="text-4xl lg:text-5xl font-bold mb-6">${esc(guide.h1)}</h1>
          <div class="text-xl text-slate-300 leading-relaxed mb-8"><p>${guide.lead(p)}</p></div>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="${pageUrl(guide.calculator)}" class="bg-white hover:bg-slate-50 text-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">Calculate Your Own Cost</a>
            <a href="/contact" class="border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get a Free Consultation</a>
          </div>
        </div>
      </section>
${tierTableHtml(guide, p)}
${driversHtml(guide)}
${sectionsHtml(guide, p)}
${faqsHtml(guide, p)}
${permitsHtml(guide)}
${relatedHtml(related, kind)}

      <section class="bg-white py-12 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-slate-600">More on this service: <a href="${pageUrl(guide.servicePage)}" class="text-blue-700 hover:text-blue-800 underline">${esc(guide.service)}</a> &middot; <a href="${pageUrl(guide.calculator)}" class="text-blue-700 hover:text-blue-800 underline">cost calculator</a></p>
${authorBox({ published, modified })}
        </div>
      </section>

      <section class="bg-blue-700 py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Planning a ${esc(guide.service)} Project?</h2>
          <p class="text-blue-100 text-lg mb-8">Free consultation and a real ballpark estimate. ${SITE.bbb} BBB Rating, ${SITE.rating} Google Rating, licensed in SC since ${SITE.established}.</p>
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

function hubPage(kind, modified) {
  const config = KINDS[kind]
  const file = `${config.dir}/index.html`
  const canonical = `${SITE_ORIGIN}${pageUrl(file)}`

  const rows = config.entries
    .map((guide) => {
      const p = priceHelper(guide.serviceKey, guide.slug)
      const typical = guide.tiers?.length ? esc(p.tier(guide.tiers[0].rateId, guide.tiers[0].sqft)) : '&mdash;'
      return `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-4 font-bold text-slate-900 text-left align-top"><a href="${pageUrl(`${config.dir}/${guide.slug}.html`)}" class="text-blue-700 hover:text-blue-800 underline">${esc(guide.h1)}</a></th>
                  <td class="px-4 py-4 text-slate-600 text-sm align-top whitespace-nowrap">${esc(guide.city)}</td>
                  <td class="px-4 py-4 text-blue-700 font-semibold text-sm align-top whitespace-nowrap">${typical}</td>
                </tr>`
    })
    .join('\n')

  const cards = config.entries
    .map(
      (guide) => `            <article class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">${esc(guide.service)} &middot; ${esc(guide.city)}</p>
              <h3 class="text-lg font-bold text-slate-900 mb-2"><a href="${pageUrl(`${config.dir}/${guide.slug}.html`)}" class="hover:text-blue-700 transition-colors">${esc(guide.h1)}</a></h3>
              <p class="text-slate-600 text-sm leading-relaxed mb-4">${esc(guide.metaDescription)}</p>
              <a href="${pageUrl(`${config.dir}/${guide.slug}.html`)}" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">Read the guide &rarr;</a>
            </article>`
    )
    .join('\n')

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      LOCAL_BUSINESS_SCHEMA,
      ORGANIZATION_SCHEMA,
      SCOTT_PERSON_SCHEMA,
      WEBSITE_SCHEMA,
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: config.hubH1,
        description: config.hubMetaDescription,
        isPartOf: { '@id': WEBSITE_SCHEMA['@id'] },
        dateModified: modified,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: config.entries.map((guide, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: guide.h1,
            url: `${SITE_ORIGIN}${pageUrl(`${config.dir}/${guide.slug}.html`)}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: config.hubTitle, item: canonical },
        ],
      },
    ],
  }

  return `${documentHead({
    title: config.hubMetaTitle,
    description: config.hubMetaDescription,
    canonical,
    schema,
  })}
    <main id="main-content">
      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="mb-4" aria-label="Breadcrumb">
            <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li class="text-slate-200" aria-current="page">${esc(config.hubTitle)}</li>
            </ol>
          </nav>
          <h1 class="text-4xl lg:text-5xl font-bold mb-6">${esc(config.hubH1)}</h1>
          <p class="text-xl text-slate-300 leading-relaxed">${esc(config.hubIntro)}</p>
        </div>
      </section>

      <section class="bg-white py-14 lg:py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">All ${esc(config.hubTitle)}</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">${esc(config.hubTitle)} — topic, area covered, and a typical figure from each guide</caption>
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Guide</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Area</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Example Figure</th>
                </tr>
              </thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="bg-slate-50 py-14 lg:py-16 border-t border-slate-100">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${cards}
          </div>
${authorBox({ published: RESTORED_PUBLISHED, modified })}
        </div>
      </section>

      <section class="bg-white py-12 border-t border-slate-100">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-slate-600">Also useful: <a href="${pageUrl(kind === 'cost' ? 'blog/index.html' : 'cost/index.html')}" class="text-blue-700 hover:text-blue-800 underline">${esc(kind === 'cost' ? KINDS.blog.hubTitle : KINDS.cost.hubTitle)}</a> &middot; <a href="/calculator/estimate" class="text-blue-700 hover:text-blue-800 underline">all-in-one cost calculator</a> &middot; <a href="/services" class="text-blue-700 hover:text-blue-800 underline">services &amp; pricing</a></p>
        </div>
      </section>

      <section class="bg-blue-700 py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Ready to Talk Numbers on Your Project?</h2>
          <p class="text-blue-100 text-lg mb-8">Free consultation, no sales pitch. ${SITE.bbb} BBB Rating, ${SITE.rating} Google Rating, licensed in SC since ${SITE.established}.</p>
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

/** Up to 3 related guides: same service first, then anything else of the same kind. */
function relatedFor(guide, kind) {
  const pool = [
    ...COST_GUIDES.map((g) => ({ ...g, kind: 'cost' })),
    ...ARTICLES.map((g) => ({ ...g, kind: 'blog' })),
  ].filter((g) => !(g.kind === kind && g.slug === guide.slug))

  const sameService = pool.filter((g) => guide.serviceKey && g.serviceKey === guide.serviceKey)
  const rest = pool.filter((g) => !sameService.includes(g))
  return [...sameService, ...rest].slice(0, 3)
}

/**
 * Pure render: data in, pages out. No filesystem, no side effects, nothing at
 * module top level.
 *
 * Phase 3.2. This generator used to write files as it ran, which is why
 * src/build/services.mjs and src/build/geo.mjs could not import it or each
 * other — importing would have written files as a side effect of the import.
 * That is the reason all three carried a verbatim copy of the chrome.
 *
 * `file` is where the caller should write each page today. It exists only so
 * this step changes nothing observable; Phase 3.2d moves every generator's
 * output to .build/pages/ and drops it in favour of `url` alone.
 */
export function render({ dates }) {
  const pages = []
  for (const kind of Object.keys(KINDS)) {
    const dir = KINDS[kind].dir
    const forKind = dates[DATA_FILE_KEY[kind]]
    if (!forKind) throw new Error(`guides: no content dates under ${DATA_FILE_KEY[kind]}`)
    const modified = forKind.dateModified

    for (const guide of KINDS[kind].entries) {
      pages.push({
        url: pageUrl(`${dir}/${guide.slug}.html`),
        file: `${dir}/${guide.slug}.html`,
        html: guidePage(guide, kind, relatedFor(guide, kind), modified),
      })
    }
    pages.push({
      url: pageUrl(`${dir}/index.html`),
      file: `${dir}/index.html`,
      html: hubPage(kind, modified),
    })
  }
  return pages
}

/** Counts for the caller's log line, so it need not know the data shape. */
export const summary = {
  costGuides: COST_GUIDES.length,
  articles: ARTICLES.length,
  hubs: Object.keys(KINDS).length,
}
