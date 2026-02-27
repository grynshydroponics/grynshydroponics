import { Link, useLocation } from 'react-router-dom'
import { Home, QrCode, BookOpen } from 'lucide-react'

/** Height of the bottom nav (for padding content above it). */
export const BOTTOM_NAV_HEIGHT = '3.5rem'

interface BottomNavProps {
  onScanClick: () => void
}

export function BottomNav({ onScanClick }: BottomNavProps) {
  const location = useLocation()
  const isHome = location.pathname === '/dashboard'
  const isLibrary = location.pathname === '/plants' || location.pathname.startsWith('/plant/')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-700 bg-slate-900/95 pb-safe backdrop-blur">
      <div className="flex justify-between px-8 py-2">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isHome ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <button
          type="button"
          onClick={onScanClick}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-500 hover:text-slate-300"
        >
          <QrCode className="h-5 w-5" />
          <span className="text-[10px]">Scan</span>
        </button>
        <Link
          to="/plants"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isLibrary ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-[10px]">Library</span>
        </Link>
      </div>
    </nav>
  )
}
