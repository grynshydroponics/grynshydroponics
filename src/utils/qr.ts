/**
 * QR code scanning via camera. Works on iOS and Android in secure context (HTTPS).
 * Use for linking QR code content to pods (same idea as NFC tag ID).
 */

import { Html5Qrcode } from 'html5-qrcode'

export class QrScanError extends Error {
  constructor(
    message: string,
    public code: 'QR_NOT_SUPPORTED' | 'QR_PERMISSION_DENIED' | 'QR_ABORTED' | 'QR_ERROR',
    public cause?: unknown
  ) {
    super(message)
    this.name = 'QrScanError'
  }
}

/** Check if camera/QR scanning is likely supported (secure context + mediaDevices). */
export function isQrSupported(): boolean {
  if (typeof window === 'undefined') return false
  if (!window.isSecureContext) return false
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

/**
 * Scan a QR code using the device camera. Renders the camera into the element with the given id.
 * Must be called from a user gesture (e.g. button click). Resolves with the decoded string.
 */
export function scanQrCode(
  elementId: string,
  options?: { signal?: AbortSignal }
): Promise<string> {
  if (!isQrSupported()) {
    return Promise.reject(
      new QrScanError('Camera is not supported or not in a secure context (use HTTPS).', 'QR_NOT_SUPPORTED')
    )
  }

  let scanner: Html5Qrcode | null = null

  const cleanup = () => {
    if (scanner) {
      scanner
        .stop()
        .catch(() => {})
      scanner.clear()
      scanner = null
    }
  }

  const run = async (): Promise<string> => {
    const cameras = await Html5Qrcode.getCameras()
    if (!cameras || cameras.length === 0) {
      throw new QrScanError('No camera found.', 'QR_ERROR')
    }
    const back = cameras.find((c) => /back|rear|environment/i.test(c.label))
    const cameraId = back?.id ?? cameras[0].id

    scanner = new Html5Qrcode(elementId)
    const config = { fps: 10, qrbox: { width: 250, height: 250 } }

    return new Promise((resolve, reject) => {
      let settled = false
      const settle = (fn: () => void) => {
        if (settled) return
        settled = true
        options?.signal?.removeEventListener?.('abort', onAbort)
        fn()
      }
      const onAbort = () => {
        cleanup()
        settle(() => reject(new QrScanError('Scan cancelled.', 'QR_ABORTED')))
      }
      options?.signal?.addEventListener('abort', onAbort)

      scanner!
        .start(
          cameraId,
          config,
          (decodedText) => {
            cleanup()
            settle(() => resolve(decodedText))
          },
          () => {
            // Ignore continuous scan errors (no QR in frame)
          }
        )
        .catch((err: unknown) => {
          cleanup()
          settle(() => {
            if (err instanceof Error) {
              if (err.name === 'NotAllowedError') {
                reject(new QrScanError('Camera permission was denied.', 'QR_PERMISSION_DENIED', err))
                return
              }
              if (err.name === 'AbortError') {
                reject(new QrScanError('Scan cancelled.', 'QR_ABORTED', err))
                return
              }
            }
            reject(new QrScanError('Camera failed.', 'QR_ERROR', err))
          })
        })
    })
  }

  return run()
}
