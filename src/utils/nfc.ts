/**
 * Web NFC helpers. Only works in secure context (HTTPS) and on supported devices
 * (e.g. Android Chrome). Use for linking NFC tag serial number to pods.
 */

export type NfcScanErrorCode =
  | 'NFC_NOT_SUPPORTED'
  | 'NFC_PERMISSION_DENIED'
  | 'NFC_ABORTED'
  | 'NFC_ERROR'

export class NfcScanError extends Error {
  constructor(
    message: string,
    public code: NfcScanErrorCode,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'NfcScanError'
  }
}

/** Check if Web NFC is available (secure context + NDEFReader). */
export function isNfcSupported(): boolean {
  if (typeof window === 'undefined') return false
  if (!window.isSecureContext) return false
  return 'NDEFReader' in window
}

/**
 * Start scanning for an NFC tag and resolve with the tag's serial number
 * when the first tag is read. Rejects if unsupported, permission denied, or aborted.
 */
export function scanNfcTag(options?: { signal?: AbortSignal }): Promise<string> {
  if (!isNfcSupported()) {
    return Promise.reject(
      new NfcScanError('NFC is not supported on this device or browser.', 'NFC_NOT_SUPPORTED')
    )
  }

  interface NDEFReadingEventLike {
    serialNumber?: string
  }
  const NDEFReader = (window as unknown as {
    NDEFReader: new () => {
      scan: (opts?: { signal?: AbortSignal }) => Promise<void>
      addEventListener: (type: string, fn: (e: NDEFReadingEventLike) => void) => void
      removeEventListener: (type: string, fn: (e: NDEFReadingEventLike) => void) => void
    }
  }).NDEFReader
  const ndef = new NDEFReader()
  const controller = new AbortController()
  const signal = options?.signal ?? controller.signal

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      ndef.removeEventListener('reading', onReading)
      ndef.removeEventListener('readingerror', onReadingError)
      try {
        controller.abort()
      } catch {
        // ignore
      }
    }

    const onReading = (event: NDEFReadingEventLike) => {
      const serial = event.serialNumber ?? ''
      if (serial) {
        cleanup()
        resolve(serial)
      }
    }

    const onReadingError = () => {
      cleanup()
      reject(
        new NfcScanError(
          'Tag was detected but could not be read. Empty or unformatted tags may not work—try an NDEF-formatted tag or format this tag in Android settings.',
          'NFC_ERROR'
        )
      )
    }

    ndef.addEventListener('reading', onReading)
    ndef.addEventListener('readingerror', onReadingError)

    ndef
      .scan({ signal })
      .then(() => {
        // Scan started; wait for reading or readingerror event
      })
      .catch((err: unknown) => {
        cleanup()
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            reject(new NfcScanError('NFC permission was denied.', 'NFC_PERMISSION_DENIED', err))
            return
          }
          if (err.name === 'AbortError') {
            reject(
              new NfcScanError(
                'Android took the tag and showed "New tag scanned / empty tag" without asking. To fix: go to Settings → Apps → Default apps (or open the app that handles tags) and clear its default for NFC/tag. Then scan again—Android should ask "Open with" and you can choose Chrome or Gryns.',
                'NFC_ABORTED',
                err
              )
            )
            return
          }
          if (err.name === 'NotSupportedError') {
            reject(new NfcScanError('NFC is not supported.', 'NFC_NOT_SUPPORTED', err))
            return
          }
        }
        reject(new NfcScanError('NFC scan failed.', 'NFC_ERROR', err))
      })

    signal?.addEventListener?.('abort', () => {
      reject(
        new NfcScanError(
          'Android took the tag and showed "New tag scanned / empty tag" without asking. To fix: go to Settings → Apps → Default apps (or the app that handles tags) and clear its default for NFC. Then scan again and choose Chrome or Gryns when asked.',
          'NFC_ABORTED'
        )
      )
    })
  })
}
