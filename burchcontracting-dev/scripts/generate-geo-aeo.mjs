import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  SITE,
  SERVICE_AREAS,
  CORE_SERVICES,
  GLOBAL_FAQS,
  SERVICE_FAQS,
  cityFaqs,
  faqPageSchema,
} from '../src/data/geo-aeo.js'
import { SERVICES } from '../src/data/services.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const areaDir = resolve(root, 'service-areas')

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function seoHead({ title, description, canonical, ogImage = SITE.ogImage }) {
  const image = `${SITE.domain}${ogImage}`
  return `    <meta name="robots" content="noindex, nofollow" />
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p class="font-bold text-xl text-white mb-2">Burch <span class="text-blue-500">Contracting</span></p>
            <p class="text-slate-400 text-sm leading-relaxed">Quality construction and remodeling services serving communities across South Carolina.</p>
            <p class="mt-4 text-sm">SC License #${SITE.license}</p>
            <p class="mt-1 text-sm"><a href="https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">BBB A+ Rated</a></p>
            <div class="flex items-center gap-4 mt-5">
              <a href="https://www.facebook.com/BurchContracting" target="_blank" rel="noopener noreferrer" aria-label="Burch Contracting on Facebook" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12"/></svg></a>
              <a href="https://www.instagram.com/burchcontracting" target="_blank" rel="noopener noreferrer" aria-label="Burch Contracting on Instagram" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465a4.9 4.9 0 0 1 1.772 1.153 4.9 4.9 0 0 1 1.153 1.772c.248.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122s-.01 3.056-.06 4.122c-.05 1.065-.217 1.79-.465 2.428a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.637.248-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.217-2.428-.465a4.9 4.9 0 0 1-1.772-1.153 4.9 4.9 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.217-1.79.465-2.428a4.9 4.9 0 0 1 1.153-1.772A4.9 4.9 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.01 9.283 2 12 2m0 1.802c-2.67 0-2.987.01-4.04.059-.976.045-1.505.207-1.858.344-.467.182-.8.399-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.05 1.054-.06 1.37-.06 4.04s.01 2.987.06 4.04c.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.05 1.37.06 4.041.06s2.987-.01 4.04-.06c.976-.045 1.505-.207 1.858-.344.466-.182.8-.399 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.05-1.054.06-1.37.06-4.041s-.01-2.987-.06-4.04c-.045-.976-.207-1.505-.344-1.858a3.1 3.1 0 0 0-.748-1.15 3.1 3.1 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.054-.05-1.37-.06-4.041-.06M12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0"/></svg></a>
              <a href="https://www.linkedin.com/company/burch-contracting" target="_blank" rel="noopener noreferrer" aria-label="Burch Contracting on LinkedIn" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124M7.119 20.452H3.554V9h3.565zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg></a>
            </div>
          </div>
          <div>
            <p class="font-semibold text-white mb-4">Quick Links</p>
            <ul class="space-y-2 text-sm">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li><a href="/services.html" class="hover:text-white transition-colors">Services</a></li>
              <li><a href="/projects.html" class="hover:text-white transition-colors">Projects</a></li>
              <li><a href="/faqs.html" class="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="/about.html" class="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact.html" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-white mb-4">Contact</p>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.552-3.507-7.994-8-7.994s-8 3.442-8 7.994c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg><a href="https://www.google.com/maps/place/Burch+Contracting/@34.5822568,-82.3465501,75182m/data=!3m1!1e3!4m10!1m2!2m1!1sBurch+Contracting!3m6!1s0xe54a4fa317765f3:0x967dc0e0beb33729!8m2!3d34.5827!4d-82.016883!15sChFCdXJjaCBDb250cmFjdGluZ1oTIhFidXJjaCBjb250cmFjdGluZ5IBEmdlbmVyYWxfY29udHJhY3RvcuABAA!16s%2Fg%2F11xtcmrdxv?entry=ttu&amp;g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">${SITE.office}</a></li>
              <li><a href="tel:${SITE.phoneTel}" class="flex items-center gap-2 hover:text-white transition-colors"><svg class="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clip-rule="evenodd"/></svg>${SITE.phone}</a></li>
              <li><a href="mailto:${SITE.email}" class="flex items-center gap-2 hover:text-white transition-colors"><svg class="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/></svg>${SITE.email}</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; <span id="year"></span> Burch Contracting. All rights reserved.</p>
          <p class="flex items-center gap-4">
            <a href="/privacy-policy.html" class="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms-of-service.html" class="hover:text-white transition-colors">Terms of Service</a>
          </p>
          <p>Serving Upstate South Carolina</p>
        </div>
      </div>
    </footer>`

function authorBox(cityName) {
  return `          <aside class="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name">${SITE.owner}</h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #${SITE.license} | 35+ years serving ${esc(cityName)}, SC and Upstate SC. Scott Burch oversees every project with transparent pricing and hands-on job-site accountability.</p>
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

function serviceAreaPage(area) {
  const faqs = cityFaqs(area)
  const canonical = `${SITE.domain}/service-areas/${area.slug}.html`
  const title = `Deck Builder, Garage Contractor &amp; Home Additions ${area.name} SC | Burch Contracting`
  const description = `Burch Contracting builds decks, screened porches, garages, and room additions in ${area.name}, SC. SC License #${SITE.license}. BBB A+. Free consultations. ${area.driveTime}.`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
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
        serviceType: ['Deck Builder', 'Garage Construction', 'Screened Porches', 'Room Additions', 'Remodeling', 'Insurance Restoration', 'ADA Compliance'],
      },
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

  const services = CORE_SERVICES.map(
    (service) => `              <li class="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-colors">
                <h3 class="font-bold text-slate-900 mb-2">${esc(service.name)}</h3>
                <p class="text-slate-600 text-sm mb-3">${esc(service.summary)}</p>
                <a href="/services.html#${service.anchor}" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">Learn more &rarr;</a>
              </li>`
  ).join('\n')

  const areaLinks = SERVICE_AREAS.filter((a) => a.slug !== area.slug)
    .map(
      (a) => `            <a href="/service-areas/${a.slug}.html" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">${esc(a.name)}</a>`
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/src/css/main.css" />
  </head>
  <body class="font-sans text-slate-800 bg-white antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
${header}
    <main id="main-content">
      <section class="bg-slate-900 text-white py-16 lg:py-24">
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
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">Deck Builder, Garage Contractor &amp; Home Additions in ${esc(area.name)}, SC</h1>
          <p class="text-xl text-slate-300 max-w-3xl mb-8">${esc(area.highlight)}</p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="/contact.html" class="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get Free Consultation</a>
            <a href="tel:${SITE.phoneTel}" class="border border-white/25 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">${SITE.phone}</a>
          </div>
        </div>
      </section>

      <section class="bg-white py-16 lg:py-20 border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">About ${esc(area.name)}</h2>
            <p class="text-slate-600 leading-relaxed mb-6">${esc(area.about)}</p>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">County</span><span class="font-semibold text-slate-900">${esc(area.county)}</span></li>
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">Drive Time</span><span class="font-semibold text-slate-900">${esc(area.driveTime)}</span></li>
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">Tagline</span><span class="font-semibold text-slate-900">${esc(area.tagline)}</span></li>
              <li class="bg-blue-50 border border-blue-100 rounded-xl p-4"><span class="text-slate-500 block text-xs uppercase tracking-wide mb-1">License</span><span class="font-semibold text-slate-900">#${SITE.license}</span></li>
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
          <h2 id="faqs-${area.slug}" class="text-3xl font-bold text-slate-900 mb-3">${esc(area.name)}, SC — Common Questions</h2>
          <p class="text-slate-600 mb-8">Direct answers for homeowners and AI search — licensed, local, and accountable.</p>
          <div class="space-y-4">
${faqHtml(faqs, area.slug)}
          </div>
${authorBox(area.name)}
          <p class="mt-6 text-center"><a href="/faqs.html" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">View all FAQs &rarr;</a></p>
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
            <a href="/contact.html" class="inline-block bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold transition-colors">Request Free Consultation</a>
            <a href="tel:${SITE.phoneTel}" class="inline-block border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-bold transition-colors">Call Now</a>
          </div>
        </div>
      </section>
    </main>
${footer}
    <script type="module" src="/src/js/main.js"></script>
    <script>document.getElementById('year').textContent = new Date().getFullYear()</script>
  </body>
</html>`
}

function faqsPage() {
  const canonical = `${SITE.domain}/faqs.html`
  const title = 'FAQs | Burch Contracting Upstate SC Contractor'
  const description = 'Answers about decks, screened porches, garages, additions, licensing, pricing, and service areas from Burch Contracting — SC License #CLG118679.'
  const allFaqs = [
    ...GLOBAL_FAQS,
    ...SERVICE_FAQS.flatMap((group) => group.faqs),
  ]

  const globalSection = faqHtml(GLOBAL_FAQS, 'global')
  const serviceSections = SERVICE_FAQS.map(
    (group) => `          <div class="mb-12">
            <h2 class="text-2xl font-bold text-slate-900 mb-5">${esc(group.category)}</h2>
            <div class="space-y-4">
${faqHtml(group.faqs, group.category.toLowerCase().replace(/\s+/g, '-'))}
            </div>
          </div>`
  ).join('\n')

  const areaLinks = SERVICE_AREAS.map(
    (area) => `            <a href="/service-areas/${area.slug}.html" class="rounded-xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <h3 class="font-bold text-slate-900">${esc(area.name)}</h3>
              <p class="text-sm text-slate-500 mt-1">${esc(area.county)} &middot; ${esc(area.driveTime)}</p>
            </a>`
  ).join('\n')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoHead({ title, description, canonical })}
    <script type="application/ld+json">${JSON.stringify(faqPageSchema(allFaqs))}</script>
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
      <section class="bg-slate-900 text-white py-16 lg:py-24">
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

      <section class="bg-white py-16 lg:py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-5">General Questions</h2>
          <div class="space-y-4 mb-12">
${globalSection}
          </div>
${serviceSections}
${authorBox('Upstate SC')}
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
            <a href="/contact.html" class="inline-block bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold transition-colors">Get Free Consultation</a>
            <a href="tel:${SITE.phoneTel}" class="inline-block border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-bold transition-colors">${SITE.phone}</a>
          </div>
        </div>
      </section>
    </main>
${footer}
    <script type="module" src="/src/js/main.js"></script>
    <script>document.getElementById('year').textContent = new Date().getFullYear()</script>
  </body>
</html>`
}

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10)
  const staticPages = [
    ['/', 'weekly', '1.0'],
    ['/services.html', 'weekly', '0.9'],
    ['/projects.html', 'weekly', '0.8'],
    ['/about.html', 'monthly', '0.8'],
    ['/contact.html', 'monthly', '0.9'],
    ['/faqs.html', 'monthly', '0.8'],
    ['/calculator/decks.html', 'monthly', '0.7'],
    ['/calculator/garages.html', 'monthly', '0.7'],
    ['/calculator/porch.html', 'monthly', '0.7'],
    ['/calculator/additions.html', 'monthly', '0.7'],
    ['/calculator/estimate.html', 'monthly', '0.7'],
    ['/calculator/kitchen-remodel.html', 'monthly', '0.7'],
    ['/calculator/bath-remodel.html', 'monthly', '0.7'],
    ['/calculator/whole-home-remodel.html', 'monthly', '0.7'],
    ['/calculator/ada-bath-shower.html', 'monthly', '0.7'],
    ['/privacy-policy.html', 'yearly', '0.3'],
    ['/terms-of-service.html', 'yearly', '0.3'],
  ]

  // Derived from SERVICES (src/data/services.js) so every dedicated
  // service page — including future ones — is automatically indexed
  // without needing to remember to update this list by hand.
  const servicePages = SERVICES.map((service) => [`/${service.slug}`, 'monthly', '0.8'])

  const areaPages = SERVICE_AREAS.map((area) => [`/service-areas/${area.slug}.html`, 'monthly', '0.75'])

  const urls = [...staticPages, ...servicePages, ...areaPages]
    .map(
      ([path, changefreq, priority]) => `  <url>
    <loc>${SITE.domain}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

mkdirSync(areaDir, { recursive: true })

for (const area of SERVICE_AREAS) {
  writeFileSync(resolve(areaDir, `${area.slug}.html`), serviceAreaPage(area))
}

writeFileSync(resolve(root, 'faqs.html'), faqsPage())
writeFileSync(resolve(root, 'public/sitemap.xml'), generateSitemap())

console.log(`Generated ${SERVICE_AREAS.length} service area pages, faqs.html, and sitemap.xml`)