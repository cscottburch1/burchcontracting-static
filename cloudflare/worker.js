/**
 * Cloudflare Worker for burchcontracting.com.
 *
 * Why this exists: Hostinger rate-limits crawlers at the web server (429s to
 * GPTBot, not disableable per site), so pages are served from Cloudflare.
 * The contact form and leads admin run here too (cloudflare/api.js, D1).
 *
 * wrangler.jsonc sets run_worker_first, so this script sees EVERY request
 * before the asset server. That is deliberate and load-bearing: the asset
 * server applies dist/_redirects to internal env.ASSETS.fetch() calls too, so
 * with a "/about.html -> /about" rule in that file the Worker's own lookup of
 * about.html came back as a redirect and /about 301'd to itself. All redirects
 * therefore live here, driven by src/data/url-map.js, and no _redirects file is
 * generated. It also means _headers does not apply, so this script sets the
 * security headers and asset caching itself.
 *
 * Request order, which matters:
 *   1. /api/* -> cloudflare/api.js (contact form, leads admin);
 *      /.well-known/* -> Hostinger (origin certificate renewal).
 *   2. The 2026-07 rebuild's URLs (/about.html, /garages/, /services/) -> 301
 *      to the restored URL from src/data/url-map.js.
 *   3. A real page for the requested clean URL, served from about.html or
 *      garage-builder/index.html. This comes BEFORE the legacy rules below,
 *      because the legacy catch-all "^calculator/([a-z-]+)/?$" would otherwise
 *      hijack real pages like /calculator/garages.
 *   4. Legacy redirects parsed from public/.htaccess (the retired Next.js
 *      site's URLs), so Apache and Cloudflare stay in step from one file.
 *   5. 404.html with a 404 status.
 */
import htaccess from '../public/.htaccess'
import { MOVED_URLS, PAGE_URLS, UNLISTED_FILES } from '../src/data/url-map.js'
import { findRedirect, parseRedirectRules, parseSecurityHeaders } from './htaccess.js'
import { handleApiRequest } from './api.js'

const REDIRECT_RULES = parseRedirectRules(htaccess)
const SECURITY_HEADERS = parseSecurityHeaders(htaccess)

/**
 * Every URL that must 301 to a canonical one: the rebuild's .html and
 * trailing-slash forms, plus the trailing-slash and /index.html variants of
 * each restored URL, which the retired site also redirected.
 */
const CANONICAL_REDIRECTS = new Map()
for (const [from, to] of Object.entries(MOVED_URLS)) CANONICAL_REDIRECTS.set(from, to)
for (const [file, url] of Object.entries(PAGE_URLS)) {
  CANONICAL_REDIRECTS.set(`/${file}`, url) // /about.html, /garage-builder/index.html
  if (url !== '/') CANONICAL_REDIRECTS.set(`${url}/`, url) // /about/, /services/
}
CANONICAL_REDIRECTS.set('/index.html', '/')
for (const [from, to] of [...CANONICAL_REDIRECTS]) if (from === to) CANONICAL_REDIRECTS.delete(from)

/**
 * Only this hostname may be indexed. Every other host the Worker answers on —
 * every *.workers.dev preview URL, and any future staging hostname — is a
 * byte-identical copy of the live site, and until now was protected from
 * indexing only by each page's canonical tag. A canonical is a hint; Google
 * may ignore it and index the duplicate anyway. An X-Robots-Tag is a directive.
 *
 * This is the third and outermost layer of the safe-by-default indexing model
 * introduced on 2026-09-21 (docs/DECISIONS.md): source pages emit
 * index,follow; scripts/apply-staging-noindex.mjs injects noindex only for
 * BUILD_ENV=staging; and this header covers any host serving a build that was
 * made without that variable — which is exactly what every preview URL does.
 */
const INDEXABLE_HOST = 'burchcontracting.com'

export default {
  async fetch(request, env) {
    const response = await route(request, env)
    return applyIndexingPolicy(response, new URL(request.url).hostname)
  },
}

