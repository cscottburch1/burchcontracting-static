import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, existsSync } from 'fs'
import { resolve, relative } from 'path'

const project = import.meta.dirname

/**
 * Every page vite builds comes from .build/pages/, produced by
 * src/build/index.mjs. Nothing is hand-listed and nothing generated is
 * committed.
 *
 * WHY THIS IS THE ROOT RATHER THAN AN INPUT DIRECTORY
 *
 * Vite emits each HTML input at its path relative to `root`. With the project
 * directory as root, an input at .build/pages/cost/index.html lands in
 * dist/.build/pages/cost/index.html — verified by experiment before this config
 * was written, not assumed. That would change every URL on the site, which
 * invariant 1 forbids outright.
 *
 * Making .build/pages/ the root fixes the output paths and costs two
 * compensations, because absolute paths inside a page resolve from root:
 *   - publicDir points back at the project's public/
 *   - the /src alias points back at the project's src/
 *
 * WHY THE INPUTS ARE SCANNED AND NEVER LISTED
 *
 * calculator/covered-patios.html once shipped as a live 404: the generator
 * wrote it, but nobody added it to the hand-maintained input list, so it never
 * reached dist/. `npm run dev` needs no input list and worked; the deploy's
 * integrity check can only compare files that made it into dist/, so it saw
 * nothing either. Only a real visitor found it. Scanning closes that for good —
 * a page that exists is a page that builds. See docs/DECISIONS.md, 2026-08-29.
 */
const pagesRoot = resolve(project, '.build/pages')

function htmlInputs(dir) {
  if (!existsSync(dir)) return {}
  const found = {}
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = resolve(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.html')) {
        // Key from the whole relative path: there are 20+ index.html files and
        // a bare-filename key would silently collapse them onto each other.
        const key = relative(dir, full).split(/[\\/]/).join('_').replace(/\.html$/, '')
        found[key] = full
      }
    }
  }
  walk(dir)
  return found
}

const input = htmlInputs(pagesRoot)

if (!Object.keys(input).length) {
  throw new Error(
    'vite.config.js: no HTML found in .build/pages/. Run `node src/build/index.mjs` first — ' +
    "package.json's prebuild does this automatically."
  )
}

export default defineConfig({
  root: pagesRoot,
  publicDir: resolve(project, 'public'),
  plugins: [tailwindcss()],
  resolve: {
    // Pages reference /src/... absolutely; without this they resolve against
    // .build/pages/ and fail.
    alias: { '/src': resolve(project, 'src') },
  },
  build: {
    outDir: resolve(project, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input },
  },
})
