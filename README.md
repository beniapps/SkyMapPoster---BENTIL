# SkyMapPoster - BENTIL 🌌🗺️

Elegant, production-ready star map poster editor built with React + TypeScript + Vite, powered by the UMD build of `d3-celestial` via `window.Celestial`.

## ✨ Features
- 🌠 **Interactive star map** with `d3-celestial` (UMD)
- 🖼️ **Poster-ready canvas** (e.g. A2), DPI-aware exports
- 💾 **Shareable state** in the URL hash (Zustand + LZ-string)
- 🎛️ **Simple controls** for title, subtitle, meta lines
- ⚡ **Fast dev** with Vite + TailwindCSS

## 🧩 Tech Stack
- React 18 + TypeScript + Vite
- TailwindCSS
- Zustand + LZ-string (URL hash persistence)
- canvg, jsPDF, svg2pdf.js

## 🚀 Getting Started
Prerequisites: Node.js 18+

Using npm:
```bash
npm install
npm run dev
```

Build & preview:
```bash
npm run build
npm run preview
```

## 📁 Project Structure
```text
src/
  components/
    CelestialLoader.tsx      # Loads UMD scripts for d3-celestial
    CelestialCanvas.tsx      # Canvas wrapper for the map
    BrandBadge.tsx           # Corner brand badge
    controls/ExportPanel.tsx # Export UI
  lib/
    celestialAdapter.ts      # init/update/getSvgString/destroy helpers
    exportSvg.ts / exportPng.ts / exportPdf.ts
  state/
    useEditorStore.ts        # Zustand store with URL hash persistence
  routes/
    Studio.tsx               # Editor route
```

## 🔭 d3-celestial UMD Loading
`src/components/CelestialLoader.tsx` loads in order:
1. `https://unpkg.com/d3@3/d3.min.js`
2. `https://unpkg.com/d3-geo-projection@0.2.16/d3.geo.projection.min.js`
3. `https://unpkg.com/d3-celestial/celestial.min.js`

Once `window.Celestial` is available, the canvas renders.

## 🙌 Credits
- [`d3-celestial`](https://github.com/ofrohn/d3-celestial) for the star map engine

## 📜 License
This project is for educational and demo purposes. Add a license if you plan to distribute.


