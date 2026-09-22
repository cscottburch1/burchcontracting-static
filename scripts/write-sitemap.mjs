/**
 * Writes dist/sitemap.xml after the build.
 *
 * The sitemap used to be committed at public/sitemap.xml and regenerated in
 * place on every prebuild — a build artifact living in git, which is the same
 * anti-pattern as the committed generated HTML and subject to the same rule:
 * if it can be built, it is built.
 *
 * It runs post-build rather than as a vite input because it is not a page. It
 * has no chrome, no HTML processing, and none of the page gates apply. This
 * mirrors scripts/generate-cloudflare-files.mjs, which writes dist/_headers the
 * same way.
 *
 * Consumers that read it from disk were repointed at dist/ in the same change:
 * scripts/check-build.mjs (orphan check) and scripts/indexnow-submit.mjs. Both
 * previously read public/sitemap.xml and would have failed silently or with
 * ENOENT once it stopped being written there.
 *
 * This COPIES what the build already produced rather than rendering again.
 * It used to call renderSitemap() itself, which meant two independent
 * productions of the same file: src/build/index.mjs wrote .build/sitemap.xml
 * and this wrote dist/sitemap.xml, and nothing guaranteed they matched. Phase
 * 3.6 made content dates a render() argument, at which point re-rendering here
 * would have needed its own second call into git to recompute them — a second
 * answer to "when did this page change", which is precisely the duplication
 * this cleanup exists to remove.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')
const built = resolve(root, '.build/sitemap.xml')

if (!existsSync(distDir)) {
  console.error('write-sitemap: dist/ not found — run the build first.')
  process.exit(1)
}
if (!existsSync(built)) {
  console.error('write-sitemap: .build/sitemap.xml not found — run `npm run prebuild` first.')
  process.exit(1)
}

mkdirSync(distDir, { recursive: true })
copyFileSync(built, resolve(distDir, 'sitemap.xml'))
const xml = readFileSync(built, 'utf-8')

const count = (xml.match(/<loc>/g) ?? []).length
console.log(`write-sitemap: wrote dist/sitemap.xml (${count} URLs).`)
