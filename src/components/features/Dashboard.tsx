import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TowerControl, Leaf, Plus, Trash2 } from 'lucide-react'
import { useTowerContext } from '@/context/TowerContext'
import { AddTowerModal, DEFAULT_SLOT_COUNT } from '@/components/features/AddTowerModal'
import type { TowerRecord } from '@/db'

const DELETE_TOWER_MESSAGE =
  'Delete this tower? All pods in it will be removed. This cannot be undone.'

interface DashboardProps {
  towers: TowerRecord[]
  podCountByTower: Record<string, number>
}

export function Dashboard({ towers, podCountByTower }: DashboardProps) {
  const { addTower, deleteTower } = useTowerContext()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [slotCount, setSlotCount] = useState(DEFAULT_SLOT_COUNT)

  const handleAddTower = async () => {
    const count = Math.max(1, Math.min(99, slotCount))
    await addTower(count)
    setAddModalOpen(false)
    setSlotCount(DEFAULT_SLOT_COUNT)
  }

  const handleDeleteTower = (e: React.MouseEvent, tower: TowerRecord) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(DELETE_TOWER_MESSAGE)) {
      deleteTower(tower.id)
    }
  }

  const handleCloseAddModal = () => {
    setAddModalOpen(false)
    setSlotCount(DEFAULT_SLOT_COUNT)
  }

  if (towers.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <Leaf className="h-16 w-16 text-slate-600" />
        <p className="mt-4 text-slate-400">No towers yet. Complete onboarding to add your first tower.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-slate-100">Towers</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {towers.map((tower) => (
          <div
            key={tower.id}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-surface p-4 shadow transition-colors hover:border-accent/50 hover:bg-surface-muted"
          >
            <Link
              to={`/tower/${tower.id}`}
              className="flex min-w-0 flex-1 items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                <TowerControl className="h-7 w-7 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-100">Tower {tower.index + 1}</p>
                <p className="text-sm text-slate-500">
                  {podCountByTower[tower.id] ?? 0} / {tower.slotCount} pods
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={(e) => handleDeleteTower(e, tower)}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-700/50 hover:text-red-400"
              aria-label="Delete tower"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-600 bg-surface/50 p-6 text-slate-400 transition-colors hover:border-accent/50 hover:bg-surface-muted hover:text-slate-300"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Add tower</span>
        </button>
      </div>

      <AddTowerModal
        open={addModalOpen}
        slotCount={slotCount}
        onSlotCountChange={setSlotCount}
        onClose={handleCloseAddModal}
        onConfirm={handleAddTower}
      />
    </div>
  )
}
