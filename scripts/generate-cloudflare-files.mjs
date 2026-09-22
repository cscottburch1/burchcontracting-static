/**
 * Writes dist/_headers from cloudflare/headers.js. Runs after `vite build`
 * (package.json "build").
 *
 * No _redirects file is generated, deliberately. Cloudflare applies
 * _redirects to internal env.ASSETS.fetch() calls as well as inbound
 * requests, so a "/about.html -> /about" rule there also rewrote the Worker's
 * own lookup of about.html and made /about 301 to itself. All redirects live
 * in cloudflare/worker.js instead, driven by src/data/url-map.js.
 *
 * _headers is likewise inert while the Worker runs first (verified against the
 * runtime), so worker.js sets these same headers on every response. This file
 * is still written because it is the fallback if run_worker_first is ever
 * turned off, and because it documents the header set in one obvious place.
 */
import fs from 'node:fs'
import path from 'node:path'
import { SECURITY_HEADERS } from '../cloudflare/headers.js'

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')

if (!fs.existsSync(distDir)) {
  console.error('generate-cloudflare-files: dist/ not found — run `vite build` first.')
  process.exit(1)
}

const headers = SECURITY_HEADERS
if (!Object.keys(headers).length) {
  console.error('generate-cloudflare-files: cloudflare/headers.js exports no headers')
  process.exit(1)
}

fs.writeFileSync(
  path.join(distDir, '_headers'),
  [
    '/*',
    ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`),
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n')
)

// A _redirects file left over from an earlier build would still be applied to
// the Worker's asset lookups, so make sure it is gone.
const staleRedirects = path.join(distDir, '_redirects')
if (fs.existsSync(staleRedirects)) fs.rmSync(staleRedirects)

console.log(`generate-cloudflare-files: wrote dist/_headers (${Object.keys(headers).length} headers); redirects are handled by cloudflare/worker.js.`)
