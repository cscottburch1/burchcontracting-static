/**
 * The homepage service grid, in tier order.
 *
 * Content per card is src/data/home-cards.js; order is servicesByTier(), the
 * one sort the nav and footer already use (Phase 6.1a). Filled into
 * src/templates/index.html at {{home.services}}.
 */
import { HOME_SERVICE_CARDS } from '../data/home-cards.js'
import { SERVICES, servicesByTier } from '../data/services.js'
import { SITE_ORIGIN, pageUrl } from '../data/url-map.js'

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function card(service, { heading, image, alt, blurb }) {
  return `            <article class="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all duration-200">
              <div class="relative h-40">
                <img src="${esc(image)}" alt="${esc(alt)}" width="400" height="160" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-5">
                  <h3 class="text-lg font-bold text-white">${esc(heading)}</h3>
                </div>
              </div>
              <div class="p-6">
                <p class="text-slate-600 text-sm leading-relaxed mb-4">${esc(blurb)}</p>
                <a href="${pageUrl(`${service.slug}/index.html`)}" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">Learn More &rarr;</a>
              </div>
            </article>`
}

/**
 * The homepage LocalBusiness node's hasOfferCatalog: every service, in tier
 * order, so the structured data leads with the same offers the page does.
 * Derived rather than typed into pages.js for the same reason as the grid.
 */
export function withOfferCatalog(schema) {
  const catalog = {
    '@type': 'OfferCatalog',
    name: 'Burch Contracting services',
    itemListElement: servicesByTier().map((service) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: service.title, url: `${SITE_ORIGIN}${pageUrl(`${service.slug}/index.html`)}` },
    })),
  }
  let found = 0
  const out = schema.map((block) =>
    block['@graph']
      ? {
          ...block,
          '@graph': block['@graph'].map((node) => {
            if (node['@id'] !== `${SITE_ORIGIN}/#business`) return node
            found++
            return { ...node, hasOfferCatalog: catalog }
          }),
        }
      : block
  )
  if (found !== 1) throw new Error(`index.html: expected one #business node to carry hasOfferCatalog, found ${found}`)
  return out
}

export function homeServiceGrid() {
  const ids = new Set(SERVICES.map((s) => s.id))
  const dead = Object.keys(HOME_SERVICE_CARDS).filter((id) => !ids.has(id))
  if (dead.length) {
    throw new Error(`src/data/home-cards.js: no service has id ${dead.map((id) => `'${id}'`).join(', ')} — a card for a service that does not exist`)
  }
  return servicesByTier()
    .filter((service) => HOME_SERVICE_CARDS[service.id])
    .map((service) => card(service, HOME_SERVICE_CARDS[service.id]))
    .join('\n')
}
