import { Button } from '@/components/ui/Button'
import { PlantSelect } from '@/components/ui/PlantSelect'
import { PLANT_LIBRARY } from '@/data/plants'

interface Props {
  plantId: string
  plantName: string
  onChange: (id: string, name: string) => void
  onNext: () => void
}

export function OnboardingStep2({ plantId, onChange, onNext }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    const plant = PLANT_LIBRARY.find((p) => p.id === id)
    onChange(id, plant?.name ?? id)
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Add your first plant</h2>
        <p className="mt-2 text-slate-400">Choose from the library or select Other.</p>
        <div className="mt-8">
          <PlantSelect
            value={plantId}
            onChange={(id) => {
              const plant = PLANT_LIBRARY.find((p) => p.id === id)
              onChange(id, plant?.name ?? id)
            }}
            placeholder="Select a plant"
            ariaLabel="Plant"
          />
        </div>
      </div>
      <Button className="w-full" onClick={onNext} disabled={!plantId}>
        Next
      </Button>
    </div>
  )
}
