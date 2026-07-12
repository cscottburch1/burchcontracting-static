import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SITE, SERVICES } from '../src/data/services.js'
import { SERVICE_FAQS } from '../src/data/service-faqs.js'

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
                    <a href="/outdoor-living/decks" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Custom Decks</a>
                    <a href="/outdoor-living/screened-porches" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Screened Porches</a>
                    <a href="/outdoor-living/covered-patios" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Covered Patios</a>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Construction</p>
                    <a href="/garages" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Garages</a>
                    <a href="/additions" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Room Additions</a>
                    <a href="/adu-builder" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">ADU Builder</a>
                    <a href="/basement-finishing" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Basement Finishing</a>
                    </div>
                    <div>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Remodeling & More</p>
                    <a href="/remodeling" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Home Remodeling</a>
                    <a href="/commercial-upfits" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Commercial Upfits</a>
                    <a href="/insurance-restoration" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Insurance Restoration</a>
                    <p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Accessibility</p>
                    <a href="/ada-compliance" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">ADA Compliance</a>
                    <a href="/ada-bath-to-shower" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">ADA Bath to Shower</a>
                    <a href="/handyman" class="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">Handyman Services</a>
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
                  <a href="/outdoor-living/decks" class="text-slate-700 text-sm py-1 hover:text-blue-700">Custom Decks</a>
                  <a href="/outdoor-living/screened-porches" class="text-slate-700 text-sm py-1 hover:text-blue-700">Screened Porches</a>
                  <a href="/outdoor-living/covered-patios" class="text-slate-700 text-sm py-1 hover:text-blue-700">Covered Patios</a>
                  <a href="/garages" class="text-slate-700 text-sm py-1 hover:text-blue-700">Garages</a>
                  <a href="/additions" class="text-slate-700 text-sm py-1 hover:text-blue-700">Room Additions</a>
                  <a href="/adu-builder" class="text-slate-700 text-sm py-1 hover:text-blue-700">ADU Builder</a>
                  <a href="/basement-finishing" class="text-slate-700 text-sm py-1 hover:text-blue-700">Basement Finishing</a>
                  <a href="/remodeling" class="text-slate-700 text-sm py-1 hover:text-blue-700">Home Remodeling</a>
                  <a href="/commercial-upfits" class="text-slate-700 text-sm py-1 hover:text-blue-700">Commercial Upfits</a>
                  <a href="/insurance-restoration" class="text-slate-700 text-sm py-1 hover:text-blue-700">Insurance Restoration</a>
                  <a href="/ada-compliance" class="text-slate-700 text-sm py-1 hover:text-blue-700">ADA Compliance</a>
                  <a href="/ada-bath-to-shower" class="text-slate-700 text-sm py-1 hover:text-blue-700">ADA Bath to Shower</a>
                  <a href="/handyman" class="text-slate-700 text-sm py-1 hover:text-blue-700">Handyman Services</a>
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p class="font-bold text-xl text-white mb-2">Burch <span class="text-blue-500">Contracting</span></p>
            <p class="text-slate-400 text-sm leading-relaxed">Custom home additions, garage construction, outdoor living spaces, and remodeling across Simpsonville, Mauldin, Fountain Inn &amp; Woodruff SC.</p>
            <p class="mt-4 text-sm">SC License #${SITE.license}</p>
            <p class="mt-1 text-sm"><a href="https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">BBB ${SITE.bbb} Rated</a></p>
            <div class="flex items-center gap-4 mt-5">
              <a href="https://www.facebook.com/BurchContracting" target="_blank" rel="noopener noreferrer" aria-label="Burch Contracting on Facebook" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12"/></svg></a>
              <a href="https://www.instagram.com/burchcontracting" target="_blank" rel="noopener noreferrer" aria-label="Burch Contracting on Instagram" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465a4.9 4.9 0 0 1 1.772 1.153 4.9 4.9 0 0 1 1.153 1.772c.248.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122s-.01 3.056-.06 4.122c-.05 1.065-.217 1.79-.465 2.428a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.637.248-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.217-2.428-.465a4.9 4.9 0 0 1-1.772-1.153 4.9 4.9 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.217-1.79.465-2.428a4.9 4.9 0 0 1 1.153-1.772A4.9 4.9 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.01 9.283 2 12 2m0 1.802c-2.67 0-2.987.01-4.04.059-.976.045-1.505.207-1.858.344-.467.182-.8.399-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.05 1.054-.06 1.37-.06 4.04s.01 2.987.06 4.04c.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.05 1.37.06 4.041.06s2.987-.01 4.04-.06c.976-.045 1.505-.207 1.858-.344.466-.182.8-.399 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.05-1.054.06-1.37.06-4.041s-.01-2.987-.06-4.04c-.045-.976-.207-1.505-.344-1.858a3.1 3.1 0 0 0-.748-1.15 3.1 3.1 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.054-.05-1.37-.06-4.041-.06M12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0"/></svg></a>
              <a href="https://www.linkedin.com/company/burch-contracting" target="_blank" rel="noopener noreferrer" aria-label="Burch Contracting on LinkedIn" class="text-slate-400 hover:text-white transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124M7.119 20.452H3.554V9h3.565zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg></a>
            </div>
          </div>
          <div>
            <p class="font-semibold text-white mb-4">Our Services</p>
            <ul class="space-y-2 text-sm">
              <li><a href="/additions" class="hover:text-white transition-colors">Additions</a></li>
              <li><a href="/garages" class="hover:text-white transition-colors">Garages</a></li>
              <li><a href="/outdoor-living/decks" class="hover:text-white transition-colors">Decks &amp; Porches</a></li>
              <li><a href="/remodeling" class="hover:text-white transition-colors">Remodeling</a></li>
              <li><a href="/commercial-upfits" class="hover:text-white transition-colors">Commercial Upfits</a></li>
              <li><a href="/insurance-restoration" class="hover:text-white transition-colors">Insurance Restoration</a></li>
              <li><a href="/ada-compliance" class="hover:text-white transition-colors">ADA Compliance</a></li>
              <li><a href="/handyman" class="hover:text-white transition-colors">Handyman Services</a></li>
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
                <a href="https://www.google.com/maps/place/Burch+Contracting/@34.5822568,-82.3465501,75182m/data=!3m1!1e3!4m10!1m2!2m1!1sBurch+Contracting!3m6!1s0xe54a4fa317765f3:0x967dc0e0beb33729!8m2!3d34.5827!4d-82.016883!15sChFCdXJjaCBDb250cmFjdGluZ1oTIhFidXJjaCBjb250cmFjdGluZ5IBEmdlbmVyYWxfY29udHJhY3RvcuABAA!16s%2Fg%2F11xtcmrdxv?entry=ttu&amp;g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">${SITE.address}<br/>${SITE.city}, ${SITE.state} ${SITE.zip}</a>
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
          <p class="flex items-center gap-4">
            <a href="/privacy-policy.html" class="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms-of-service.html" class="hover:text-white transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
    <script type="module" src="/src/js/analytics.js"></script>
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
      document.querySelectorAll('[data-mobile-accordion]').forEach((btn) => {
        const key = btn.dataset.mobileAccordion;
        const panel = document.querySelector('[data-mobile-accordion-panel="' + key + '"]');
        const icon = btn.querySelector('[data-mobile-accordion-icon]');
        if (!panel) return;
        btn.addEventListener('click', () => {
          const isOpen = !panel.classList.contains('hidden');
          panel.classList.toggle('hidden');
          if (icon) icon.textContent = isOpen ? '+' : '−';
        });
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
  const canonical = `${SITE.url}/${service.slug}`
  const title = `${service.title} | Burch Contracting`
  const description = service.description
  const faqs = SERVICE_FAQS[service.id] || []

  const serviceSchema = {
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${SITE.url}/#business`,
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

  if (service.flatFee) {
    serviceSchema.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: service.flatFee.amount.replace(/[^0-9.]/g, ''),
      description: service.flatFee.credit,
    }
  }

  const schemaGraph = [serviceSchema]

  schemaGraph.push({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE.url}/services.html` },
      { '@type': 'ListItem', position: 3, name: service.title, item: canonical },
    ],
  })

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
      (project) => `              <li class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all">
                <h3 class="font-bold text-slate-900 text-lg mb-2">${esc(project.name)}</h3>
                <p class="text-blue-700 font-semibold mb-2">${esc(project.cost)}</p>
                <p class="text-slate-500 text-sm mb-3">${esc(project.size)}</p>
                <p class="text-slate-600 text-sm leading-relaxed">${esc(project.details)}</p>
              </li>`
    )
    .join('\n')

  const pricingTiersHtml = (service.pricingTiers || [])
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
          (calc) => `            <a href="/calculator/${calc.id}.html" class="bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">${esc(calc.label)}</a>`
        )
        .join('\n')
    : service.calculator
      ? `            <a href="/calculator/${service.calculator}.html" class="bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors">Calculate Your Cost</a>`
      : ''

  const commonProjectsSectionHtml = service.commonProjects
    ? `
      <section class="bg-white py-16 lg:py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Common ${esc(service.title)} Projects</h2>
          <p class="text-slate-600 mb-8">Real-world project examples with typical costs in Upstate SC:</p>
          <ul class="grid grid-cols-1 md:grid-cols-3 gap-6">
${commonProjectsHtml}
          </ul>
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
          <ul class="grid grid-cols-1 lg:grid-cols-3 gap-6">
${pricingTiersHtml}
          </ul>
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

  const heroContentHtml = `          <nav class="mb-4" aria-label="Breadcrumb">
            <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li><a href="/services.html" class="hover:text-white transition-colors">Services</a></li>
              <li aria-hidden="true"><span>/</span></li>
              <li class="text-slate-200" aria-current="page">${esc(service.title)}</li>
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
            <a href="/contact.html" class="bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors">Get Free Consultation</a>
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

  const faqSectionHtml = faqs.length
    ? `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100" aria-labelledby="${service.id}-faqs-heading">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="${service.id}-faqs-heading" class="text-3xl font-bold text-slate-900 mb-3 text-center">${esc(service.title)} FAQs</h2>
          <p class="text-slate-600 text-center mb-8">Direct answers for homeowners and AI search — licensed, local, and accountable.</p>
          <div class="space-y-4">
${faqHtml(faqs, service.id)}
          </div>
        </div>
      </section>`
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
${heroSectionHtml}

${commonProjectsSectionHtml}
${serviceCategoriesSectionHtml}
${pricingSectionHtml}
${authorOnlySectionHtml}
${additionalCostsHtml}
${howItWorksSectionHtml}
${benefitsSectionHtml}
${faqSectionHtml}

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
