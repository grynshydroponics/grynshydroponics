/** Duration object from plant library (min/max + unit). */
export interface DurationSpec {
  min?: number
  max?: number
  unit?: string
}

/**
 * Format a duration for display, e.g. "8-28 days", "4 weeks".
 */
export function formatDuration(duration?: DurationSpec | null): string {
  if (duration?.min == null && duration?.max == null) return '—'
  const min = duration?.min ?? duration?.max
  const max = duration?.max ?? duration?.min
  const u = duration?.unit ?? ''
  const unit = u === 'week' ? 'weeks' : u === 'day' ? 'days' : u
  if (min == null && max == null) return '—'
  if (min === max) return `${min} ${unit}`
  return `${min}-${max} ${unit}`
}
