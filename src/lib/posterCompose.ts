import { mmToPx } from '@/lib/formatters'

function parseNumberAttr(el: Element, name: string): number | null {
  const v = el.getAttribute(name)
  if (!v) return null
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

function getSvgIntrinsicSize(svgEl: SVGSVGElement): { w: number, h: number } {
  const w = parseNumberAttr(svgEl, 'width')
  const h = parseNumberAttr(svgEl, 'height')
  if (w && h) return { w, h }
  const viewBox = svgEl.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4) return { w: parts[2], h: parts[3] }
  }
  return { w: 1200, h: 1200 }
}

export type BuildPosterOptions = {
  starSvg: string
  posterWidthMm: number
  posterHeightMm: number
  marginMm?: number
  title?: string
  subtitle?: string
  metaLines?: string
}

export function buildPosterSvg(opts: BuildPosterOptions): string {
  const { starSvg, posterWidthMm, posterHeightMm } = opts
  const marginMm = opts.marginMm ?? 20

  const parser = new DOMParser()
  const starDoc = parser.parseFromString(starSvg, 'image/svg+xml')
  const starEl = starDoc.documentElement as unknown as SVGSVGElement
  const { w: starW, h: starH } = getSvgIntrinsicSize(starEl)

  const W = mmToPx(posterWidthMm, 72)
  const H = mmToPx(posterHeightMm, 72)
  const M = mmToPx(marginMm, 72)

  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('xmlns', ns)
  svg.setAttribute('width', String(W))
  svg.setAttribute('height', String(H))
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  svg.style.background = 'transparent'

  // Background frame (optional subtle border)
  const rect = document.createElementNS(ns, 'rect')
  rect.setAttribute('x', '0')
  rect.setAttribute('y', '0')
  rect.setAttribute('width', String(W))
  rect.setAttribute('height', String(H))
  rect.setAttribute('fill', 'none')
  rect.setAttribute('stroke', 'rgba(255,255,255,0.08)')
  rect.setAttribute('stroke-width', '1')
  svg.appendChild(rect)

  // Compute target area
  const targetW = W - 2 * M
  const targetH = H - 2 * M - 140 // reserve space for texts
  const scale = Math.min(targetW / starW, targetH / starH)
  const imgW = starW * scale
  const imgH = starH * scale
  const imgX = (W - imgW) / 2
  const imgY = M + (targetH - imgH) / 2

  // Wrap star SVG inside a group with transform
  const g = document.createElementNS(ns, 'g')
  g.setAttribute('transform', `translate(${imgX}, ${imgY}) scale(${scale})`)
  // Import star nodes into wrapper SVG
  // We clone childNodes to keep viewBox effects
  Array.from(starEl.childNodes).forEach(n => {
    g.appendChild(svg.ownerDocument!.importNode(n, true))
  })
  svg.appendChild(g)

  // Typography layer
  const title = opts.title ?? ''
  const subtitle = opts.subtitle ?? ''
  const meta = opts.metaLines ?? ''

  const textGroup = document.createElementNS(ns, 'g')

  const makeText = (y: number, size: number, weight = 400, opacity = 1, content = '') => {
    const t = document.createElementNS(ns, 'text')
    t.setAttribute('x', String(W / 2))
    t.setAttribute('y', String(y))
    t.setAttribute('text-anchor', 'middle')
    t.setAttribute('fill', `rgba(255,255,255,${opacity})`)
    t.setAttribute('font-size', String(size))
    t.setAttribute('font-weight', String(weight))
    t.setAttribute('font-family', 'Playfair Display, serif')
    t.textContent = content
    return t
  }

  const titleY = H - M - 72
  const subtitleY = titleY + 36
  const metaY = subtitleY + 24

  if (title) textGroup.appendChild(makeText(titleY, 28, 600, 1, title))
  if (subtitle) textGroup.appendChild(makeText(subtitleY, 16, 400, 0.85, subtitle))
  if (meta) textGroup.appendChild(makeText(metaY, 12, 400, 0.65, meta))

  svg.appendChild(textGroup)

  return svg.outerHTML
}