/**
 * Adds X-Robots-Tag: noindex, nofollow on any host that is not the live site.
 * Clones only when the header is actually needed, so the production path pays
 * nothing.
 *
 * An existing X-Robots-Tag is preserved only if it already contains "noindex".
 * Today the only one is api.js's own noindex on the admin pages, so an
 * unconditional "leave it alone" would behave identically — but it would rely
 * on that staying true. A permissive value added later, or one returned by the
 * origin through forwardToOrigin() for /.well-known/*, would then be honoured
 * on a preview host and defeat the point of this function. Checking the value
 * rather than merely its presence closes that permanently, at no cost.
 */
function applyIndexingPolicy(response, hostname) {
  if (hostname === INDEXABLE_HOST) return response
  const existing = response.headers.get('X-Robots-Tag')
  if (existing && /noindex/i.test(existing)) return response
  const copy = new Response(response.body, response)
  copy.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return copy
}

async function route(request, env) {
  {
    const url = new URL(request.url)
    const { pathname } = url

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return withHeaders(await handleApiRequest(request, env), pathname)
    }
    if (pathname.startsWith('/.well-known/')) {
      return forwardToOrigin(request, env, url)
    }

    const canonical = CANONICAL_REDIRECTS.get(pathname)
    if (canonical) return redirectTo(`${url.origin}${canonical}${url.search}`, 301)

    const page = await servePage(request, env, url)
    if (page) return page

    const legacy = findRedirect(REDIRECT_RULES, pathname, url.search)
    if (legacy) {
      const location = legacy.location.startsWith('/') ? url.origin + legacy.location : legacy.location
      return redirectTo(location, legacy.status)
    }

    return notFound(request, env, url)
  }
}

/**
 * The asset backing a clean URL, or null.
 *
 * Two paths are deliberately never served here:
 *   - anything ending in .html — those are the old URLs, and the redirect
 *     table above owns them. Serving them would undo the 301.
 *   - 404.html (UNLISTED_FILES) — it is the error page, delivered with a 404
 *     status by notFound(). Serving it as a page made /404 return 200.
 */
async function servePage(request, env, url) {
  const { pathname } = url
  if (pathname.endsWith('.html')) return null

  // Anything that already names a file — /favicon.ico, /robots.txt,
  // /llms.txt, /sitemap.xml, the IndexNow key, /assets/* — is served as-is.
  // run_worker_first means nothing else would serve them.
  if (/\.[a-z0-9]+$/i.test(pathname)) {
    const file = await env.ASSETS.fetch(new Request(new URL(pathname, url.origin), request))
    return file.status === 404 ? null : withHeaders(file, pathname)
  }

  const candidates =
    pathname === '/'
      ? ['/index.html']
      : pathname.endsWith('/')
        ? [`${pathname}index.html`]
        : [`${pathname}.html`, `${pathname}/index.html`]

  for (const candidate of candidates) {
    if (UNLISTED_FILES.includes(candidate.replace(/^\//, ''))) continue
    const asset = await env.ASSETS.fetch(new Request(new URL(candidate, url.origin), request))
    if (asset.status !== 404) return withHeaders(asset, pathname)
  }
  return null
}

function forwardToOrigin(request, env, url) {
  const originHosts = (env.ORIGIN_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)

  if (!originHosts.includes(url.hostname)) {
    return withHeaders(
      new Response('Not found: /.well-known is served by the Hostinger origin, which is only reachable on the production domain.\n', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      }),
      url.pathname
    )
  }

  // On a Workers route, a fetch() to the same zone skips this Worker and goes
  // to the origin server in DNS — Hostinger.
  return fetch(request)
}

function redirectTo(location, status) {
  return new Response(null, { status, headers: { location, ...SECURITY_HEADERS } })
}

async function notFound(request, env, url) {
  const page = await env.ASSETS.fetch(new URL('/404.html', url.origin))
  const response = new Response(request.method === 'HEAD' ? null : page.body, { status: 404, headers: page.headers })
  response.headers.delete('etag')
  return withHeaders(response, url.pathname)
}

/**
 * run_worker_first means the _headers file never applies, so every response
 * gets its headers here. Vite content-hashes everything under /assets/, so
 * those are safe to cache for a year.
 */
function withHeaders(response, pathname) {
  const copy = new Response(response.body, response)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) copy.headers.set(name, value)
  if (pathname.startsWith('/assets/')) copy.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return copy
}
