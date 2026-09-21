/**
 * Flips <meta name="robots" content="noindex, nofollow" /> to "index, follow"
 * across every dist/*.html file except 404.html, which must stay noindex
 * permanently (see LAUNCH-CHECKLIST.md #1).
 *
 * No-op unless BUILD_ENV=production — this is what makes it safe to run on
 * every build unconditionally. The nicheprohub.com staging pipeline never
 * sets BUILD_ENV, so its pages are never touched regardless of when this
 * script ships or runs. Only a build where BUILD_ENV=production was set
 * (i.e. the deploy workflow once STAGING_URL points at burchcontracting.com,
 * or a local production build) actually flips anything.
 */
import fs from 'node:fs'
import path from 'node:path'

if (process.env.BUILD_ENV !== 'production') {
  console.log('flip-noindex-production: BUILD_ENV is not "production" — skipped.')
  process.exit(0)
}

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')
const EXEMPT = new Set(['404.html'])
const NOINDEX_RE = /<meta name="robots" content="noindex,\s*nofollow"\s*\/>/g

function walkHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtmlFiles(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

let flipped = 0
for (const file of walkHtmlFiles(distDir)) {
  const rel = path.relative(distDir, file)
  if (EXEMPT.has(rel)) continue

  const html = fs.readFileSync(file, 'utf8')
  const updated = html.replace(NOINDEX_RE, '<meta name="robots" content="index, follow" />')
  if (updated !== html) {
    fs.writeFileSync(file, updated)
    flipped++
  }
}

console.log(`flip-noindex-production: flipped ${flipped} file(s) to "index, follow" (404.html exempt).`)
