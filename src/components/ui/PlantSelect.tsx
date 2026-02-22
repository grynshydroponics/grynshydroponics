import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Leaf } from 'lucide-react'
import { PLANT_LIBRARY, getPlantIconUrl, type PlantOption } from '@/data/plants'

const PLANT_ICON_SIZE = 'h-6 w-6'

interface PlantSelectProps {
  value: string
  onChange: (plantId: string) => void
  placeholder?: string
  className?: string
  /** When true, use compact height for inline edit rows */
  compact?: boolean
  ariaLabel?: string
}

export function PlantSelect({
  value,
  onChange,
  placeholder = 'Select plant',
  className = '',
  compact = false,
  ariaLabel = 'Plant',
}: PlantSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = PLANT_LIBRARY.find((p) => p.id === value)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true })
  }, [open])

  const handleSelect = (plant: PlantOption) => {
    onChange(plant.id)
    setOpen(false)
  }

  const heightClass = compact ? 'form-inline-control' : 'min-h-[2.5rem]'
  const triggerClass = `w-full flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 text-left text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${heightClass} ${className}`

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected ? (
          <>
            <PlantCircle plant={selected} sizeClass={PLANT_ICON_SIZE} />
            <span className="min-w-0 flex-1 truncate">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-slate-500">{placeholder}</span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          className="absolute top-full left-0 z-20 mt-1 max-h-64 w-full min-w-[12rem] overflow-auto rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-lg"
          role="listbox"
        >
          {PLANT_LIBRARY.map((plant) => (
            <li key={plant.id} role="option" aria-selected={plant.id === value}>
              <button
                type="button"
                onClick={() => handleSelect(plant)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-slate-100 hover:bg-slate-700 focus:bg-slate-700 focus:outline-none ${plant.id === value ? 'bg-slate-700/50' : ''}`}
              >
                <PlantCircle plant={plant} sizeClass={PLANT_ICON_SIZE} />
                <span className="min-w-0 flex-1 truncate">{plant.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PlantCircle({
  plant,
  sizeClass,
}: {
  plant: PlantOption
  sizeClass: string
}) {
  const iconUrl = getPlantIconUrl(plant)
  const [imgError, setImgError] = useState(false)
  const showImg = iconUrl && !imgError
  return (
    <span
      className={`shrink-0 overflow-hidden rounded-full border border-slate-600 bg-slate-700 ${sizeClass}`}
      aria-hidden
    >
      {showImg ? (
        <img
          src={iconUrl}
          alt=""
          className={`h-full w-full object-cover ${sizeClass}`}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`flex h-full w-full items-center justify-center ${sizeClass}`}>
          <Leaf className="h-1/2 w-1/2 text-slate-500" />
        </span>
      )}
    </span>
  )
}
