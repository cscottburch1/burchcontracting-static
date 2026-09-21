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
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderSitemap } from '../src/build/geo.mjs'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')

if (!existsSync(distDir)) {
  console.error('write-sitemap: dist/ not found — run the build first.')
  process.exit(1)
}

const xml = renderSitemap()
mkdirSync(distDir, { recursive: true })
writeFileSync(resolve(distDir, 'sitemap.xml'), xml, 'utf-8')

const count = (xml.match(/<loc>/g) ?? []).length
console.log(`write-sitemap: wrote dist/sitemap.xml (${count} URLs).`)
