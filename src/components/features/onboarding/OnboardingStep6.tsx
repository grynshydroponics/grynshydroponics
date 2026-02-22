import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  onFinish: () => void
}

export function OnboardingStep6({ onFinish }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-muted">
          <WifiOff className="h-10 w-10 text-slate-500" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-slate-100">NFC (Coming Soon)</h2>
        <p className="mt-2 text-slate-400">
          Tag your pods with NFC for quick identification. This feature will be available in a future update.
        </p>
      </div>
      <Button className="w-full" onClick={onFinish}>
        Go to Dashboard
      </Button>
    </div>
  )
}
