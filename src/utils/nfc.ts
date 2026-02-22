/**
 * Web NFC helpers. Only works in secure context (HTTPS) and on supported devices
 * (e.g. Android Chrome). Use for linking NFC tag serial number to pods.
 *
 * Important: scanNfcTag() and formatTag() must be called from a clear user gesture
 * (e.g. button click) so that Android allows the NFC operation.
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

/** Handshake text written to empty tags so Android treats them as NDEF (avoids system "empty tag" dialog). */
export const NFC_HANDSHAKE_RECORD = 'tower-app-ready'

/** Check if Web NFC is available (secure context + NDEFReader). */
export function isNfcSupported(): boolean {
  if (typeof window === 'undefined') return false
  if (!window.isSecureContext) return false
  return 'NDEFReader' in window
}

interface NDEFReaderLike {
  scan(opts?: { signal?: AbortSignal }): Promise<void>
  addEventListener(type: string, fn: (e: NDEFReadingEventLike) => void): void
  removeEventListener(type: string, fn: (e: NDEFReadingEventLike) => void): void
}

interface NDEFReadingEventLike {
  serialNumber?: string
}

function getNDEFReader(): NDEFReaderLike {
  if (!isNfcSupported()) throw new NfcScanError('NFC is not supported.', 'NFC_NOT_SUPPORTED')
  return new (window as unknown as { NDEFReader: new () => NDEFReaderLike }).NDEFReader()
}

/**
 * Start scanning for an NFC tag and resolve with the tag's serial number
 * when the first tag is read. Must be called from a user gesture (e.g. button click).
 * Scan is started first; onreading is attached immediately after the scan promise resolves.
 */
export function scanNfcTag(options?: { signal?: AbortSignal }): Promise<string> {
  if (!isNfcSupported()) {
    return Promise.reject(
      new NfcScanError('NFC is not supported on this device or browser.', 'NFC_NOT_SUPPORTED')
    )
  }

  const ndef = getNDEFReader()
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
          'Tag was detected but could not be read. Use "Format empty tag" first, or format in Android settings.',
          'NFC_ERROR'
        )
      )
    }

    // Call scan() immediately (must run in same stack as user gesture).
    ndef
      .scan({ signal })
      .then(() => {
        // Add onreading immediately after scan resolves (required for some browsers).
        ndef.addEventListener('reading', onReading)
        ndef.addEventListener('readingerror', onReadingError)
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            reject(new NfcScanError('NFC permission was denied.', 'NFC_PERMISSION_DENIED', err))
            return
          }
          if (err.name === 'AbortError') {
            reject(
              new NfcScanError(
                'Android took the tag and showed "New tag scanned / empty tag" without asking. Clear the default app for NFC in Settings, or format the tag first so it is not empty.',
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
          'Scan stopped. If Android showed "New tag scanned / empty tag", format the tag first or clear NFC default app in Settings.',
          'NFC_ABORTED'
        )
      )
    })
  })
}

/**
 * Write a small NDEF text record to an empty/blank tag so Android treats it as NDEF
 * and does not show the system "New tag scanned / empty tag" dialog.
 * Must be called from a user gesture (e.g. button click). User holds tag to device.
 */
export function formatTag(options?: { signal?: AbortSignal }): Promise<void> {
  if (!isNfcSupported()) {
    return Promise.reject(
      new NfcScanError('NFC is not supported on this device or browser.', 'NFC_NOT_SUPPORTED')
    )
  }

  const ndef = getNDEFReader() as NDEFReaderLike & {
    write(message: string, opts?: { signal?: AbortSignal; overwrite?: boolean }): Promise<void>
  }
  const controller = new AbortController()
  const signal = options?.signal ?? controller.signal

  return ndef
    .write(NFC_HANDSHAKE_RECORD, { signal, overwrite: true })
    .catch((err: unknown) => {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          throw new NfcScanError('NFC permission was denied.', 'NFC_PERMISSION_DENIED', err)
        }
        if (err.name === 'AbortError') {
          throw new NfcScanError('Format was cancelled.', 'NFC_ABORTED', err)
        }
      }
      throw new NfcScanError('Failed to format tag.', 'NFC_ERROR', err)
    })
}
