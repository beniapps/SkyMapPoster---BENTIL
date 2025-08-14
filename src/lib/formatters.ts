export function mmToPx(mm: number, dpi: number) {
  return Math.round((mm / 25.4) * dpi)
}

export const PosterSizesMm = {
  A1: { w: 594, h: 841 },
  A2: { w: 420, h: 594 },
  A3: { w: 297, h: 420 },
} as const


