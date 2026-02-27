import { Button } from '@/components/ui/Button'

const DEFAULT_SLOT_COUNT = 7
const MIN_SLOTS = 1
const MAX_SLOTS = 99

interface AddTowerModalProps {
  open: boolean
  slotCount: number
  onSlotCountChange: (n: number) => void
  onClose: () => void
  onConfirm: () => void
}

export function AddTowerModal({
  open,
  slotCount,
  onSlotCountChange,
  onClose,
  onConfirm,
}: AddTowerModalProps) {
  if (!open) return null

  const value = Math.max(MIN_SLOTS, Math.min(MAX_SLOTS, slotCount))

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-100">Add tower</h2>
        <p className="mt-1 text-sm text-slate-400">How many pods does this tower have?</p>
        <input
          type="number"
          min={MIN_SLOTS}
          max={MAX_SLOTS}
          value={value}
          onChange={(e) => onSlotCountChange(parseInt(e.target.value, 10) || DEFAULT_SLOT_COUNT)}
          className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Add tower
          </Button>
        </div>
      </div>
    </div>
  )
}

export { DEFAULT_SLOT_COUNT }
