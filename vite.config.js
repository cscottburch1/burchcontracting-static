import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { SERVICES } from './src/data/services.js'

const root = import.meta.dirname
const serviceAreaDir = resolve(root, 'service-areas')
const outdoorLivingDir = resolve(root, 'outdoor-living')
const calculatorDir = resolve(root, 'calculator')
const guideDirs = ['cost', 'blog']

const serviceAreaInputs = existsSync(serviceAreaDir)
  ? Object.fromEntries(
      readdirSync(serviceAreaDir)
        .filter((file) => file.endsWith('.html'))
        .map((file) => [
          `area_${file.replace('.html', '').replace(/-/g, '_')}`,
          resolve(serviceAreaDir, file),
        ])
    )
  : {}

const outdoorLivingInputs = existsSync(outdoorLivingDir)
  ? Object.fromEntries(
      readdirSync(outdoorLivingDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => [
          `outdoor_${dirent.name.replace(/-/g, '_')}`,
          resolve(outdoorLivingDir, dirent.name, 'index.html'),
        ])
    )
  : {}

// Auto-discovered rather than hand-listed like the block below: a new
// calculator/*.html file used to need a matching entry added here by hand,
// and calculator/covered-patios.html shipped without one — it worked in
// `npm run dev` (which needs no input list) and passed the deploy's
// content-integrity check (which can only compare files that made it into
// dist/), so it 404'd in production with nothing catching it until someone
// hit the live URL. Scanning the directory closes that gap for good.
const calculatorInputs = existsSync(calculatorDir)
  ? Object.fromEntries(
      readdirSync(calculatorDir)
        .filter((file) => file.endsWith('.html'))
        .map((file) => [
          `calculator_${file.replace('.html', '').replace(/-/g, '_')}`,
          resolve(calculatorDir, file),
        ])
    )
  : {}

// Service pages are generated from SERVICES (generate-services.mjs); derive
// build inputs from the same data so a new service can never be generated
// but silently left out of dist/ — the covered-patios failure mode (see
// calculatorInputs comment below). Slugs containing '/' live under
// outdoor-living/ and are covered by outdoorLivingInputs; skip them here.
const serviceInputs = Object.fromEntries(
  SERVICES.filter((s) => !s.slug.includes('/')).map((s) => [
    `svc_${s.slug.replace(/-/g, '_')}`,
    resolve(root, s.slug, 'index.html'),
  ])
)

// Cost guides and articles (scripts/generate-guides.mjs). Directory-scanned
// for the same reason as calculatorInputs above: 25 hand-listed entries is 25
// chances to generate a page that never reaches dist/, which is exactly how
// calculator/covered-patios.html shipped as a 404.
const guideInputs = Object.fromEntries(
  guideDirs.flatMap((dir) => {
    const full = resolve(root, dir)
    if (!existsSync(full)) return []
    return readdirSync(full)
      .filter((file) => file.endsWith('.html'))
      .map((file) => [`${dir}_${file.replace('.html', '').replace(/-/g, '_')}`, resolve(full, file)])
  })
)

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        notFound: resolve(root, '404.html'),
        services: resolve(root, 'services.html'),
        about: resolve(root, 'about.html'),
        contact: resolve(root, 'contact.html'),
        privacyPolicy: resolve(root, 'privacy-policy.html'),
        termsOfService: resolve(root, 'terms-of-service.html'),
        projects: resolve(root, 'projects.html'),
        faqs: resolve(root, 'faqs.html'),
        // Generated pages
        ...serviceInputs,
        ...serviceAreaInputs,
        ...outdoorLivingInputs,
        ...calculatorInputs,
        ...guideInputs,
      },
    },
  },
})