import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTowerContext } from '@/context/TowerContext'
import { scanQrCode, isQrSupported, QrScanError } from '@/utils/qr'

const SCANNER_ELEMENT_ID = 'qr-scan-modal-reader'

interface QrScanModalProps {
  open: boolean
  onClose: () => void
  /** When set, returns scanned/entered value to parent (e.g. Add pod). When unset, looks up pod and navigates (scan to go to existing). */
  onResult?: (value: string) => void
  /** Modal title. Defaults: "Scan to go to pod" when navigating, "Scan QR code" when onResult is set. */
  title?: string
}

export function QrScanModal({ open, onClose, onResult, title }: QrScanModalProps) {
  const navigate = useNavigate()
  const { pods } = useTowerContext()
  const isCallbackMode = onResult != null

  const [status, setStatus] = useState<'idle' | 'scanning' | 'found' | 'not_found' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState<string>('')
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supported = isQrSupported()
  const displayTitle = title ?? (isCallbackMode ? 'Scan QR code' : 'Scan to go to pod')

  const submitCode = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (isCallbackMode) {
      onResult?.(trimmed)
      onClose()
    } else {
      setMessage('')
      const pod = pods.find((p) => p.id === trimmed || p.linkedQrCode === trimmed)
      if (pod) {
        onClose()
        navigate(`/pod/${pod.id}`, { replace: true })
      } else {
        setStatus('not_found')
        setLastScanned(trimmed)
        setMessage('No pod is linked to this code. Add a pod and link a QR code to it.')
      }
    }
  }

  const startScan = () => {
    if (!supported) return
    setStatus('scanning')
    setMessage('')
    setError(null)
    setLastScanned(null)
    if (isCallbackMode) setInputValue('')
    abortRef.current = new AbortController()
  }

  const stopScan = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setStatus('idle')
    setMessage('')
  }

  useEffect(() => {
    if (!open) {
      stopScan()
      setLastScanned(null)
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current)
        confirmTimeoutRef.current = null
      }
      return
    }
    if (supported) {
      setMessage('')
      setError(null)
      setLastScanned(null)
      if (isCallbackMode) setInputValue('')
      setStatus('scanning')
      abortRef.current = new AbortController()
    }
  }, [open, supported, isCallbackMode])

  useEffect(() => {
    if (!open || status !== 'scanning' || !abortRef.current) return
    const signal = abortRef.current.signal
    scanQrCode(SCANNER_ELEMENT_ID, { signal })
      .then((decoded) => {
        setLastScanned(decoded)
        if (isCallbackMode) {
          setInputValue(decoded)
          onResult?.(decoded)
          setStatus('idle')
          confirmTimeoutRef.current = setTimeout(() => onClose(), 800)
        } else {
          const pod = pods.find((p) => p.id === decoded || p.linkedQrCode === decoded)
          if (pod) {
            setStatus('found')
            onClose()
            navigate(`/pod/${pod.id}`, { replace: true })
          } else {
            setStatus('not_found')
            setMessage('No pod is linked to this code. Add a pod and link a QR code to it.')
          }
        }
      })
      .catch((err) => {
        if (err instanceof QrScanError && err.code === 'QR_ABORTED') return
        setStatus('idle')
        if (isCallbackMode) {
          setError(err instanceof QrScanError ? err.message : 'Scan failed.')
        } else {
          setStatus('error')
          setMessage(err instanceof QrScanError ? err.message : 'Scan failed.')
        }
      })
    return () => {
      abortRef.current?.abort()
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current)
        confirmTimeoutRef.current = null
      }
    }
  }, [open, status, isCallbackMode, pods, onClose, onResult, navigate])

  useEffect(
    () => () => {
      stopScan()
    },
    []
  )

  if (!open) return null

  const showManualEntry = isCallbackMode
  const scannedSuccess = isCallbackMode && lastScanned != null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <QrCode className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-100">{displayTitle}</h2>

          {!supported ? (
            <p className="mt-2 text-sm text-slate-400">
              Camera is not available. Use HTTPS and allow camera access to scan QR codes.
            </p>
          ) : status === 'scanning' ? (
            <>
              <p className="mt-2 text-sm text-slate-400">
                {isCallbackMode
                  ? 'Point your camera at the QR code.'
                  : 'Point your camera at the QR code on a pod.'}
              </p>
              <div
                id={SCANNER_ELEMENT_ID}
                className="mt-4 mx-auto w-full max-w-xs overflow-hidden rounded-lg bg-black"
              />
            </>
          ) : status === 'not_found' ? (
            <>
              <p className="mt-2 font-medium text-green-400">Scanned: {lastScanned}</p>
              <p className="mt-1 text-sm text-slate-400">{message}</p>
            </>
          ) : scannedSuccess ? (
            <p className="mt-4 font-medium text-green-400">Scanned: {lastScanned}</p>
          ) : status === 'error' || error ? (
            <p className="mt-2 text-sm text-red-400">{message || error}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              {isCallbackMode
                ? 'Use the same text on the label as the pod ID.'
                : 'Link a QR code when adding a pod; then scanning that code will open the pod.'}
            </p>
          )}
          {error && !scannedSuccess && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}

          {showManualEntry && (
            <div className="mt-4 w-full">
              <label className="mb-1 block text-left text-sm font-medium text-slate-400">
                Or enter code manually
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCode(inputValue)}
                placeholder="e.g. a1"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {showManualEntry && inputValue.trim() && (
              <Button className="w-full" onClick={() => submitCode(inputValue)}>
                Use this code
              </Button>
            )}
            {supported && status !== 'scanning' && !scannedSuccess && (
              <Button variant="secondary" className="w-full" onClick={startScan}>
                {status === 'idle'
                  ? isCallbackMode
                    ? 'Scan QR code'
                    : 'Start scan'
                  : 'Scan again'}
              </Button>
            )}
            {status === 'scanning' && (
              <Button variant="secondary" className="w-full" onClick={stopScan}>
                {isCallbackMode ? 'Cancel' : 'Cancel scan'}
              </Button>
            )}
            {scannedSuccess && (
              <p className="text-center text-xs text-slate-500">
                Code set. Closing in a moment…
              </p>
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

