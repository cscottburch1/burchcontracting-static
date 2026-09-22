/**
 * Security headers, set on every response by cloudflare/worker.js and written
 * to dist/_headers by scripts/generate-cloudflare-files.mjs.
 *
 * Extracted from the `Header always set` lines in public/.htaccess in Phase 4,
 * by serialising the parser's own output. Identical values, one fewer file to
 * parse, and no Apache config in the dependency graph of a site with no Apache.
 *
 * run_worker_first means dist/_headers is inert in production — worker.js sets
 * these itself. The file is still written: it is the fallback if that flag is
 * ever turned off, and it puts the header set somewhere obvious.
 */
export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com; frame-src https://www.google.com; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self'"
}
