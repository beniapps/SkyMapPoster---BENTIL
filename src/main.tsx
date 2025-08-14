// StrictMode ideiglenesen kikapcsolva a d3-celestial stabil mount miatt
import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Studio from './routes/Studio'

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/studio" element={<Studio />} />
    </Routes>
  </BrowserRouter>
)


