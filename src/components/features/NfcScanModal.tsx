import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Nfc } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTowerContext } from '@/context/TowerContext'
import { scanNfcTag, formatTag, isNfcSupported, NfcScanError } from '@/utils/nfc'

interface NfcScanModalProps {
  open: boolean
  onClose: () => void
}

export function NfcScanModal({ open, onClose }: NfcScanModalProps) {
  const navigate = useNavigate()
  const { pods } = useTowerContext()
  const [status, setStatus] = useState<'idle' | 'scanning' | 'found' | 'not_found' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [formatting, setFormatting] = useState(false)
  const [formatMessage, setFormatMessage] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const supported = isNfcSupported()

  const handleFormatTag = () => {
    if (!supported) return
    setFormatMessage(null)
    setFormatting(true)
    formatTag()
      .then(() => setFormatMessage('Tag formatted. You can scan it now.'))
      .catch((err) => setFormatMessage(err instanceof NfcScanError ? err.message : 'Format failed.'))
      .finally(() => setFormatting(false))
  }

  const startScan = () => {
    if (!supported) return
    setStatus('scanning')
    setMessage('')
    abortRef.current = new AbortController()
    scanNfcTag({ signal: abortRef.current.signal })
      .then((serial) => {
        const pod = pods.find((p) => p.id === serial)
        if (pod) {
          setStatus('found')
          onClose()
          navigate(`/pod/${pod.id}`, { replace: true })
        } else {
          setStatus('not_found')
          setMessage('No pod is linked to this tag. Add a pod and scan a tag to link it.')
        }
      })
      .catch((err) => {
        if (err instanceof NfcScanError && err.code === 'NFC_ABORTED') return
        setStatus('error')
        setMessage(err instanceof NfcScanError ? err.message : 'Scan failed.')
      })
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
    }
  }, [open])

  useEffect(() => {
    return () => stopScan()
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Nfc className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-100">Scan to go to pod</h2>

          {!supported ? (
            <p className="mt-2 text-sm text-slate-400">
              NFC is not supported on this device or browser. Use Android Chrome over HTTPS to scan.
            </p>
          ) : status === 'scanning' ? (
            <p className="mt-2 text-sm text-slate-400">Hold your device near an NFC tag on a pod.</p>
          ) : status === 'not_found' ? (
            <p className="mt-2 text-sm text-slate-400">{message}</p>
          ) : status === 'error' ? (
            <p className="mt-2 text-sm text-red-400">{message}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Link a tag when adding a pod; then scanning that tag will open the pod. If Android shows &quot;empty tag&quot;, format the tag first.
            </p>
          )}
          {formatMessage && (
            <p className={`mt-2 text-sm ${formatMessage.startsWith('Tag formatted') ? 'text-green-400' : 'text-red-400'}`}>
              {formatMessage}
            </p>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {supported && status !== 'scanning' && (
              <Button className="w-full" onClick={startScan}>
                {status === 'idle' ? 'Start scan' : 'Scan again'}
              </Button>
            )}
            {supported && !formatting && (
              <Button variant="secondary" className="w-full" onClick={handleFormatTag}>
                Format empty tag
              </Button>
            )}
            {formatting && <p className="text-center text-sm text-slate-400">Hold tag to device…</p>}
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
