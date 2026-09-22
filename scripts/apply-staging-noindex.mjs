/**
 * Injects <meta name="robots" content="noindex, nofollow" /> across dist/ —
 * and ONLY when BUILD_ENV=staging.
 *
 * This is the inverse of the build step it replaced, and the inversion is the
 * whole point. Under the old model every source page carried noindex and the
 * build rewrote dist/ to "index, follow" only when an environment variable said
 * to. That made the SAFE state conditional on remembering that variable, so any
 * build which omitted it shipped noindex on all 70 pages. On 2026-09-16 that
 * happened three times in one day, when a Cloudflare dashboard Git integration
 * ran a plain `npm run build` on every push (docs/DECISIONS.md).
 *
 * Now the default is correct and the exception is explicit:
 *
 *   npm run build                      -> index, follow   (production-correct)
 *   BUILD_ENV=staging npm run build    -> noindex, nofollow
 *
 * Forgetting the variable can no longer de-index the live site. The worst case
 * is a staging copy that fails to carry noindex, and that is covered twice
 * over: check-build fails on it, and cloudflare/worker.js sends
 * X-Robots-Tag: noindex, nofollow on any hostname that is not
 * burchcontracting.com (which is every workers.dev preview URL).
 *
 * 404.html already ships noindex permanently and is left alone.
 */
import fs from 'node:fs'
import path from 'node:path'

const INDEXABLE = '<meta name="robots" content="index, follow" />'
const NOINDEX = '<meta name="robots" content="noindex, nofollow" />'

if (process.env.BUILD_ENV !== 'staging') {
  console.log('apply-staging-noindex: BUILD_ENV is not "staging" — pages stay indexable.')
  process.exit(0)
}

const root = path.resolve(import.meta.dirname, '..')
const distDir = path.join(root, 'dist')
// Already permanently noindex; nothing to inject.
const EXEMPT = new Set(['404.html'])

function walkHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtmlFiles(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

let injected = 0
const missed = []

for (const file of walkHtmlFiles(distDir)) {
  const rel = path.relative(distDir, file).split(path.sep).join('/')
  if (EXEMPT.has(rel)) continue
  // dist/api/** is gone as of Phase 4; the filter stays as a guard. Not a site
  // page. Phase 4 deletes it; until then it is not ours to rewrite.
  if (rel.startsWith('api/')) continue

  const html = fs.readFileSync(file, 'utf8')
  if (html.includes(NOINDEX)) continue

  if (!html.includes(INDEXABLE)) {
    missed.push(rel)
    continue
  }
  fs.writeFileSync(file, html.replaceAll(INDEXABLE, NOINDEX))
  injected++
}

console.log(`apply-staging-noindex: injected noindex into ${injected} file(s) (404.html already noindex).`)

// A page the staging build could not mark is a page that would be indexed from
// a staging host. Fail loudly rather than leave it to the Worker's header.
if (missed.length) {
  console.error(
    `apply-staging-noindex: ${missed.length} page(s) had no recognizable robots meta to replace:\n  ` +
    missed.join('\n  ') +
    '\n\nEvery page must emit exactly:\n  ' + INDEXABLE +
    '\nCheck the seoHead() helpers in src/chrome/index.mjs, src/build/services.mjs and src/build/geo.mjs.'
  )
  process.exit(1)
}
