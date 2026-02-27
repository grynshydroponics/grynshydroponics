import { Leaf } from 'lucide-react'

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-surface shadow-xl">
        <Leaf className="h-12 w-12 text-accent" aria-hidden />
      </div>
      <p className="mt-6 text-xl font-medium text-slate-300">Gryns</p>
      <p className="mt-1 text-sm text-slate-500">Hydroponic Tower Tracker</p>
      <p className="mt-1 text-xs text-slate-600">Version {__APP_VERSION__}</p>
    </div>
  )
}
