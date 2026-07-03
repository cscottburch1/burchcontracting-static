import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = import.meta.dirname
const serviceAreaDir = resolve(root, 'service-areas')
const outdoorLivingDir = resolve(root, 'outdoor-living')

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

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        services: resolve(root, 'services.html'),
        about: resolve(root, 'about.html'),
        contact: resolve(root, 'contact.html'),
        projects: resolve(root, 'projects.html'),
        faqs: resolve(root, 'faqs.html'),
        calculatorDecks: resolve(root, 'calculator/decks.html'),
        calculatorGarages: resolve(root, 'calculator/garages.html'),
        calculatorPorch: resolve(root, 'calculator/porch.html'),
        calculatorAdditions: resolve(root, 'calculator/additions.html'),
        calculatorEstimate: resolve(root, 'calculator/estimate.html'),
        calculatorKitchen: resolve(root, 'calculator/kitchen-remodel.html'),
        calculatorBath: resolve(root, 'calculator/bath-remodel.html'),
        calculatorWholeHome: resolve(root, 'calculator/whole-home-remodel.html'),
        // Service pages (all use nested directory structure)
        aduBuilder: resolve(root, 'adu-builder/index.html'),
        remodeling: resolve(root, 'remodeling/index.html'),
        commercialUpfits: resolve(root, 'commercial-upfits/index.html'),
        basementFinishing: resolve(root, 'basement-finishing/index.html'),
        garages: resolve(root, 'garages/index.html'),
        additions: resolve(root, 'additions/index.html'),
        // Generated pages
        ...serviceAreaInputs,
        ...outdoorLivingInputs,
      },
    },
  },
})