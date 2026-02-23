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
}

export function QrScanModal({ open, onClose }: QrScanModalProps) {
  const navigate = useNavigate()
  const { pods } = useTowerContext()
  const [status, setStatus] = useState<'idle' | 'scanning' | 'found' | 'not_found' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const supported = isQrSupported()

  const startScan = () => {
    if (!supported) return
    setStatus('scanning')
    setMessage('')
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
    if (!open) stopScan()
  }, [open])

  useEffect(() => {
    if (!open || status !== 'scanning' || !abortRef.current) return
    const signal = abortRef.current.signal
    scanQrCode(SCANNER_ELEMENT_ID, { signal })
      .then((decoded) => {
        const pod = pods.find((p) => p.id === decoded)
        if (pod) {
          setStatus('found')
          onClose()
          navigate(`/pod/${pod.id}`, { replace: true })
        } else {
          setStatus('not_found')
          setMessage('No pod is linked to this QR code. Add a pod and scan a QR to link it.')
        }
      })
      .catch((err) => {
        if (err instanceof QrScanError && err.code === 'QR_ABORTED') return
        setStatus('error')
        setMessage(err instanceof QrScanError ? err.message : 'Scan failed.')
      })
    return () => {
      abortRef.current?.abort()
    }
  }, [open, status, pods, onClose, navigate])

  useEffect(() => () => stopScan(), [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <QrCode className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-100">Scan to go to pod</h2>

          {!supported ? (
            <p className="mt-2 text-sm text-slate-400">
              Camera is not available. Use HTTPS and allow camera access to scan QR codes.
            </p>
          ) : status === 'scanning' ? (
            <>
              <p className="mt-2 text-sm text-slate-400">Point your camera at the QR code on a pod.</p>
              <div
                id={SCANNER_ELEMENT_ID}
                className="mt-4 min-h-[220px] w-full overflow-hidden rounded-lg bg-black"
              />
            </>
          ) : status === 'not_found' ? (
            <p className="mt-2 text-sm text-slate-400">{message}</p>
          ) : status === 'error' ? (
            <p className="mt-2 text-sm text-red-400">{message}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Link a QR code when adding a pod; then scanning that code will open the pod.
            </p>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {supported && status !== 'scanning' && (
              <Button className="w-full" onClick={startScan}>
                {status === 'idle' ? 'Start scan' : 'Scan again'}
              </Button>
            )}
            {status === 'scanning' && (
              <Button variant="secondary" className="w-full" onClick={stopScan}>
                Cancel scan
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
