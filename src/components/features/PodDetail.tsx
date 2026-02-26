import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Leaf, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PhotoPickerModal } from '@/components/ui/PhotoPickerModal'
import { PLANT_LIBRARY, getPlantIconUrl, type PlantOption } from '@/data/plants'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
import { useTowerContext } from '@/context/TowerContext'
import type { PodRecord, GrowthStage } from '@/db'
import { capitalizeWords } from '@/utils/capitalize'

const STAGE_ORDER: GrowthStage[] = ['germination', 'sprouted', 'growing', 'harvest_ready', 'fruiting', 'harvested']

function isLastPlantStage(stageKey: string | null, plant: PlantOption | undefined): boolean {
  if (!stageKey || !plant?.growth_stages) return false
  const stages = plant.growth_stages.filter((s): s is NonNullable<typeof s> => s != null)
  const last = stages[stages.length - 1]
  return last?.stage === stageKey
}

/**
 * Button label by plant stage. Sequence e.g. for bell pepper:
 * It sprouted! → It has green leaves! → It's flowering! → Fruit set! → Time to Harvest → (greyed) Harvested
 */
function getAdvanceLabelForPlantStage(
  currentPlantStage: string | null,
  plant: PlantOption | undefined,
  nextPodStage: GrowthStage | null
): string | null {
  if (!nextPodStage || !currentPlantStage) return null
  const hasStage = (key: string) => plant?.growth_stages?.some((s) => s?.stage === key) ?? false
  if (nextPodStage === 'harvested' && isLastPlantStage(currentPlantStage, plant)) return 'Time to Harvest'
  switch (currentPlantStage) {
    case 'germination':
      return "It sprouted!"
    case 'seedling':
      return "It has green leaves!"
    case 'vegetative':
      return hasStage('flowering') ? "It's flowering!" : 'Time to Harvest'
    case 'flowering':
      return hasStage('fruiting') ? "Fruit set!" : 'Time to Harvest'
    case 'fruiting':
      return 'Time to Harvest'
    default:
      return null
  }
}

/** Next pod stage. Skips harvest_ready/fruiting when plant has no flowering/fruiting (e.g. basil: vegetative → harvested). */
function nextStage(current: GrowthStage, plant: PlantOption | undefined): GrowthStage | null {
  const i = STAGE_ORDER.indexOf(current)
  if (i >= STAGE_ORDER.length - 1) return null
  const hasStage = (key: string) => plant?.growth_stages?.some((s) => s?.stage === key) ?? false
  if (current === 'growing' && !hasStage('flowering')) return 'harvested'
  if (current === 'harvest_ready' && !hasStage('fruiting')) return 'harvested'
  return STAGE_ORDER[i + 1]
}

/** Map pod growth stage to plant library growth_stages key for duration lookup */
const POD_STAGE_TO_PLANT_STAGE: Record<GrowthStage, string | null> = {
  germination: 'germination',
  sprouted: 'seedling',
  growing: 'vegetative',
  harvest_ready: 'flowering',
  fruiting: 'fruiting',
  harvested: 'fruiting',
}

/** Which plant stage to highlight. When harvested, use the plant's last growth stage (e.g. vegetative for basil). */
function getHighlightedPlantStage(podStage: GrowthStage, plant: PlantOption | undefined): string | null {
  if (podStage === 'harvested' && plant?.growth_stages) {
    const stages = plant.growth_stages.filter((s): s is NonNullable<typeof s> => s != null)
    const last = stages[stages.length - 1]
    return last?.stage ?? null
  }
  const map: Record<GrowthStage, string | null> = {
    germination: 'germination',
    sprouted: 'seedling',
    growing: 'vegetative',
    harvest_ready: 'flowering',
    fruiting: 'fruiting',
    harvested: 'fruiting',
  }
  return map[podStage] ?? null
}

function formatDuration(duration?: { min?: number; max?: number; unit?: string }): string {
  if (duration?.min == null && duration?.max == null) return '—'
  const min = duration?.min ?? duration?.max
  const max = duration?.max ?? duration?.min
  const u = duration?.unit ?? ''
  const unit = u === 'week' ? 'weeks' : u === 'day' ? 'days' : u
  if (min == null && max == null) return '—'
  if (min === max) return `${min} ${unit}`
  return `${min}-${max} ${unit}`
}

