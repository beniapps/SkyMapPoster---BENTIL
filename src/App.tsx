// BENTIL — Béni Attila László
import { CelestialLoader } from './components/CelestialLoader'
import CelestialCanvas from './components/CelestialCanvas'
import QuickExportButton from './components/QuickExportButton'
import BrandBadge from './components/BrandBadge'

export default function App() {
  return (
    <CelestialLoader>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="border border-white/10" style={{ width: 1200, height: 1200 }}>
          <div className="celestial-container" style={{ width: '100%', height: '100%' }}>
            <CelestialCanvas config={{ width: 1200, height: 1200 }} />
          </div>
        </div>
        <QuickExportButton />
        <BrandBadge />
      </div>
    </CelestialLoader>
  )
}


