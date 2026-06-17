import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = import.meta.dirname
const serviceAreaDir = resolve(root, 'service-areas')

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
        ...serviceAreaInputs,
      },
    },
  },
})