function getDurationForPodStage(plant: PlantOption | undefined, podStage: GrowthStage): string {
  if (!plant) return '—'
  const stageKey = POD_STAGE_TO_PLANT_STAGE[podStage]
  if (!stageKey) return '' // harvested: no duration, no dash
  if (podStage === 'germination' && plant.germination?.duration)
    return formatDuration(plant.germination.duration)
  const entry = plant.growth_stages?.find((s) => s?.stage === stageKey)
  if (entry?.duration) return formatDuration(entry.duration)
  // harvest_ready: try fruiting if no flowering
  if (podStage === 'harvest_ready') {
    const fruiting = plant.growth_stages?.find((s) => s?.stage === 'fruiting')
    if (fruiting?.duration) return formatDuration(fruiting.duration)
  }
  return '—'
}

/** Get the growth_stages entry for the pod's current stage (for description, etc.) */
function getStageEntryForPod(plant: PlantOption | undefined, podStage: GrowthStage) {
  if (!plant) return null
  const stageKey = POD_STAGE_TO_PLANT_STAGE[podStage]
  if (!stageKey) return null
  if (podStage === 'germination') {
    const entry = plant.growth_stages?.find((s) => s?.stage === 'germination')
    return entry ?? null
  }
  const entry = plant.growth_stages?.find((s) => s?.stage === stageKey)
  if (entry) return entry
  if (podStage === 'harvest_ready') {
    return plant.growth_stages?.find((s) => s?.stage === 'fruiting') ?? null
  }
  return null
}

interface PodDetailProps {
  pod: PodRecord
}

