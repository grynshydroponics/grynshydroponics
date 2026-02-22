import { useState, useEffect } from 'react'
import { Leaf, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { isRunningAsPWA, isMobileLike } from '@/utils/pwa'

const SKIP_GATE_KEY = 'gryns_skip_install_gate'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallGate({ children }: { children: React.ReactNode }) {
  const isPWA = isRunningAsPWA()
  const skipped = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SKIP_GATE_KEY) === '1'
  // When opened as PWA (or user previously skipped), show app immediately — no install screen, go straight to splash then app
  const [showApp, setShowApp] = useState(() => isPWA || skipped)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  const isMobile = isMobileLike()

  useEffect(() => {
    if (isPWA || skipped) {
      setShowApp(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isPWA, skipped])

  const handleInstall = async () => {
    if (!installPrompt) return
    setInstalling(true)
    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setShowApp(true)
    } finally {
      setInstalling(false)
    }
  }

  const handleSkip = () => {
    sessionStorage.setItem(SKIP_GATE_KEY, '1')
    setShowApp(true)
  }

  // Already installed or user chose to skip: show the app
  if (showApp || isPWA) {
    return <>{children}</>
  }

  // Desktop: tell them to use their phone
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface shadow-xl">
          <Leaf className="h-10 w-10 text-accent" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-100">Gryns</h1>
        <p className="mt-2 text-slate-400">Hydroponic Tower Tracker</p>
        <p className="mt-8 max-w-sm text-slate-500">
          Gryns is designed for your phone. Open this link on your mobile device and add it to your home screen for the best experience.
        </p>
        <p className="mt-4 text-sm text-slate-600">
          {typeof window !== 'undefined' && window.location.href}
        </p>
        <button
          type="button"
          onClick={handleSkip}
          className="mt-8 text-sm text-slate-500 underline hover:text-slate-400"
        >
          Continue in browser anyway
        </button>
      </div>
    )
  }

  // Mobile: prompt to add to home screen
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface shadow-xl">
        <Leaf className="h-10 w-10 text-accent" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-slate-100">Gryns</h1>
      <p className="mt-2 text-slate-400">Hydroponic Tower Tracker</p>
      <p className="mt-8 max-w-sm text-slate-500">
        Add Gryns to your home screen to track your towers and pods, scan NFC tags, and use the app offline.
      </p>
      {installPrompt ? (
        <Button
          className="mt-8 w-full max-w-xs"
          onClick={handleInstall}
          disabled={installing}
        >
          <Download className="mr-2 h-5 w-5" />
          {installing ? 'Adding…' : 'Add to Home Screen'}
        </Button>
      ) : (
        <div className="mt-8 rounded-xl border border-slate-600 bg-surface/50 px-4 py-3 text-sm text-slate-400">
          In Chrome on Android, choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.
        </div>
      )}
      <button
        type="button"
        onClick={handleSkip}
        className="mt-6 text-sm text-slate-500 underline hover:text-slate-400"
      >
        Continue in browser
      </button>
    </div>
  )
}
