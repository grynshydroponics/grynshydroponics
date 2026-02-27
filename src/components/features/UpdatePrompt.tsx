import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { getUpdateSW, PWA_NEED_REFRESH_EVENT } from '@/pwaRegistration'
import { fetchServerVersion, isVersionNewer } from '@/utils/version'

/**
 * Shows a prompt when a new app version is available (from version.json or from the service worker).
 * User can choose "Update now" or "Later". Does not clear app state; reloads to load new assets.
 */
export function UpdatePrompt() {
  const [show, setShow] = useState(false)
  const [hasWaitingWorker, setHasWaitingWorker] = useState(false)
  const updateRequestedRef = useRef(false)

  const applyUpdate = useCallback(() => {
    const updateSW = getUpdateSW()
    if (updateSW) {
      updateSW()
    }
  }, [])

  useEffect(() => {
    const onNeedRefresh = () => {
      setHasWaitingWorker(true)
      setShow(true)
      if (updateRequestedRef.current) {
        applyUpdate()
      }
    }
    window.addEventListener(PWA_NEED_REFRESH_EVENT, onNeedRefresh)
    return () => window.removeEventListener(PWA_NEED_REFRESH_EVENT, onNeedRefresh)
  }, [applyUpdate])

  useEffect(() => {
    if (typeof __APP_VERSION__ === 'undefined') return
    const base = import.meta.env.BASE_URL || './'
    fetchServerVersion(base).then((serverVersion) => {
      if (serverVersion && isVersionNewer(serverVersion, __APP_VERSION__)) {
        setShow(true)
      }
    })
  }, [])

  const handleUpdateNow = () => {
    updateRequestedRef.current = true
    if (hasWaitingWorker) {
      applyUpdate()
      return
    }
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.update()
    })
  }

  const handleLater = () => {
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        role="dialog"
        aria-labelledby="update-title"
        aria-modal="true"
      >
        <h2 id="update-title" className="text-lg font-semibold text-slate-100">
          Update available
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          A new version of Gryns is available. Update now to get the latest features and fixes. Your data will not be cleared.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={handleLater}>
            Later
          </Button>
          <Button className="flex-1" onClick={handleUpdateNow}>
            Update now
          </Button>
        </div>
      </div>
    </div>
  )
}
