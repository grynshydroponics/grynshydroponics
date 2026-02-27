/**
 * Date as yyyy-mm-dd for <input type="date"> value.
 */
export function toDateInputValue(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

/**
 * Date formatted for display (locale string).
 */
export function formatDisplayDate(ts: number): string {
  return new Date(ts).toLocaleDateString()
}
