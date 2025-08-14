// BENTIL — Béni Attila László
import { PropsWithChildren, useEffect, useState } from 'react'

type LoaderState = 'idle' | 'loading' | 'ready' | 'error'

const SCRIPTS = [
  'https://unpkg.com/d3@3/d3.min.js',
  'https://unpkg.com/d3-geo-projection@0.2.16/d3.geo.projection.min.js',
  'https://unpkg.com/d3-celestial/celestial.min.js',
]

function loadScriptSequentially(srcs: string[]): Promise<void> {
  return srcs.reduce<Promise<void>>((p, src) => {
    return p.then(() => new Promise<void>((resolve, reject) => {
      // Avoid duplicate load
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      const s = document.createElement('script')
      s.src = src
      s.async = false
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Script load failed: ${src}`))
      document.head.appendChild(s)
    }))
  }, Promise.resolve())
}

export function CelestialLoader({ children }: PropsWithChildren) {
  const [state, setState] = useState<LoaderState>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setState('loading')
        await loadScriptSequentially(SCRIPTS)
        // Wait until window.Celestial present
        const start = Date.now()
        while (!(window as any).Celestial) {
          if (Date.now() - start > 10000) throw new Error('Celestial nem érhető el (timeout)')
          await new Promise(r => setTimeout(r, 50))
        }
        if (!cancelled) setState('ready')
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || String(e))
          setState('error')
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  if (state === 'error') {
    return (
      <div className="p-6 text-red-300">
        <p>Hiba a könyvtárak betöltése közben.</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    )
  }

  if (state !== 'ready') {
    return (
      <div className="p-6 text-white/70">Betöltés…</div>
    )
  }

  return <>{children}</>
}

export default CelestialLoader


