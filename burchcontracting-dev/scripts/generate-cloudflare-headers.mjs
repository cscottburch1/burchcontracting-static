/**
 * Writes dist/_headers for Cloudflare from the `Header always set` lines in
 * public/.htaccess, so security headers are defined once for both hosts.
 * Runs after `vite build` (package.json "build").
 *
 * /assets/* gets a one-year immutable cache: Vite puts a content hash in
 * every filename there, so a changed file always has a new URL.
 */
import fs from 'node:fs'
import path from 'node:path'
import { parseSecurityHeaders } from '../cloudflare/htaccess.js'

const root = path.resolve(import.meta.dirname, '..')
const headers = parseSecurityHeaders(fs.readFileSync(path.join(root, 'public/.htaccess'), 'utf8'))

if (!Object.keys(headers).length) {
  console.error('generate-cloudflare-headers: no `Header always set` lines found in public/.htaccess')
  process.exit(1)
}

const lines = [
  '/*',
  ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`),
  '',
  '/assets/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
]

fs.writeFileSync(path.join(root, 'dist/_headers'), lines.join('\n'))
console.log(`generate-cloudflare-headers: wrote dist/_headers (${Object.keys(headers).length} security headers).`)
