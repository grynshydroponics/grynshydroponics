import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// For GitHub Pages project site use base: '/REPO_NAME/' (e.g. '/Gryns/'). For custom domain or user site use '/'.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gryns - Hydroponic Tower Tracker',
        short_name: 'Gryns',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: base,
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
