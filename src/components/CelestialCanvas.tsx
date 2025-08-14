// BENTIL — Béni Attila László
import { useEffect, useMemo, useRef } from 'react'
import * as adapter from '@/lib/celestialAdapter'

type Props = {
  config: adapter.CelestialConfig
}

export default function CelestialCanvas({ config }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const uidRef = useRef<string>('celestial-' + Math.random().toString(36).slice(2))
  const debounceMs = 150
  const debouncer = useRef<number | null>(null)

  const merged = useMemo(() => ({
    ...adapter.defaults,
    ...config,
    container: `#${uidRef.current}`,
    width: (config as any)?.width ?? 1200,
    height: (config as any)?.height ?? 1200,
    adapt: false,
  }), [config])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.id = uidRef.current
    adapter.init(el, merged)

    // Animáció kikapcsolva a stabil frissítéshez
    return () => {
      adapter.destroy()
    }
  // We only want to init on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (debouncer.current) window.clearTimeout(debouncer.current)
    debouncer.current = window.setTimeout(() => {
      adapter.update(merged)
    }, debounceMs)
  }, [merged])

  return (
    <div ref={containerRef} className="w-full h-full select-none" />
  )
}


