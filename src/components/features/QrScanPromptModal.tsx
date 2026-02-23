import { useState, useEffect, useRef } from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { scanQrCode, isQrSupported, QrScanError } from '@/utils/qr'

const SCANNER_ELEMENT_ID = 'qr-prompt-modal-reader'

interface QrScanPromptModalProps {
  open: boolean
  onClose: () => void
  onResult: (value: string) => void
  title?: string
}

export function QrScanPromptModal({ open, onClose, onResult, title = 'Scan QR code' }: QrScanPromptModalProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedValue, setScannedValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supported = isQrSupported()

  const startScan = () => {
    if (!supported) return
    setError(null)
    setScannedValue(null)
    setScanning(true)
    abortRef.current = new AbortController()
  }

  const stopScan = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setScanning(false)
  }

  // When modal opens, start camera immediately (no extra "Scan QR code" click)
  useEffect(() => {
    if (!open) {
      stopScan()
      setScannedValue(null)
      return
    }
    if (supported) {
      setError(null)
      setScannedValue(null)
      setScanning(true)
      abortRef.current = new AbortController()
    }
  }, [open, supported])

  useEffect(() => {
    if (!open || !scanning || !abortRef.current) return
    const signal = abortRef.current.signal
    scanQrCode(SCANNER_ELEMENT_ID, { signal })
      .then((decoded) => {
        setScanning(false)
        setScannedValue(decoded)
        confirmTimeoutRef.current = setTimeout(() => {
          onResult(decoded)
          onClose()
        }, 800)
      })
      .catch((err) => {
        if (err instanceof QrScanError && err.code === 'QR_ABORTED') return
        setError(err instanceof QrScanError ? err.message : 'Scan failed.')
      })
      .finally(() => setScanning(false))
    return () => {
      abortRef.current?.abort()
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current)
        confirmTimeoutRef.current = null
      }
    }
  }, [open, scanning, onResult, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <QrCode className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-100">{title}</h2>

          {!supported ? (
            <p className="mt-2 text-sm text-slate-400">
              Camera is not available. Use HTTPS and allow camera access.
            </p>
          ) : scannedValue ? (
            <p className="mt-4 font-medium text-green-400">Scanned: {scannedValue}</p>
          ) : scanning ? (
            <>
              <p className="mt-2 text-sm text-slate-400">Point your camera at the QR code.</p>
              <div
                id={SCANNER_ELEMENT_ID}
                className="mt-4 min-h-[220px] w-full overflow-hidden rounded-lg bg-black"
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Use the same text on the label as the pod ID.</p>
          )}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex w-full flex-col gap-2">
            {supported && !scanning && (
              <Button className="w-full" onClick={startScan}>
                Scan QR code
              </Button>
            )}
            {scanning && (
              <Button variant="secondary" className="w-full" onClick={stopScan}>
                Cancel
              </Button>
            )}
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
