/**
 * Returns a new array sorted alphabetically by the label from each item.
 * Uses localeCompare for correct string ordering.
 */
export function sortAlphabetically<T>(
  list: T[],
  getLabel: (item: T) => string
): T[] {
  return [...list].sort((a, b) => getLabel(a).localeCompare(getLabel(b), undefined, { sensitivity: 'base' }))
}
