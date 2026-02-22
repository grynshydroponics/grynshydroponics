import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  photoDataUrl: string | null
  onChange: (dataUrl: string | null) => void
  onNext: () => void
}

export function OnboardingStep5({ photoDataUrl, onChange, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const openCamera = () => {
    setError(null)
    inputRef.current?.click()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      onChange(dataUrl)
    }
    reader.onerror = () => setError('Failed to read image')
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-between px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Photo (Optional)</h2>
        <p className="mt-2 text-slate-400">Snap a photo of your pod for the dashboard.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <div className="mt-8 flex flex-col items-center gap-4">
          {photoDataUrl ? (
            <div className="relative">
              <img
                src={photoDataUrl}
                alt="Pod"
                className="h-48 w-48 rounded-xl object-cover border border-slate-600"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => onChange(null)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCamera}
              className="flex h-48 w-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-surface-muted text-slate-400 transition-colors hover:border-accent hover:text-accent"
            >
              <Camera className="h-12 w-12" />
              <span className="mt-2 text-sm">Tap to take photo</span>
            </button>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
      <Button className="w-full" onClick={onNext}>
        Next
      </Button>
    </div>
  )
}
