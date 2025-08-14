import * as adapter from '@/lib/celestialAdapter'
import { downloadSvg } from '@/lib/exportSvg'

export default function QuickExportButton() {
  async function onExport() {
    // 1) Próbáljuk kinyerni az aktuális SVG-t a konténerből
    const svg = adapter.getSvgString()
    if (svg) {
      downloadSvg('starmap.svg', svg)
      return
    }
    // 2) Ha nincs SVG a konténerben, használjuk a d3-celestial beépített gombját (ha jelen van)
    const builtin = document.getElementById('download-svg') as HTMLInputElement | null
    if (builtin) {
      builtin.click()
      return
    }
    // 3) Végső fallback: próbáljuk meghívni az esetleges exportálót, ha elérhető
    try {
      const anyWin = window as any
      if (anyWin.Celestial && typeof anyWin.Celestial.export === 'function') {
        anyWin.Celestial.export({ format: 'svg', filename: 'starmap.svg' })
      }
    } catch {}
  }

  return (
    <button
      onClick={onExport}
      className="fixed right-4 bottom-4 z-50 rounded bg-black/70 text-white px-4 py-2 hover:bg-black/80"
    >
      Export SVG
    </button>
  )
}


