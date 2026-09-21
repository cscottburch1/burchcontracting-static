/**
 * GA4 analytics — self-initializing on import, so every page just needs one
 * script tag (this file), not a dependency on main.js. Several generated
 * service pages (scripts/generate-services.mjs) don't load main.js at all.
 *
 * Suppressed entirely on nicheprohub.com (staging) so that domain's traffic
 * never reaches GA4 — no gtag.js is even loaded there, not just untracked.
 */
const GA_MEASUREMENT_ID = 'G-LLFLXVVFT6'
const SUPPRESSED_HOSTNAMES = new Set(['nicheprohub.com', 'www.nicheprohub.com'])

function isSuppressed() {
  return SUPPRESSED_HOSTNAMES.has(window.location.hostname)
}

function loadGtag() {
  if (isSuppressed()) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

/** Fires a GA4 event. No-op on nicheprohub.com or if gtag never loaded. */
export function trackEvent(name, params = {}) {
  if (isSuppressed() || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

loadGtag()

// phone_click — delegated at the document level so every tel: link on every
// page is covered (~78 of them across the site) without editing each page.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="tel:"]')
  if (!link) return
  trackEvent('phone_click', {
    phone_number: link.getAttribute('href').replace(/^tel:/, ''),
    page_path: window.location.pathname,
  })
})
