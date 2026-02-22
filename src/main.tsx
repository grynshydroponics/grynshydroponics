import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TowerProvider } from '@/context/TowerContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <TowerProvider>
        <App />
      </TowerProvider>
    </BrowserRouter>
  </React.StrictMode>
)
