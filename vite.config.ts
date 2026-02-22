import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so assets load correctly on GitHub Pages (e.g. .../grynhydroponics/) regardless of repo name.
// For a custom domain at root, set VITE_BASE_PATH='/'
const base = process.env.VITE_BASE_PATH || './'

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
        start_url: base === './' ? '.' : base,
        icons: [
          {
            src: base === './' ? 'icon.svg' : `${base.replace(/\/$/, '')}/icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
