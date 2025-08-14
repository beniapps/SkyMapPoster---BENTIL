import useEditorStore from '@/state/useEditorStore'
import { PosterSizesMm, mmToPx } from '@/lib/formatters'
import { downloadSvg } from '@/lib/exportSvg'
import { downloadPng } from '@/lib/exportPng'
import { downloadPdf } from '@/lib/exportPdf'
import * as adapter from '@/lib/celestialAdapter'
import { buildPosterSvg } from '@/lib/posterCompose'

export default function ExportPanel() {
  const { posterSize, dpi, title, subtitle, metaLines } = useEditorStore(s => ({
    posterSize: s.posterSize,
    dpi: s.dpi,
    title: s.title,
    subtitle: s.subtitle,
    metaLines: s.metaLines,
  }))

  const onExportSvg = () => {
    const star = adapter.getSvgString()
    if (!star) return
    const mm = PosterSizesMm[posterSize]
    const poster = buildPosterSvg({
      starSvg: star,
      posterWidthMm: mm.w,
      posterHeightMm: mm.h,
      title,
      subtitle,
      metaLines,
    })
    downloadSvg('starmap.svg', poster)
  }

  const onExportPng = async () => {
    const star = adapter.getSvgString()
    if (!star) return
    const mm = PosterSizesMm[posterSize]
    const poster = buildPosterSvg({
      starSvg: star,
      posterWidthMm: mm.w,
      posterHeightMm: mm.h,
      title,
      subtitle,
      metaLines,
    })
    const w = mmToPx(mm.w, dpi)
    const h = mmToPx(mm.h, dpi)
    await downloadPng('starmap.png', poster, w, h)
  }

  const onExportPdf = async () => {
    const star = adapter.getSvgString()
    if (!star) return
    const mm = PosterSizesMm[posterSize]
    const poster = buildPosterSvg({
      starSvg: star,
      posterWidthMm: mm.w,
      posterHeightMm: mm.h,
      title,
      subtitle,
      metaLines,
    })
    await downloadPdf('starmap.pdf', poster, mm.w, mm.h)
  }

  return null
}


