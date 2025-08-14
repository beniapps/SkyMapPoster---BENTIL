/* BENTIL — Béni Attila László
   Imperative adapter for the UMD d3-celestial (window.Celestial)
   Exposes: init, update, getSvgString, destroy
*/

export type CelestialConfig = Record<string, any>

declare global {
  interface Window {
    Celestial?: any
    d3?: any
  }
}

let mounted = false
let containerId: string | null = null
const DATA_CDN = 'https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/'

function ensureTrailingSlash(url: string) { return /\/$/.test(url) ? url : `${url}/` }
function ensureContainerSelector(value: string | undefined | null) {
  if (!value) return undefined
  return value.startsWith('#') ? value : `#${value}`
}

function sanitizeConfig(cfg: CelestialConfig): CelestialConfig {
  const next = { ...cfg }
  const dp = (next as any).datapath as string | undefined
  if (
    !dp ||
    /ofrohn\.github\.io\/(?:celestial|d3-celestial)\/data\//.test(dp) ||
    /unpkg\.com\/d3-celestial\/data\//.test(dp)
  ) {
    ;(next as any).datapath = DATA_CDN
  }
  ;(next as any).datapath = ensureTrailingSlash((next as any).datapath)
  if ((next as any).container) {
    ;(next as any).container = ensureContainerSelector((next as any).container)
  }
  // Normalize time keys to Date object as required by d3-celestial
  const dt = (next as any).datetime || (next as any).date
  if (dt) {
    const d = (dt instanceof Date) ? dt : new Date(dt)
    ;(next as any).date = d
    delete (next as any).datetime
  }
  // Normalize position keys → [lat, lon] as numbers (library expects [lat, lon])
  const gp = (next as any).geopos || (next as any).location
  if (Array.isArray(gp) && gp.length >= 2) {
    const lat = Number(gp[0])
    const lon = Number(gp[1])
    ;(next as any).geopos = [lat, lon]
    ;(next as any).location = [lat, lon]
  }
  // Ensure follow zenith if requested
  if ((next as any).follow === undefined) (next as any).follow = 'zenith'
  return next
}

export const defaults: CelestialConfig = {
  width: 600,
  height: 600,
  projection: 'orthographic',
  // Use unpkg CDN which hosts the data/ folder reliably
  datapath: DATA_CDN,
  planets: { show: false },
  constellations: {
    names: false,
    lines: true,
    bounds: false,
    lineStyle: { stroke: '#666666', width: 1.2, opacity: 0.9 },
  },
  stars: { show: true, limit: 6, colors: false, designation: false, propername: false, style: { fill: '#222222' } },
  dsos: { show: false },
  mw: { show: false },
  lines: {
    graticule: { show: true, stroke: '#b0b0b0', width: 0.6, opacity: 0.6 },
    ecliptic: { show: true, stroke: '#888888', width: 0.8, opacity: 0.8 },
    equatorial: { show: true, stroke: '#888888', width: 0.8, opacity: 0.8 },
  },
  background: { fill: 'rgba(0,0,0,0)', stroke: 'rgba(0,0,0,0)', width: 0 },
  // API szerint [lat, lon]
  geopos: [46.303, 25.298],
  datetime: '1998-10-08 22:00:00',
  follow: 'zenith',
  interactive: false,
  formFields: { download: true },
}

