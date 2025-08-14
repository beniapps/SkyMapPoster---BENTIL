import jsPDF from 'jspdf'
// @ts-ignore - types not bundled, ESM named export
import { svg2pdf } from 'svg2pdf.js'

export function mmToPt(mm: number) { return (mm * 72) / 25.4 }

export async function downloadPdf(filename: string, svgString: string, widthMm: number, heightMm: number) {
  const doc = new jsPDF({ unit: 'pt', format: [mmToPt(widthMm), mmToPt(heightMm)] })
  const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement
  // Prefer global if available, otherwise use ESM export
  const fn = (window as any).svg2pdf || svg2pdf
  await (fn as any)(svg, doc, { x: 0, y: 0 })
  doc.save(filename)
}


