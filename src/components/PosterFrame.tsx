import CelestialCanvas from './CelestialCanvas'
import useEditorStore from '@/state/useEditorStore'

export default function PosterFrame() {
  const { canvasConfig } = useEditorStore(s => ({ canvasConfig: s.canvasConfig }))

  // Simple frame that hosts the celestial SVG and text layers around
  return (
    <div className="mx-auto max-w-[1200px]">
			<div className="border border-white/10 p-6" style={{ width: 1200, height: 1200 }}>
				<div className="celestial-container" style={{ width: '100%', height: '100%' }}>
          <CelestialCanvas config={{ ...canvasConfig, width: 1200, height: 1200 }} />
        </div>
      </div>
      
    </div>
  )
}