export function init(containerEl: HTMLElement, config: CelestialConfig) {
  if (!window.Celestial) throw new Error('Celestial nincs betöltve')
  containerId = containerEl.id
  const merged = sanitizeConfig({ ...defaults, ...config, container: containerId })
  try { window.Celestial.reset && window.Celestial.reset() } catch {}
  window.Celestial.display(merged)
  // If Celestial rendered to default container, relocate into ours
  try {
    const target = document.getElementById(containerId)
    if (target) {
      target.style.position = target.style.position || 'relative'
      const hasOutput = target.querySelector('canvas, svg')
      if (!hasOutput) {
        // Try known default id
        const fallback = document.getElementById('celestial-map') || document.querySelector('#celestial-map') as HTMLElement | null
        if (fallback && fallback !== target) {
          while (fallback.firstChild) target.appendChild(fallback.firstChild)
          fallback.remove()
        } else {
          // Generic fallback: grab the last top-level canvas and optional <container> sibling and move them
          const canvases = Array.from(document.querySelectorAll('body > canvas')) as HTMLCanvasElement[]
          const lastCanvas = canvases[canvases.length - 1]
          if (lastCanvas && !target.contains(lastCanvas)) {
            target.appendChild(lastCanvas)
            const maybeContainer = lastCanvas.nextElementSibling as HTMLElement | null
            if (maybeContainer && maybeContainer.tagName.toLowerCase() === 'container') {
              target.appendChild(maybeContainer)
            }
          }
        }
      }
    }
  } catch {}
  mounted = true
}

export function update(config: CelestialConfig) {
  if (!window.Celestial) return
  if (!mounted) return
  try {
    const sanitized = sanitizeConfig(config)
    const dt: Date | undefined = (sanitized as any).date
    const loc: [number, number] | undefined = (sanitized as any).geopos || (sanitized as any).location

    // Ha mindkettő megvan, használjuk skyview-t egyszer
    if ((window as any).Celestial.skyview && dt && loc) {
      (window as any).Celestial.skyview({ date: dt, location: loc })
      ;(window as any).Celestial.redraw?.()
      return
    }
    // Ha külön változik, állítsuk külön és egy redraw
    let changed = false
    if ((window as any).Celestial.date && dt) {
      (window as any).Celestial.date(dt)
      changed = true
    }
    if ((window as any).Celestial.location && loc) {
      (window as any).Celestial.location(loc)
      changed = true
    }
    if (changed) {
      (window as any).Celestial.redraw?.()
      return
    }

    // Egyéb változásoknál apply/display
    if (typeof window.Celestial.apply === 'function') {
      window.Celestial.apply(sanitized)
    } else {
      const merged = sanitizeConfig({ ...config, container: containerId! })
      window.Celestial.display(merged)
      // Ensure output resides in our container
      if (containerId) {
        const target = document.getElementById(containerId)
        if (target && !target.querySelector('canvas, svg')) {
          const canvases = Array.from(document.querySelectorAll('body > canvas')) as HTMLCanvasElement[]
          const lastCanvas = canvases[canvases.length - 1]
          if (lastCanvas && !target.contains(lastCanvas)) {
            target.appendChild(lastCanvas)
            const maybeContainer = lastCanvas.nextElementSibling as HTMLElement | null
            if (maybeContainer && maybeContainer.tagName.toLowerCase() === 'container') {
              target.appendChild(maybeContainer)
            }
          }
        }
      }
    }
    // Ensure output resides in our container
    if (containerId) {
      const target = document.getElementById(containerId)
      if (target && !target.querySelector('canvas, svg')) {
        const fallback = document.getElementById('celestial-map')
        if (fallback) {
          while (fallback.firstChild) target.appendChild(fallback.firstChild)
          fallback.remove()
        }
      }
    }
  } catch {
    // Reset and re-init as last resort
    try { window.Celestial.reset && window.Celestial.reset() } catch {}
    if (containerId) window.Celestial.display(sanitizeConfig({ ...defaults, ...config, container: containerId }))
  }
}

export function getSvgString(): string | null {
  if (!containerId) return null
  const el = document.getElementById(containerId)
  if (!el) return null
  const svg = el.querySelector('svg') as SVGSVGElement | null
  if (!svg) return null

  // Clone and strip scripts
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.querySelectorAll('script').forEach(s => s.remove())

  // Ensure xmlns for standalone svg
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

  return clone.outerHTML
}

export function destroy() {
  if (!window.Celestial) return
  try { window.Celestial.reset && window.Celestial.reset() } catch {}
  if (containerId) {
    const el = document.getElementById(containerId)
    if (el) el.innerHTML = ''
  }
  containerId = null
  mounted = false
}

export default { init, update, getSvgString, destroy, defaults }


