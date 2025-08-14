import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function writeHash(obj: any) {
  const enc = compressToEncodedURIComponent(JSON.stringify(obj))
  window.history.replaceState(null, '', `#${enc}`)
}

export function readHash<T = any>(): T | null {
  const h = window.location.hash
  if (!h || h.length <= 1) return null
  try {
    const json = decompressFromEncodedURIComponent(h.slice(1))
    if (!json) return null
    return JSON.parse(json) as T
  } catch {
    return null
  }
}


