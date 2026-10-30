import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Android-Caf-Mug/',
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { input: { home: 'index.html', pricing: 'pricing.html' } } },
})
