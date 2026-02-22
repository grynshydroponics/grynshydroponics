import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  value: number
  onChange: (n: number) => void
  onNext: (podsPerTower: number) => void
}

export function OnboardingStepPodsPerTower({ value, onChange, onNext }: Props) {
  const [raw, setRaw] = useState(String(value || 12))

  const handleNext = () => {
    const n = Math.max(1, Math.min(99, parseInt(raw, 10) || 12))
    onChange(n)
    onNext(n)
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">How many pods per tower?</h2>
        <p className="mt-2 text-slate-400">Each tower has this many slots for plants.</p>
        <div className="mt-8">
          <Input
            type="number"
            min={1}
            max={99}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="12"
          />
        </div>
      </div>
      <Button className="w-full" onClick={handleNext}>
        Next
      </Button>
    </div>
  )
}
