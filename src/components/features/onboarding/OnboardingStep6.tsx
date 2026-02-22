import { useState } from 'react'
import { Nfc } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { scanNfcTag, formatTag, isNfcSupported, NfcScanError } from '@/utils/nfc'

interface Props {
  nfcPodId: string | null
  onNfcChange: (id: string | null) => void
  onFinish: () => void
}

export function OnboardingStep6({ nfcPodId, onNfcChange, onFinish }: Props) {
  const [scanning, setScanning] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supported = isNfcSupported()

  const handleFormatTag = () => {
    setError(null)
    setFormatting(true)
    formatTag()
      .then(() => setError(null))
      .catch((e) => setError(e instanceof NfcScanError ? e.message : 'Format failed.'))
      .finally(() => setFormatting(false))
  }

  const handleScan = async () => {
    setError(null)
    setScanning(true)
    try {
      const serial = await scanNfcTag()
      onNfcChange(serial)
    } catch (err) {
      setError(err instanceof NfcScanError ? err.message : 'Scan failed.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Link NFC tag (optional)</h2>
        <p className="mt-2 text-slate-400">
          Scan a tag to use its ID for this pod. If Android shows &quot;empty tag&quot;, tap Format empty tag first.
        </p>
        {supported ? (
          <div className="mt-6">
            {nfcPodId ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-600 bg-surface-muted px-3 py-2">
                <span className="truncate text-sm text-slate-300" title={nfcPodId}>
                  Tag: {nfcPodId}
                </span>
                <Button variant="ghost" size="sm" onClick={() => { onNfcChange(null); setError(null); }}>
                  Clear
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleScan}
                  disabled={scanning || formatting}
                >
                  <Nfc className="mr-2 h-4 w-4" />
                  {scanning ? 'Hold device near tag...' : 'Scan tag'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-slate-400"
                  onClick={handleFormatTag}
                  disabled={scanning || formatting}
                >
                  {formatting ? 'Hold tag to device…' : 'Format empty tag'}
                </Button>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            NFC is not supported on this device. You can link a tag later when adding pods from a tower.
          </p>
        )}
      </div>
      <Button className="w-full" onClick={onFinish}>
        Go to Dashboard
      </Button>
    </div>
  )
}
