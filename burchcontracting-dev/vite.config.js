import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = import.meta.dirname
const serviceAreaDir = resolve(root, 'service-areas')
const outdoorLivingDir = resolve(root, 'outdoor-living')
const calculatorDir = resolve(root, 'calculator')

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
        // Service pages (all use nested directory structure)
        aduBuilder: resolve(root, 'adu-builder/index.html'),
        remodeling: resolve(root, 'remodeling/index.html'),
        commercialUpfits: resolve(root, 'commercial-upfits/index.html'),
        commercialRoofing: resolve(root, 'commercial-roofing/index.html'),
        basementFinishing: resolve(root, 'basement-finishing/index.html'),
        garages: resolve(root, 'garages/index.html'),
        additions: resolve(root, 'additions/index.html'),
        insuranceRestoration: resolve(root, 'insurance-restoration/index.html'),
        adaCompliance: resolve(root, 'ada-compliance/index.html'),
        adaBathToShower: resolve(root, 'ada-bath-to-shower/index.html'),
        handyman: resolve(root, 'handyman/index.html'),
        // Generated pages
        ...serviceAreaInputs,
        ...outdoorLivingInputs,
        ...calculatorInputs,
      },
    },
  },
})