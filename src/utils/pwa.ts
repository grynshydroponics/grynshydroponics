/**
 * PWA install / display-mode detection.
 */

export function isRunningAsPWA(): boolean {
  if (typeof window === 'undefined') return false
  // Standalone: launched from home screen (Android Chrome, etc.)
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari "Add to Home Screen"
  if ((navigator as { standalone?: boolean }).standalone === true) return true
  // Some browsers use fullscreen for installed PWA
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  return false
}

export function isMobileLike(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|webOS|Mobile/i.test(navigator.userAgent) || (navigator as { maxTouchPoints?: number }).maxTouchPoints > 0
}
