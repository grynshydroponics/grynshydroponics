import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TowerProvider } from '@/context/TowerContext'
import App from './App'
import './index.css'

// With relative base (./), derive basename from current path so routing works on GitHub Pages.
function getBasename(): string {
  const b = import.meta.env.BASE_URL
  if (b !== './' && b !== '.') return b
  if (typeof window === 'undefined') return '/'
  const path = window.location.pathname
  return path.endsWith('/') ? path.slice(0, -1) || '/' : path || '/'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <TowerProvider>
        <App />
      </TowerProvider>
    </BrowserRouter>
  </React.StrictMode>
)
