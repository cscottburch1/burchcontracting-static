/**
 * Copies .build/llms.txt into dist/ after the Vite build — the same step, for
 * the same reason, as scripts/write-sitemap.mjs. src/build/llms.mjs renders it
 * from the site's data (Phase 6.8); it is no longer a hand-kept file in public/.
 */
import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')
const built = resolve(root, '.build/llms.txt')

if (!existsSync(distDir)) {
  console.error('write-llms: dist/ not found — run the build first.')
  process.exit(1)
}
if (!existsSync(built)) {
  console.error('write-llms: .build/llms.txt not found — run `npm run prebuild` first.')
  process.exit(1)
}

copyFileSync(built, resolve(distDir, 'llms.txt'))
const links = (readFileSync(built, 'utf-8').match(/\]\(https:\/\//g) ?? []).length
console.log(`write-llms: wrote dist/llms.txt (${links} links).`)
