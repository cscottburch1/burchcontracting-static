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
  PERMIT_OFFICES,
  SC_BUILDING_CODES_COUNCIL_URL,
  CITY_PROJECTS,
} from '../src/data/geo-aeo.js'
import { SERVICES } from '../src/data/services.js'
import { LOCAL_BUSINESS_SCHEMA, ORGANIZATION_SCHEMA, SCOTT_PERSON_SCHEMA, articleSchema } from '../src/data/site-schema.js'
import { CONTENT_DATES } from '../src/data/content-dates.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const areaDir = resolve(root, 'service-areas')

// Real git-history-derived dates for everything driven by geo-aeo.js (see
// scripts/compute-content-dates.mjs). '2026-07-19' fallback matches the
// site relaunch date used elsewhere when content-dates.js lacks an entry.
const AREA_DATES = CONTENT_DATES?.['__datafile__src/data/geo-aeo.js'] ?? { datePublished: '2026-07-19', dateModified: '2026-07-19' }

// Same idea, for everything driven by services.js (used by generateSitemap()
// below for the dedicated service pages).
const SERVICES_DATES = CONTENT_DATES?.['__datafile__src/data/services.js'] ?? { datePublished: '2026-07-19', dateModified: '2026-07-19' }

function esc(value) {
  return String(value)
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
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

const header = `<header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
          <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div class="flex items-center justify-between h-24">

              <!-- Logo -->
              <a href="/" class="flex items-center shrink-0">
                <img src="/images/burch-contracting-logo.webp" alt="Burch Contracting — Construction &amp; Remodeling" width="149" height="84" class="h-[84px] w-auto" />
              </a>

              <!-- Desktop nav links -->
              <div class="hidden lg:flex items-center gap-6">
                <a href="/" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Home</a>

              <div class="relative group">
                <button type="button" class="flex items-center gap-1 font-medium text-sm text-slate-600 hover:text-blue-700 transition-colors py-2">
                  Services
                  <svg class="w-3.5 h-3.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="invisible absolute left-0 top-full w-[520px] pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div class="grid grid-cols-2 gap-x-2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                    <div>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Outdoor Living</p>
                    <a href="/outdoor-living/decks/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Custom Decks</a>
                    <a href="/outdoor-living/screened-porches/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Screened Porches</a>
                    <a href="/outdoor-living/covered-patios/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Covered Patios</a>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Construction</p>
                    <a href="/garages/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Garages</a>
                    <a href="/additions/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Room Additions</a>
                    <a href="/adu-builder/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">ADU Builder</a>
                    <a href="/basement-finishing/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Basement Finishing</a>
                    </div>
                    <div>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Remodeling & More</p>
                    <a href="/remodeling/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Home Remodeling</a>
                    <a href="/bathroom-remodeling/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Bathroom Remodeling</a>
                    <a href="/kitchen-remodeling/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Kitchen Remodeling</a>
                    <a href="/insurance-restoration/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Insurance Restoration</a>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Commercial</p>
                    <a href="/commercial-upfits/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Commercial Upfits</a>
                    <a href="/commercial-roofing/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Commercial Roofing</a>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Accessibility</p>
                    <a href="/ada-compliance/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">ADA Compliance</a>
                    <a href="/ada-bath-to-shower/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">ADA Bath to Shower</a>
                    <a href="/handyman/" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Handyman Services</a>
                    </div>
                  </div>
                </div>
              </div>

              <div class="relative group">
                <button type="button" class="flex items-center gap-1 font-medium text-sm text-slate-600 hover:text-blue-700 transition-colors py-2">
                  Service Areas
                  <svg class="w-3.5 h-3.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="invisible absolute left-0 top-full w-64 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                    <a href="/service-areas/simpsonville.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Simpsonville</a>
                    <a href="/service-areas/fountain-inn.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Fountain Inn</a>
                    <a href="/service-areas/mauldin.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Mauldin</a>
                    <a href="/service-areas/greenville.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Greenville</a>
                    <a href="/service-areas/five-forks.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Five Forks</a>
                    <a href="/service-areas/woodruff.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Woodruff</a>
                    <a href="/service-areas/laurens.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Laurens</a>
                    <a href="/service-areas/gray-court.html" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Gray Court</a>
                  </div>
                </div>
              </div>
                <a href="/projects.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Projects</a>
                <a href="/about.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">About</a>
                <a href="/contact.html" class="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Contact</a>
                <a href="/contact.html" class="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors duration-200">
                  Get Your Free Consultation
                </a>
              </div>

              <!-- Mobile hamburger -->
              <button
                id="menu-btn"
                type="button"
                aria-expanded="false"
                aria-controls="mobile-menu"
                class="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span class="sr-only">Open menu</span>
                <svg id="icon-open" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                </svg>
                <svg id="icon-close" class="w-6 h-6 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Mobile menu -->
            <div id="mobile-menu" class="hidden lg:hidden pb-4 border-t border-slate-100 mt-0.5">
              <div class="flex flex-col gap-1 pt-4">
                <a href="/" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Home</a>

                <button type="button" data-mobile-accordion="services" class="flex items-center justify-between text-left font-semibold text-slate-900 py-2 w-full">
                  Services
                  <span data-mobile-accordion-icon class="text-sm">+</span>
                </button>
                <div data-mobile-accordion-panel="services" class="hidden pl-4 grid gap-1 border-l border-slate-200 mb-2">
                  <a href="/outdoor-living/decks/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Custom Decks</a>
                  <a href="/outdoor-living/screened-porches/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Screened Porches</a>
                  <a href="/outdoor-living/covered-patios/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Covered Patios</a>
                  <a href="/garages/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Garages</a>
                  <a href="/additions/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Room Additions</a>
                  <a href="/adu-builder/" class="text-slate-700 text-sm py-1 hover:text-blue-700">ADU Builder</a>
                  <a href="/basement-finishing/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Basement Finishing</a>
                  <a href="/remodeling/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Home Remodeling</a>
                  <a href="/bathroom-remodeling/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Bathroom Remodeling</a>
                  <a href="/kitchen-remodeling/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Kitchen Remodeling</a>
                  <a href="/insurance-restoration/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Insurance Restoration</a>
                  <a href="/commercial-upfits/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Commercial Upfits</a>
                  <a href="/commercial-roofing/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Commercial Roofing</a>
                  <a href="/ada-compliance/" class="text-slate-700 text-sm py-1 hover:text-blue-700">ADA Compliance</a>
                  <a href="/ada-bath-to-shower/" class="text-slate-700 text-sm py-1 hover:text-blue-700">ADA Bath to Shower</a>
                  <a href="/handyman/" class="text-slate-700 text-sm py-1 hover:text-blue-700">Handyman Services</a>
                </div>

                <button type="button" data-mobile-accordion="areas" class="flex items-center justify-between text-left font-semibold text-slate-900 py-2 w-full">
                  Service Areas
                  <span data-mobile-accordion-icon class="text-sm">+</span>
                </button>
                <div data-mobile-accordion-panel="areas" class="hidden pl-4 grid gap-1 border-l border-slate-200 mb-2">
                  <a href="/service-areas/simpsonville.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Simpsonville</a>
                  <a href="/service-areas/fountain-inn.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Fountain Inn</a>
                  <a href="/service-areas/mauldin.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Mauldin</a>
                  <a href="/service-areas/greenville.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Greenville</a>
                  <a href="/service-areas/five-forks.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Five Forks</a>
                  <a href="/service-areas/woodruff.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Woodruff</a>
                  <a href="/service-areas/laurens.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Laurens</a>
                  <a href="/service-areas/gray-court.html" class="text-slate-700 text-sm py-1 hover:text-blue-700">Gray Court</a>
                </div>
                <a href="/projects.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Projects</a>
                <a href="/about.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">About</a>
                <a href="/contact.html" class="text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors">Contact</a>
                <a href="/contact.html" class="mt-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm text-center transition-colors">
                  Get Your Free Consultation
                </a>
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
            <p class="mt-4 text-sm">SC License #${SITE.license} | NC License (Limited) #${SITE.licenseNC}</p>
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
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.552-3.507-7.994-8-7.994s-8 3.442-8 7.994c0 3.636 1.556 6.33 3.5 8.333a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg><a href="https://www.google.com/maps/place/Burch+Contracting/@34.6465,-82.1158,17z" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">${SITE.office}</a></li>
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
  // cityName is 'Upstate SC' itself on faqs.html (a sitewide page, not a
  // single city) — "serving Upstate SC, SC and Upstate SC" reads as a typo,
  // so that one case drops the redundant second clause.
  const servingLine =
    cityName === 'Upstate SC'
      ? '35+ years serving Upstate SC.'
      : `35+ years serving ${esc(cityName)}, SC and Upstate SC.`
  return `          <aside class="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8" itemscope itemtype="https://schema.org/Person">
            <p class="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Written by</p>
            <h3 class="text-xl font-bold text-slate-900" itemprop="name">${SITE.owner}</h3>
            <p class="text-blue-700 font-medium text-sm mt-1" itemprop="jobTitle">Owner &amp; Lead Contractor</p>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">SC Licensed General Contractor #${SITE.license} | NC Licensed (Limited) #${SITE.licenseNC} | ${servingLine} Scott Burch oversees every project with transparent pricing and hands-on job-site accountability.</p>
            <p class="text-slate-500 text-xs mt-3">Published: <time datetime="${AREA_DATES.datePublished}">${AREA_DATES.datePublished}</time> &middot; Last reviewed: <time datetime="${AREA_DATES.dateModified}">${AREA_DATES.dateModified}</time></p>
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
          <p class="text-slate-600 mb-6">See the full write-up on our <a href="/projects.html" class="text-blue-700 hover:text-blue-800 underline">projects page</a>.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
${cards}
          </div>
        </div>
      </section>`
  }
  areaFactsNeeded.push({ area: area.name, field: '2-3 real completed projects in this specific city (scope, and a cost band if comfortable sharing) — no filler written in the meantime' })
  return `      <section class="bg-white py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-3">Recent ${esc(area.name)} Projects</h2>
          <p class="text-slate-400 italic">Project write-ups for ${esc(area.name)} are being finalized. See our <a href="/projects.html" class="text-blue-700 hover:text-blue-800 underline not-italic">full projects page</a> in the meantime.</p>
        </div>
      </section>`
}

// Local building conditions — genuinely new per-city facts (soil, slope,
// HOA prevalence, flood risk) that don't exist anywhere else on the site
// yet. 100% FACT-NEEDED by design: writing plausible-sounding claims here
// (e.g. guessing at soil type) is exactly the kind of invented local
// detail the ground rules call out as most damaging to contractor trust.
const LOCAL_CONDITION_FIELDS = ['Typical soil/site conditions', 'Typical lot slope', 'How common HOA review is', 'Flood zone / drainage considerations']
function localConditionsSectionHtml(area) {
  for (const field of LOCAL_CONDITION_FIELDS) {
    areaFactsNeeded.push({ area: area.name, field })
  }
  const rows = LOCAL_CONDITION_FIELDS.map(
    (field) => `                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left whitespace-nowrap">${esc(field)}</th>
                  <td class="px-4 py-3 text-slate-400 italic text-sm">Not yet published</td>
                </tr>`
  ).join('\n')
  return `      <section class="bg-slate-50 py-12 lg:py-16 border-b border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Local Building Conditions in ${esc(area.name)}</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-50">Site-specific factors we account for when we scope a ${esc(area.name)} project</caption>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </div>
      </section>`
}

function serviceAreaPage(area) {
  const faqs = cityFaqs(area)
  // Same promotion pattern as generate-services.mjs: the first 2 city FAQs
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
  const canonical = `${SITE.domain}/service-areas/${area.slug}.html`
  const title = `Deck Builder, Garage Contractor & Home Additions ${area.name} SC | Burch Contracting`
  // Leads with a number (drive time) per Phase 7 — real, area-specific, and
  // distinct per city rather than a reworded generic opener.
  const driveTimeLead = area.driveTime === 'Our office location' ? 'Our home office' : `${area.driveTime.replace(' from office', '')} from our office`
  const description = `${driveTimeLead} — decks, garages & additions in ${area.name}, SC. SC Licensed #${SITE.license}, BBB A+, free consultations.`

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
        serviceType: ['Deck Builder', 'Garage Construction', 'Screened Porches', 'Room Additions', 'Remodeling', 'Insurance Restoration', 'ADA Compliance'],
      },
      articleSchema({
        headline: `Deck Builder, Garage Contractor & Home Additions in ${area.name}, SC`,
        description,
        url: canonical,
        datePublished: AREA_DATES.datePublished,
        dateModified: AREA_DATES.dateModified,
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

  const services = CORE_SERVICES.map(
    (service) => `              <li class="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-colors">
                <h3 class="font-bold text-slate-900 mb-2">${esc(service.name)}</h3>
                <p class="text-slate-600 text-sm mb-3">${esc(service.summary)}</p>
                <a href="${service.url}" class="text-blue-700 hover:text-blue-800 font-semibold text-sm">Learn more &rarr;</a>
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
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" /></noscript>
    <link rel="stylesheet" href="/src/css/main.css" />
  </head>
  <body class="font-sans text-slate-800 bg-white antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
${header}
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
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">Deck Builder, Garage Contractor &amp; Home Additions in ${esc(area.name)}, SC</h1>
          <p class="text-xl text-slate-300 max-w-3xl mb-8">${esc(area.highlight)}</p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="/contact.html" class="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get Free Consultation</a>
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
                  <td class="px-4 py-3 text-slate-600 text-sm">${CORE_SERVICES.map((s) => esc(s.name)).join('; ')}</td>
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
  const allFaqs = [
    ...GLOBAL_FAQS,
    ...SERVICE_FAQS.flatMap((group) => group.faqs),
  ]
  // Leads with a number (the real, computed count) per Phase 7.
  const description = `${allFaqs.length} real answers on decks, additions, garages & permits in Upstate SC. SC Licensed #${SITE.license}, BBB A+ contractor.`

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
    (area) => `            <a href="/service-areas/${area.slug}.html" class="rounded-xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
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
        datePublished: AREA_DATES.datePublished,
        dateModified: AREA_DATES.dateModified,
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
${header}
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
${authorBox('Upstate SC')}
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

// lastmod must equal the actual page's actual last content change, not the
// date the sitemap happened to be built — a blanket build-date stamp on
// every URL is exactly what makes Google stop trusting (and eventually
// ignore) lastmod across the whole file. Real per-page dates come from
// CONTENT_DATES (scripts/compute-content-dates.mjs, itself derived from
// git history — see that file's header for why it's checked in rather than
// computed live). changefreq/priority are dropped entirely per Google's own
// guidance that both are ignored.
function generateSitemap() {
  // Hand-authored static pages: dateKey is the file's own key in
  // CONTENT_DATES. Generated pages (faqs.html, service pages, service-area
  // pages) use their driving datafile's shared date instead — see
  // AREA_DATES / SERVICES_DATES above.
  const staticPages = [
    ['/', 'index.html'],
    ['/services.html', 'services.html'],
    ['/projects.html', 'projects.html'],
    ['/about.html', 'about.html'],
    ['/contact.html', 'contact.html'],
    ['/faqs.html', AREA_DATES],
    ['/calculator/decks.html', 'calculator/decks.html'],
    ['/calculator/garages.html', 'calculator/garages.html'],
    ['/calculator/porch.html', 'calculator/porch.html'],
    ['/calculator/additions.html', 'calculator/additions.html'],
    ['/calculator/estimate.html', 'calculator/estimate.html'],
    ['/calculator/kitchen-remodel.html', 'calculator/kitchen-remodel.html'],
    ['/calculator/bath-remodel.html', 'calculator/bath-remodel.html'],
    ['/calculator/whole-home-remodel.html', 'calculator/whole-home-remodel.html'],
    ['/calculator/ada-bath-shower.html', 'calculator/ada-bath-shower.html'],
    ['/calculator/basement-finishing.html', 'calculator/basement-finishing.html'],
    ['/calculator/covered-patios.html', 'calculator/covered-patios.html'],
    ['/privacy-policy.html', 'privacy-policy.html'],
    ['/terms-of-service.html', 'terms-of-service.html'],
  ].map(([path, dateKeyOrDates]) => [
    path,
    typeof dateKeyOrDates === 'string' ? (CONTENT_DATES?.[dateKeyOrDates] ?? AREA_DATES) : dateKeyOrDates,
  ])

  // Derived from SERVICES (src/data/services.js) so every dedicated
  // service page — including future ones — is automatically indexed
  // without needing to remember to update this list by hand.
  // Trailing slash: these are directory-index pages ({slug}/index.html,
  // served at /{slug}/) — the host 301-redirects the no-slash path, so a
  // sitemap entry without it sends crawlers through an avoidable redirect
  // instead of the actual 200 URL. Matches the canonical fix in
  // generate-services.mjs (servicePage()) — same root cause, same slug list.
  const servicePages = SERVICES.map((service) => [`/${service.slug}/`, SERVICES_DATES])

  const areaPages = SERVICE_AREAS.map((area) => [`/service-areas/${area.slug}.html`, AREA_DATES])

  const urls = [...staticPages, ...servicePages, ...areaPages]
    .map(
      ([path, dates]) => `  <url>
    <loc>${SITE.domain}${path}</loc>
    <lastmod>${dates.dateModified}</lastmod>
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
if (areaFactsNeeded.length) {
  console.log(`\n${areaFactsNeeded.length} FACT-NEEDED item(s) from service-area pages (add to CITABILITY-FACTS-NEEDED.md):`)
  for (const f of areaFactsNeeded) console.log(`  - [${f.area}] ${f.field}`)
}