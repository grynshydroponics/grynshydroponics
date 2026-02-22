/**
 * Resolve asset paths so they work on all routes (e.g. /plant/basil) and on GitHub Pages.
 * In dev, app root is ''. In production at .../repo/..., app root is the first path segment.
 */
function getAppRoot(): string {
  if (typeof window === 'undefined') return ''
  if (import.meta.env.DEV) return ''
  const segs = window.location.pathname.split('/').filter(Boolean)
  return segs.length ? '/' + segs[0] : ''
}

/** Resolve a plant asset path (e.g. plants/basil.webp) to a full URL path for use in img src. */
export function resolvePlantAssetUrl(relativePath: string | null): string | null {
  if (!relativePath) return null
  const root = getAppRoot()
  return root ? `${root}/${relativePath}` : `/${relativePath}`
}
