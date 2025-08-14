import { Canvg } from 'canvg'

export async function svgToPngBlob(svgString: string, widthPx: number, heightPx: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = widthPx
  canvas.height = heightPx
  const ctx = canvas.getContext('2d')!
  const v = await Canvg.from(ctx, svgString)
  await v.render()
  return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/png'))
}

export async function downloadPng(filename: string, svgString: string, widthPx: number, heightPx: number) {
  const blob = await svgToPngBlob(svgString, widthPx, heightPx)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}


