/**
 * Registers the PWA service worker with prompt mode.
 * When a new version is waiting, onNeedRefresh fires and we dispatch a custom event
 * so the app can show "Update available". The app calls getUpdateSW() when user confirms.
 */
import { registerSW } from 'virtual:pwa-register'

export const PWA_NEED_REFRESH_EVENT = 'pwa-need-refresh'

const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent(PWA_NEED_REFRESH_EVENT))
  },
  onOfflineReady() {
    // Optional: show "Ready to work offline"
  },
})

/**
 * Call this when the user taps "Update now" to reload with the new version.
 */
export function getUpdateSW(): (() => void) | undefined {
  return updateSW ?? undefined
}
