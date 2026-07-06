import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SITE, SERVICES } from '../src/data/services.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function seoHead({ title, description, canonical, ogImage = '/images/custom-deck-greenville-sc.webp' }) {
  const image = `${SITE.url}${ogImage}`
  return `    <meta name="robots" content="noindex, nofollow" />
    <meta name="description" content="${esc(description)}" />
    <title>${esc(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <meta name="theme-color" content="#1d4ed8" />
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

const header = `    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div class="flex items-center justify-between h-16">
          <a href="/" class="flex items-center shrink-0">
            <img src="/images/burch-contracting-logo.webp" alt="Burch Contracting — Construction &amp; Remodeling" width="187" height="56" class="h-14 w-auto" />
          </a>
          <div class="hidden md:flex items-center gap-8">
            <a href="/" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Home</a>
            <a href="/services.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Services</a>
            <a href="/projects.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Projects</a>
            <a href="/about.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">About</a>
            <a href="/contact.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Contact</a>
            <a href="/contact.html" class="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors duration-200">Get Your Free Consultation</a>
          </div>
          <button id="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" class="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <span class="sr-only">Open menu</span>
            <svg id="icon-open" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            <svg id="icon-close" class="w-6 h-6 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden pb-4 border-t border-slate-100 mt-0.5">
          <div class="flex flex-col gap-1 pt-4">
            <a href="/" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Home</a>
            <a href="/services.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Services</a>
            <a href="/projects.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Projects</a>
            <a href="/about.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">About</a>
            <a href="/contact.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Contact</a>
            <a href="/contact.html" class="mt-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm text-center transition-colors">Get Your Free Consultation</a>
          </div>
        </div>
      </nav>
    </header>`

const footer = `    <footer class="bg-slate-950 text-slate-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p class="font-bold text-xl text-white mb-2">Burch <span class="text-blue-500">Contracting</span></p>
            <p class="text-slate-400 text-sm leading-relaxed">Custom home additions, garage construction, outdoor living spaces, and remodeling across Simpsonville, Mauldin, Fountain Inn &amp; Woodruff SC.</p>
            <p class="mt-4 text-sm">SC License #${SITE.license}</p>
          </div>
          <div>
            <p class="font-semibold text-white mb-4">Our Services</p>
            <ul class="space-y-2 text-sm">
              <li><a href="/additions" class="hover:text-white transition-colors">Additions</a></li>
              <li><a href="/garages" class="hover:text-white transition-colors">Garages</a></li>
              <li><a href="/outdoor-living/decks" class="hover:text-white transition-colors">Decks &amp; Porches</a></li>
              <li><a href="/remodeling" class="hover:text-white transition-colors">Remodeling</a></li>
              <li><a href="/commercial-upfits" class="hover:text-white transition-colors">Commercial Upfits</a></li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-white mb-4">Service Areas</p>
            <ul class="space-y-2 text-sm">
              <li><a href="/service-areas/simpsonville.html" class="hover:text-white transition-colors">Simpsonville, SC</a></li>
              <li><a href="/service-areas/mauldin.html" class="hover:text-white transition-colors">Mauldin, SC</a></li>
              <li><a href="/service-areas/fountain-inn.html" class="hover:text-white transition-colors">Fountain Inn, SC</a></li>
              <li><a href="/service-areas/woodruff.html" class="hover:text-white transition-colors">Woodruff, SC</a></li>
              <li><a href="/#service-areas" class="hover:text-white transition-colors">All Service Areas</a></li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-white mb-4">Contact</p>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.552-3.507-7.994-8-7.994s-8 3.442-8 7.994c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
                <span>${SITE.address}<br/>${SITE.city}, ${SITE.state} ${SITE.zip}</span>
              </li>
              <li>
                <a href="tel:${SITE.phoneLink}" class="flex items-center gap-2 hover:text-white transition-colors">
                  <svg class="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clip-rule="evenodd"/></svg>
                  ${SITE.phone}
                </a>
              </li>
              <li>
                <a href="mailto:${SITE.email}" class="flex items-center gap-2 hover:text-white transition-colors">
                  <svg class="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/></svg>
                  ${SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; <span id="year"></span> Burch Contracting. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <script>
      document.getElementById('year').textContent = new Date().getFullYear();
      const menuBtn = document.getElementById('menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      const iconOpen = document.getElementById('icon-open');
      const iconClose = document.getElementById('icon-close');
      menuBtn?.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenu?.classList.toggle('hidden');
        iconOpen?.classList.toggle('hidden');
        iconClose?.classList.toggle('hidden');
      });
    </script>`

function authorBox() {
  return `          <aside class="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name">${SITE.owner}</h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #${SITE.license} | ${SITE.experience} years | ${SITE.rating} Google Rating | BBB ${SITE.bbb} Rated</p>
            <p class="text-slate-600 text-sm mt-2 leading-relaxed">Last updated</p>
            <p class="text-slate-900 text-sm font-medium">Apr 16, 2026</p>
          </aside>`
}

function servicePage(service) {
  const canonical = `${SITE.url}/${service.slug}`
  const title = `${service.title} | Burch Contracting`
  const description = service.description

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: SITE.name,
      telephone: SITE.phone,
      email: SITE.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address,
        addressLocality: SITE.city,
        addressRegion: SITE.state,
        postalCode: SITE.zip,
      },
    },
    areaServed: {
      '@type': 'State',
      name: 'South Carolina',
    },
  }

  const commonProjectsHtml = service.commonProjects
    .map(
      (project) => `              <li class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all">
                <h3 class="font-bold text-slate-900 text-lg mb-2">${esc(project.name)}</h3>
                <p class="text-blue-700 font-semibold mb-2">${esc(project.cost)}</p>
                <p class="text-slate-500 text-sm mb-3">${esc(project.size)}</p>
                <p class="text-slate-600 text-sm leading-relaxed">${esc(project.details)}</p>
              </li>`
    )
    .join('\n')

  const pricingTiersHtml = service.pricingTiers
    .map(
      (tier) => `              <li class="bg-white border border-slate-200 rounded-xl p-6">
                <h3 class="font-bold text-slate-900 text-lg mb-2">${esc(tier.name)}</h3>
                <p class="text-blue-700 font-bold text-2xl mb-3">${esc(tier.range)}</p>
                <p class="text-slate-600 text-sm leading-relaxed">${esc(tier.description)}</p>
              </li>`
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

  const calculatorButton = service.calculator
    ? `            <a href="/calculator/${service.calculator}.html" class="bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">Calculate Your Cost</a>`
    : ''

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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/src/css/main.css" />
  </head>
  <body class="font-sans text-slate-800 bg-white antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
${header}
    <main id="main-content">
      <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 lg:py-24">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <a href="/contact.html" class="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get Free Consultation</a>
            <a href="tel:${SITE.phoneLink}" class="border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">${SITE.phone}</a>
${calculatorButton}
          </div>
        </div>
      </section>

      <section class="bg-white py-16 lg:py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Common ${esc(service.title)} Projects</h2>
          <p class="text-slate-600 mb-8">Real-world project examples with typical costs in Upstate SC:</p>
          <ul class="grid grid-cols-1 md:grid-cols-3 gap-6">
${commonProjectsHtml}
          </ul>
${authorBox()}
        </div>
      </section>

      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">${esc(service.title)} Pricing Breakdown</h2>
          <p class="text-slate-600 mb-8">Three pricing tiers to match your project scope and budget:</p>
          <ul class="grid grid-cols-1 lg:grid-cols-3 gap-6">
${pricingTiersHtml}
          </ul>
        </div>
      </section>
${additionalCostsHtml}

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
          <p class="text-blue-100 text-lg mb-8">Free on-site consultation and detailed estimate. ${SITE.bbb} BBB Rating, ${SITE.rating} Google Rating, ${SITE.experience} years serving Upstate SC.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact.html" class="bg-white hover:bg-slate-100 text-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">Request Free Consultation</a>
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
