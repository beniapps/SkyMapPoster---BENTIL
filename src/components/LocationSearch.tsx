import { useEffect, useRef, useState } from 'react'
import { LocateFixed } from 'lucide-react'

type GeoItem = {
  id: string
  display_name: string
  lat: string
  lon: string
}

export default function LocationSearch({ onSelect }: { onSelect: (v: { lat: number, lon: number, label: string }) => void }) {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<GeoItem[]>([])
  const [open, setOpen] = useState(false)
  const tRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!q || q.length < 2) {
      setItems([])
      return
    }
    if (tRef.current) window.clearTimeout(tRef.current)
    tRef.current = window.setTimeout(async () => {
      try {
        // Photon (OSM) – CORS-barát, gyors
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`
        const res = await fetch(url)
        const json = await res.json()
        const data: GeoItem[] = (json?.features || []).map((f: any) => ({
          id: f.properties?.osm_id || `${f.properties?.name}-${f.geometry?.coordinates?.join(',')}`,
          display_name: [f.properties?.name, f.properties?.street, f.properties?.city, f.properties?.state, f.properties?.country]
            .filter(Boolean)
            .join(', '),
          lat: String(f.geometry?.coordinates?.[1] ?? ''),
          lon: String(f.geometry?.coordinates?.[0] ?? ''),
        }))
        setItems(data)
        setOpen(true)
      } catch {
        setItems([])
      }
    }, 300)
    return () => { if (tRef.current) window.clearTimeout(tRef.current) }
  }, [q])

  function choose(item: GeoItem) {
    setQ(item.display_name)
    setItems([])
    setOpen(false)
    onSelect({ lat: Number(item.lat), lon: Number(item.lon), label: item.display_name })
  }

  async function locateHere() {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      let label = 'Jelenlegi hely'
      try {
        const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en`)
        const j = await r.json()
        const f = j?.features?.[0]
        if (f) {
          label = [f.properties?.name, f.properties?.street, f.properties?.city, f.properties?.state, f.properties?.country]
            .filter(Boolean)
            .join(', ')
        }
      } catch {}
      setQ(label)
      setItems([])
      setOpen(false)
      onSelect({ lat, lon, label })
    }, () => {}, { enableHighAccuracy: true, timeout: 5000 })
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Írd be a helyet (pl. Székelyudvarhely)"
        className="border px-2 py-1 pr-10 w-full truncate"
        title={q}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      <button
        type="button"
        aria-label="Itt (jelenlegi hely)"
        title="Itt (jelenlegi hely)"
        className="absolute right-1 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded hover:bg-black/5 flex items-center gap-1"
        onClick={locateHere}
      >
        <LocateFixed className="w-4 h-4" />
        <span className="text-xs">Itt</span>
      </button>
      {open && items.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white text-black shadow">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => choose(it)}
              className="block w-full text-left px-2 py-1 hover:bg-black/5 truncate"
              title={it.display_name}
            >
              {it.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


