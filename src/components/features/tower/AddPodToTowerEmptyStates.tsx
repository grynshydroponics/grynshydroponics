import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function TowerNotFound() {
  return (
    <div className="px-4 py-6">
      <p className="text-slate-500">Tower not found.</p>
      <Link to="/dashboard" className="mt-2 inline-block text-accent">
        Back to dashboard
      </Link>
    </div>
  )
}

interface AddPodAllSlotsUsedProps {
  towerId: string
}

export function AddPodAllSlotsUsed({ towerId }: AddPodAllSlotsUsedProps) {
  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <Link to={`/tower/${towerId}`} className="p-1 text-slate-400 hover:text-slate-100">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-lg font-medium text-slate-100">Add pod</span>
      </header>
      <div className="px-4 py-6">
        <p className="text-slate-400">All slots in this tower are in use.</p>
        <Link to={`/tower/${towerId}`} className="mt-2 inline-block text-accent">
          Back to tower
        </Link>
      </div>
    </div>
  )
}

