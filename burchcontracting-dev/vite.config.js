import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        services: resolve(import.meta.dirname, 'services.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
        projects: resolve(import.meta.dirname, 'projects.html'),
        calculatorDecks: resolve(import.meta.dirname, 'calculator/decks.html'),
        calculatorGarages: resolve(import.meta.dirname, 'calculator/garages.html'),
        calculatorPorch: resolve(import.meta.dirname, 'calculator/porch.html'),
        calculatorAdditions: resolve(import.meta.dirname, 'calculator/additions.html'),
      },
    },
  },
})
