/**
 * Compare two semver-like version strings (e.g. "0.5.0", "0.6").
 * Returns true if a > b.
 */
export function isVersionNewer(a: string, b: string): boolean {
  const partsA = a.split('.').map((n) => parseInt(n, 10) || 0)
  const partsB = b.split('.').map((n) => parseInt(n, 10) || 0)
  const maxLen = Math.max(partsA.length, partsB.length)
  for (let i = 0; i < maxLen; i++) {
    const na = partsA[i] ?? 0
    const nb = partsB[i] ?? 0
    if (na > nb) return true
    if (na < nb) return false
  }
  return false
}

export interface VersionResponse {
  version: string
}

/**
 * Fetch the app version from the server (bypasses cache).
 * Use the same base as the app so it works on GitHub Pages.
 */
export async function fetchServerVersion(baseUrl: string): Promise<string | null> {
  const url = `${baseUrl.replace(/\/$/, '')}/version.json?t=${Date.now()}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data: VersionResponse = await res.json()
    return data.version ?? null
  } catch {
    return null
  }
}
