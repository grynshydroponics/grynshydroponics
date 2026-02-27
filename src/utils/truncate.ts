/**
 * Truncate string to maxLength, appending ellipsis if truncated.
 */
export function truncateText(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}
