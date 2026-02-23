import { useState, useEffect } from 'react'
import { Leaf, Download, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { isRunningAsPWA, isMobileLike } from '@/utils/pwa'

const SKIP_GATE_KEY = 'gryns_skip_install_gate'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Try to close the browser tab (works only for script-opened windows; often no-op in normal tabs). */
function tryCloseWindow() {
  window.close()
}

/** Minimum ms to wait after appinstalled before showing success/close (re-install can fire appinstalled before OS finishes). */
const POST_INSTALL_DELAY_MS = 5000

export function InstallGate({ children }: { children: React.ReactNode }) {
  const isPWA = isRunningAsPWA()
  const skipped = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SKIP_GATE_KEY) === '1'
  const [showApp, setShowApp] = useState(() => isPWA || skipped)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  /** True after user accepted install; we wait for appinstalled before showing success or closing. */
  const [installAccepted, setInstallAccepted] = useState(false)
  const [installJustFinished, setInstallJustFinished] = useState(false)

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

  useEffect(() => {
    const delayRef = { current: 0 }
    const handler = () => {
      delayRef.current = window.setTimeout(() => {
        setInstallAccepted(false)
        setInstallJustFinished(true)
        tryCloseWindow()
      }, POST_INSTALL_DELAY_MS)
    }
    window.addEventListener('appinstalled', handler)
    return () => {
      window.removeEventListener('appinstalled', handler)
      if (delayRef.current) window.clearTimeout(delayRef.current)
    }
  }, [])

  // If appinstalled never fires (e.g. older browser), show success after 15s
  useEffect(() => {
    if (!installAccepted) return
    const t = window.setTimeout(() => {
      setInstallAccepted(false)
      setInstallJustFinished(true)
      tryCloseWindow()
    }, 15000)
    return () => window.clearTimeout(t)
  }, [installAccepted])

  const handleInstall = async () => {
    if (!installPrompt) return
    setInstalling(true)
    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallAccepted(true)
      }
    } finally {
      setInstalling(false)
    }
  }

  const handleSkip = () => {
    sessionStorage.setItem(SKIP_GATE_KEY, '1')
    setShowApp(true)
  }

  const handlePostInstallDone = () => {
    tryCloseWindow()
    setShowApp(true)
  }

  // User accepted install; waiting for appinstalled (don't close or show success until then)
  if (installAccepted && !installJustFinished && !isPWA) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface shadow-xl">
          <Leaf className="h-10 w-10 text-accent animate-pulse" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-100">Adding to home screen</h1>
        <p className="mt-2 max-w-sm text-slate-400">
          Wait for the app to be added, then you can open Gryns from your home screen.
        </p>
      </div>
    )
  }

  // Just finished installing: ask user to close tab and open PWA from home screen
  if (installJustFinished && !isPWA) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface shadow-xl">
          <CheckCircle className="h-12 w-12 text-green-500" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-100">Gryns is installed</h1>
        <p className="mt-2 max-w-sm text-slate-400">
          Close this tab, then open <strong>Gryns</strong> from your home screen to use the app.
        </p>
        <Button className="mt-8 w-full max-w-xs" onClick={handlePostInstallDone}>
          Done
        </Button>
        <p className="mt-3 text-xs text-slate-500">
          If this tab didn’t close, tap Done and open Gryns from your home screen.
        </p>
      </div>
    )
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
