import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  plantedAt: number
  onChange: (ts: number) => void
  onNext: () => void
}

export function OnboardingStep4({ plantedAt, onChange, onNext }: Props) {
  const dateStr = new Date(plantedAt).toISOString().slice(0, 10)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v) onChange(new Date(v).getTime())
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">When was it planted?</h2>
        <p className="mt-2 text-slate-400">Default is today. Adjust if you planted earlier.</p>
        <div className="mt-8">
          <Input type="date" value={dateStr} onChange={handleChange} />
        </div>
      </div>
      <Button className="w-full" onClick={onNext}>
        Next
      </Button>
    </div>
  )
}
