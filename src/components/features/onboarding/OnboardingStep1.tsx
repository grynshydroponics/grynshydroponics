import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  value: number
  onChange: (n: number) => void
  onNext: () => void
}

export function OnboardingStep1({ value, onChange, onNext }: Props) {
  const [raw, setRaw] = useState(String(value || 1))

  const handleNext = () => {
    const n = Math.max(1, Math.min(99, parseInt(raw, 10) || 1))
    onChange(n)
    onNext() // just advance; towers are created in the next step
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">How many towers do you have?</h2>
        <p className="mt-2 text-slate-400">Enter the number of hydroponic towers you want to track.</p>
        <div className="mt-8">
          <Input
            type="number"
            min={1}
            max={99}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="1"
          />
        </div>
      </div>
      <Button className="w-full" onClick={handleNext}>
        Next
      </Button>
    </div>
  )
}
