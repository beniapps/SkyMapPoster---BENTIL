// BENTIL — Béni Attila László
import { useMemo, useState } from 'react'
import { CelestialLoader } from '@/components/CelestialLoader'
import CelestialCanvas from '@/components/CelestialCanvas'
import useEditorStore from '@/state/useEditorStore'
import LocationSearch from '@/components/LocationSearch'
import { Clock } from 'lucide-react'
import BrandBadge from '@/components/BrandBadge'

export default function Studio() {
  const { canvasConfig } = useEditorStore(s => ({ canvasConfig: s.canvasConfig }))
  const [lat, setLat] = useState(46.303)
  const [lon, setLon] = useState(25.298)
  const [date, setDate] = useState('1998-10-08T22:00')

  function formatLocalDatetime(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }

  async function onHere() {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude as any)
        setLon(pos.coords.longitude as any)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  function onNow() {
    setDate(formatLocalDatetime(new Date()))
  }

  const liveConfig = useMemo(() => ({
    ...canvasConfig,
    // A d3-celestial API-ja [lat, lon] sorrendet vár location/geopos mezőkön
    geopos: [Number(lat), Number(lon)],
    location: [Number(lat), Number(lon)],
    datetime: date.replace('T', ' '),
    follow: 'zenith',
  }), [canvasConfig, lat, lon, date])

  return (
    <CelestialLoader>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[360px_1fr]">
        <aside className="p-4 border-r border-black/10 space-y-4">
          <h2 className="text-xl font-semibold">Studio</h2>
          <LocationSearch onSelect={({ lat: la, lon: lo, label }) => {
            setLat(la as any)
            setLon(lo as any)
          }} />
          <div className="text-xs text-black/50">&nbsp;</div>
          <div className="space-y-2">
            <label className="block text-sm">Helyszín (lat, lon)</label>
            <div className="flex gap-2">
              <input
                className="border px-2 py-1 w-full"
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={lat.toFixed(6)}
                onChange={e => setLat(parseFloat(e.target.value) as any)}
              />
              <input
                className="border px-2 py-1 w-full"
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={lon.toFixed(6)}
                onChange={e => setLon(parseFloat(e.target.value) as any)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Dátum/idő</label>
            <div className="relative">
              <input className="border px-2 py-1 pr-14 w-full" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
              <button type="button" aria-label="Most (aktuális idő)" title="Most (aktuális idő)" className="absolute right-1 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded hover:bg-black/5 flex items-center gap-1" onClick={onNow}>
                <Clock className="w-4 h-4" />
                <span className="text-xs">Most</span>
              </button>
            </div>
          </div>
          <p className="text-sm opacity-60">További opciók (forma, háttér, presetek) következnek.</p>
        </aside>
        <div className="p-4">
          <div className="mx-auto border border-black/10" style={{ width: 800, height: 800 }}>
            <div className="celestial-container" style={{ width: '100%', height: '100%' }}>
              <CelestialCanvas key={`${lat}-${lon}-${date}`} config={{ ...liveConfig, width: 800, height: 800 }} />
            </div>
          </div>
        </div>
        <BrandBadge />
      </div>
    </CelestialLoader>
  )
}


