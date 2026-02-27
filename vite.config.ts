import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))
const appVersion = pkg.version || '0.0.0'

// Relative base so assets load correctly on GitHub Pages (e.g. .../grynhydroponics/) regardless of repo name.
// For a custom domain at root, set VITE_BASE_PATH='/'
const base = process.env.VITE_BASE_PATH || './'

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
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
