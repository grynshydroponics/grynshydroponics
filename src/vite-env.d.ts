/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
  }): (reloadPage?: boolean) => void
}
