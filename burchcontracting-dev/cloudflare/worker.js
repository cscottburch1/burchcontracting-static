/**
 * Cloudflare Worker for burchcontracting.com.
 *
 * Why this exists: Hostinger rate-limits crawlers at the server level (429s
 * to GPTBot and others, and it can't be disabled per site), so the pages are
 * served from Cloudflare instead. Hostinger keeps only what needs PHP.
 *
 * Cloudflare's asset server answers first for exact file paths in dist/
 * (wrangler.jsonc sets html_handling and not_found_handling to "none", so
 * nothing is rewritten or redirected automatically — every URL stays exactly
 * as it was on Hostinger). This script only runs for requests that don't
 * match a file, and reproduces what Apache/LiteSpeed did for them:
 *
 *   1. /api/* and /.well-known/* are forwarded to Hostinger (contact form,
 *      leads admin, origin SSL certificate validation).
 *   2. RewriteRule redirects from public/.htaccess, in file order.
 *   3. Folders: /garages/ serves garages/index.html; /garages 301s to
 *      /garages/ (Apache's DirectorySlash behavior).
 *   4. Anything else: 404.html with a 404 status.
 */
import htaccess from '../public/.htaccess'
import { findRedirect, parseRedirectRules, parseSecurityHeaders } from './htaccess.js'

const REDIRECT_RULES = parseRedirectRules(htaccess)
const SECURITY_HEADERS = parseSecurityHeaders(htaccess)
const ORIGIN_PATH_PREFIXES = ['/api/', '/.well-known/']

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { pathname } = url

    if (pathname === '/api' || ORIGIN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return forwardToOrigin(request, env, url)
    }

    const redirect = findRedirect(REDIRECT_RULES, pathname, url.search)
    if (redirect) {
      const location = redirect.location.startsWith('/') ? url.origin + redirect.location : redirect.location
      return redirectTo(location, redirect.status)
    }

    const indexPath = pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}/index.html`
    const index = await env.ASSETS.fetch(new Request(new URL(indexPath, url.origin), request))
    if (index.status !== 404) {
      return pathname.endsWith('/') ? withSecurityHeaders(index) : redirectTo(`${url.origin}${pathname}/${url.search}`, 301)
    }

    return notFound(request, env, url)
  },
}

function forwardToOrigin(request, env, url) {
  const originHosts = (env.ORIGIN_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)

  if (!originHosts.includes(url.hostname)) {
    return withSecurityHeaders(
      new Response('Not found: /api and /.well-known are served by the Hostinger origin, which is only reachable on the production domain.\n', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    )
  }

  // On a Workers route, a fetch() to the same zone bypasses this Worker and
  // goes to the origin server in DNS (Hostinger).
  return fetch(request)
}

function redirectTo(location, status) {
  return new Response(null, { status, headers: { location, ...SECURITY_HEADERS } })
}

async function notFound(request, env, url) {
  const page = await env.ASSETS.fetch(new URL('/404.html', url.origin))
  const response = new Response(request.method === 'HEAD' ? null : page.body, { status: 404, headers: page.headers })
  response.headers.delete('etag')
  return withSecurityHeaders(response)
}

function withSecurityHeaders(response) {
  const copy = new Response(response.body, response)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) copy.headers.set(name, value)
  return copy
}