export function PodDetail({ pod }: PodDetailProps) {
  const navigate = useNavigate()
  const { towers, updatePod, updatePodStage, deletePod } = useTowerContext()
  const tower = towers.find((t) => t.id === pod.towerId)
  const towerLabel = tower != null ? `Tower ${tower.index + 1}` : 'Pod'
  const [editing, setEditing] = useState<'slotNumber' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const editAreaRef = useRef<HTMLDivElement>(null)

  const plant = PLANT_LIBRARY.find((p) => p.id === pod.plantId)
  const plantIconUrl = plant ? resolvePlantAssetUrl(getPlantIconUrl(plant)) : null
  const displayImageUrl = pod.photoDataUrl ?? plantIconUrl

  // Lock body scroll so the pod screen doesn't drag up/down
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (editing == null) return
    const handlePointerDown = (e: PointerEvent) => {
      if (editAreaRef.current?.contains(e.target as Node)) return
      cancelEdit()
    }
    document.addEventListener('pointerdown', handlePointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true })
  }, [editing])

  const handleDelete = async () => {
    if (!window.confirm('Delete this pod? This cannot be undone.')) return
    await deletePod(pod.id)
    navigate(`/tower/${pod.towerId}`, { replace: true })
  }

  const next = nextStage(pod.growthStage, plant)
  const currentPlantStage = getHighlightedPlantStage(pod.growthStage, plant)
  const advanceLabel = getAdvanceLabelForPlantStage(currentPlantStage, plant, next)

  const startEdit = (current: string) => {
    setEditing('slotNumber')
    setEditValue(current)
  }

  const saveEdit = async () => {
    if (editing !== 'slotNumber') return
    setSaving(true)
    try {
      const n = parseInt(editValue, 10)
      if (!isNaN(n) && n >= 1) await updatePod(pod.id, { slotNumber: n })
    } finally {
      setSaving(false)
      setEditing(null)
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const navBottom = '3.5rem' // match AppLayout nav height; use env(safe-area-inset-bottom) if needed
  return (
    <div
      className="fixed inset-0 z-10 flex flex-col overflow-hidden bg-slate-900"
      style={{ paddingBottom: `max(${navBottom}, calc(${navBottom} + env(safe-area-inset-bottom, 0px)))` }}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link to={`/tower/${pod.towerId}`} className="shrink-0 p-1 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-lg font-medium text-slate-100">{towerLabel}</span>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 p-1 text-slate-400 hover:text-red-400"
          aria-label="Delete pod"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
        <div className="shrink-0">
        <div className="relative mb-2 flex justify-center">
          <div className="relative h-40 w-40 shrink-0">
            <div className="pod-detail-hero-image absolute inset-0 border border-slate-700 bg-surface-muted">
              {displayImageUrl ? (
                <img
                  src={displayImageUrl}
                  alt={capitalizeWords(pod.plantName)}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling
                    if (fallback instanceof HTMLElement) fallback.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center ${displayImageUrl ? 'hidden' : ''}`}
                aria-hidden
              >
                <Leaf className="h-16 w-16 text-slate-600" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="absolute bottom-0 right-0 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/95 text-slate-100 shadow-lg backdrop-blur hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Change pod photo"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-4">
            {editing === 'slotNumber' ? (
              <div ref={editAreaRef} className="flex items-center gap-1.5 rounded-l-lg border border-slate-600 border-r-0 bg-slate-700 py-1.5 pl-3 pr-4 shadow-lg">
                <input
                  type="number"
                  min={1}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="w-12 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                  aria-label="Slot"
                />
                <Button size="sm" className="text-xs" onClick={saveEdit} disabled={saving}>Save</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={cancelEdit}>Cancel</Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startEdit(String(pod.slotNumber))}
                className="rounded-l-lg bg-slate-700 py-1.5 pl-3 pr-4 text-sm font-medium text-slate-200 hover:bg-slate-600 hover:text-slate-100"
              >
                Slot {pod.slotNumber}
              </button>
            )}
          </div>
        </div>

        <PhotoPickerModal
          open={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          value={pod.photoDataUrl}
          onChange={(url) => updatePod(pod.id, { photoDataUrl: url })}
          title="Pod photo"
        />

        <div className="mb-2 text-center">
          <h1 className="text-xl font-semibold text-slate-100">
            {capitalizeWords(pod.plantName)}
          </h1>
          {plant?.species && (
            <p className="mt-1 text-sm italic text-slate-400">{plant.species}</p>
          )}
          {plant?.description && (
            <p className="mt-1.5 max-w-md mx-auto px-4 py-1 text-sm text-slate-300 leading-relaxed">
              {plant.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap justify-center gap-4 text-center">
            {plant?.harvest && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Harvest</p>
                <p className="mt-0.5 text-xs text-slate-300">
                  {formatDuration(plant.harvest.duration)}
                </p>
              </div>
            )}
            {plant?.yield && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Yield</p>
                <p className="mt-0.5 text-xs text-slate-300">
                  {plant.yield.label ?? (plant.yield.value != null && plant.yield.unit != null
                    ? `${plant.yield.value} ${plant.yield.unit}`
                    : plant.yield.unit ?? '—')}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Planted</p>
              <p className="mt-0.5 text-xs text-slate-300">
                {new Date(pod.plantedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        </div>

        <div className="mt-2 space-y-1">
          <p className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-500">Growth stages</p>
          {(plant?.growth_stages?.filter((s): s is NonNullable<typeof s> => s != null) ?? []).map((entry) => {
            const isCurrent = getHighlightedPlantStage(pod.growthStage, plant) === entry.stage
            const durationStr = entry.duration ? formatDuration(entry.duration) : null
            return (
              <div
                key={entry.stage}
                className={`rounded-lg border px-2 py-1 ${
                  isCurrent
                    ? 'border-accent bg-accent/10'
                    : 'border-slate-700 bg-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs capitalize ${isCurrent ? 'font-medium text-accent' : 'text-slate-100'}`}>
                    {entry.stage.replace(/_/g, ' ')}
                  </p>
                  {durationStr ? (
                    <p className={`text-[11px] shrink-0 ${isCurrent ? 'text-accent/90' : 'text-slate-400'}`}>
                      {durationStr}
                    </p>
                  ) : null}
                </div>
                {entry.description && (
                  <p className={`mt-0.5 text-[11px] leading-snug ${isCurrent ? 'text-slate-200' : 'text-slate-300'}`}>
                    {entry.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {pod.growthStage === 'harvested' ? (
        <div className="shrink-0 bg-slate-900/95 px-4 py-3 pb-6 backdrop-blur">
          <div className="flex w-full items-center justify-center rounded-lg border border-slate-600 bg-slate-800 py-3 text-sm font-medium text-slate-400">
            Harvested
          </div>
        </div>
      ) : advanceLabel && next ? (
        <div className="shrink-0 bg-slate-900/95 px-4 py-3 pb-6 backdrop-blur">
          <Button
            className="w-full"
            onClick={() => updatePodStage(pod.id, next)}
          >
            {advanceLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
