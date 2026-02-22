/**
 * Capitalizes the first letter of a string; rest unchanged.
 * e.g. "basil" → "Basil", "bell pepper" → "Bell pepper"
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Capitalizes the first letter of each word (space-separated).
 * e.g. "bell pepper" → "Bell Pepper"
 */
export function capitalizeWords(str: string): string {
  if (!str) return str
  return str
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(' ')
}
