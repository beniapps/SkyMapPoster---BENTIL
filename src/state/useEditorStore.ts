import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CelestialConfig } from '@/lib/celestialAdapter'
import { defaults as celestialDefaults } from '@/lib/celestialAdapter'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

type PosterSize = 'A1' | 'A2' | 'A3'

type EditorState = {
  canvasConfig: CelestialConfig
  title: string
  subtitle: string
  metaLines: string
  posterSize: PosterSize
  dpi: number
  initDefaults: () => void
  loadFromHash: () => void
  saveToHash: () => void
  updateConfig: (partial: Partial<CelestialConfig>) => void
  setTexts: (v: { title?: string, subtitle?: string, metaLines?: string }) => void
}

const defaultState = {
  canvasConfig: celestialDefaults,
  title: 'Az Éjszaka Ege',
  subtitle: 'Saját csillagtérkép poszter',
  metaLines: 'Cluj-Napoca • 2024-01-01 22:00',
  posterSize: 'A2' as PosterSize,
  dpi: 300,
}

const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      initDefaults: () => {
        get().loadFromHash()
      },
      loadFromHash: () => {
        try {
          const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
          if (!hash) return
          const json = decompressFromEncodedURIComponent(hash)
          if (!json) return
          const next = JSON.parse(json)
          set({ ...get(), ...next })
        } catch {}
      },
      saveToHash: () => {
        const state = get()
        const payload = {
          canvasConfig: state.canvasConfig,
          title: state.title,
          subtitle: state.subtitle,
          metaLines: state.metaLines,
          posterSize: state.posterSize,
          dpi: state.dpi,
        }
        const enc = compressToEncodedURIComponent(JSON.stringify(payload))
        window.history.replaceState(null, '', `#${enc}`)
      },
      updateConfig: (partial) => set(s => ({ canvasConfig: { ...s.canvasConfig, ...partial } })),
      setTexts: (v) => set(s => ({ ...s, ...v })),
    }),
    { name: 'skymapposter-bentil' }
  )
)

export default useEditorStore


