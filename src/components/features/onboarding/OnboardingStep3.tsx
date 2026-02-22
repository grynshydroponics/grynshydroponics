import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { TowerRecord } from '@/db'

interface Props {
  towers: TowerRecord[]
  towerId: string
  slotNumber: number
  onTowerChange: (id: string) => void
  onSlotChange: (n: number) => void
  onNext: () => void
}

export function OnboardingStep3({
  towers,
  towerId,
  slotNumber,
  onTowerChange,
  onSlotChange,
  onNext,
}: Props) {
  const tower = towers.find((t) => t.id === towerId)
  const slots = tower ? Array.from({ length: tower.slotCount }, (_, i) => i + 1) : []

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Which slot?</h2>
        <p className="mt-2 text-slate-400">Select the tower and slot for this plant.</p>
        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Tower</label>
            <Select value={towerId} onChange={(e) => onTowerChange(e.target.value)}>
              <option value="">Select tower</option>
              {towers.map((t) => (
                <option key={t.id} value={t.id}>
                  Tower {t.index + 1}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Slot</label>
            <Select
              value={slotNumber}
              onChange={(e) => onSlotChange(parseInt(e.target.value, 10))}
              disabled={!towerId}
            >
              <option value="">Select slot</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  Slot {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <Button className="w-full" onClick={onNext} disabled={!towerId || !slotNumber}>
        Next
      </Button>
    </div>
  )
}
