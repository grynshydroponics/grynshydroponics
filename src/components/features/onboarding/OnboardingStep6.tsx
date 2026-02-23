import { useState } from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { isQrSupported } from '@/utils/qr'
import { QrScanPromptModal } from '@/components/features/QrScanPromptModal'

interface Props {
  nfcPodId: string | null
  onNfcChange: (id: string | null) => void
  onFinish: () => void
}

export function OnboardingStep6({ nfcPodId, onNfcChange, onFinish }: Props) {
  const [qrPromptOpen, setQrPromptOpen] = useState(false)

  const supported = isQrSupported()

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Link QR code (optional)</h2>
        <p className="mt-2 text-slate-400">
          Scan the QR code on the pod label to use its ID for this pod. Use the same text on the label in your label maker.
        </p>
        {supported ? (
          <div className="mt-6">
            {nfcPodId ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-600 bg-surface-muted px-3 py-2">
                <span className="truncate text-sm text-slate-300" title={nfcPodId}>
                  Code: {nfcPodId}
                </span>
                <Button variant="ghost" size="sm" onClick={() => onNfcChange(null)}>
                  Clear
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setQrPromptOpen(true)}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR code
              </Button>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Camera is not available. You can link a QR code later when adding pods from a tower.
          </p>
        )}
      </div>
      <Button className="w-full" onClick={onFinish}>
        Go to Dashboard
      </Button>
      <QrScanPromptModal
        open={qrPromptOpen}
        onClose={() => setQrPromptOpen(false)}
        onResult={(value) => { onNfcChange(value); setQrPromptOpen(false); }}
        title="Scan pod QR code"
      />
    </div>
  )
}
