import { Link } from 'react-router-dom'
import { CheckCircle, Leaf, Plus } from 'lucide-react'
import type { PodRecord, TowerRecord } from '@/db'
import type { GrowthStage } from '@/db'
import { PLANT_LIBRARY, getPlantIconUrl, type PlantOption } from '@/data/plants'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
import { capitalizeWords } from '@/utils/capitalize'

/** Map pod growth stage to plant library growth_stages key (matches JSON) */
const POD_STAGE_TO_PLANT_STAGE: Record<GrowthStage, string | null> = {
  germination: 'germination',
  sprouted: 'seedling',
  growing: 'vegetative',
  harvest_ready: 'flowering',
  fruiting: 'fruiting',
  harvested: 'fruiting',
}

interface TowerViewProps {
  tower: TowerRecord
  pods: PodRecord[]
}

export function TowerView({ tower, pods }: TowerViewProps) {
  const podsBySlot = pods
    .filter((p) => p.towerId === tower.id)
    .sort((a, b) => a.slotNumber - b.slotNumber)

  return (
    <div className="space-y-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Tower {tower.index + 1}</h1>
        <Link
          to={`/tower/${tower.id}/add-pod`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-muted"
          aria-label="Add pod"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>
      <p className="text-slate-400">
        {podsBySlot.length} of {tower.slotCount} slots in use
      </p>
      <ul className="space-y-2">
        {podsBySlot.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-600 bg-surface/50 py-8 text-center text-slate-500">
            No pods in this tower yet.
          </li>
        ) : (
          podsBySlot.map((pod) => {
            const plant = PLANT_LIBRARY.find((p) => p.id === pod.plantId)
            const iconUrl = plant ? resolvePlantAssetUrl(getPlantIconUrl(plant)) : null
            const displayUrl = pod.photoDataUrl ?? iconUrl
            const isHarvested = pod.growthStage === 'harvested'
            const stageName = isHarvested ? 'Harvested' : stageLabelFromPlant(pod.growthStage)
            const durationStr = isHarvested ? '' : stageDurationLabel(pod.growthStage, plant)
            return (
            <li key={pod.id}>
              <Link
                to={`/pod/${pod.id}`}
                className="relative flex items-center gap-4 rounded-xl border border-slate-700 bg-surface px-4 py-2.5 transition-colors hover:border-accent/50"
              >
                <span className="absolute top-2 right-3 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                  Slot {pod.slotNumber}
                </span>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {displayUrl ? (
                    <>
                      <img
                        src={displayUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const n = e.currentTarget.nextElementSibling
                          if (n instanceof HTMLElement) n.classList.remove('hidden')
                        }}
                      />
                      <span className="hidden h-full w-full items-center justify-center bg-surface-muted [&.flex]:flex" aria-hidden>
                        <Leaf className="h-8 w-8 text-slate-500" />
                      </span>
                    </>
                  ) : (
                    <Leaf className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pr-16">
                  <p className="font-medium text-slate-100">{capitalizeWords(pod.plantName)}</p>
                  {plant?.species && (
                    <p className="text-sm text-slate-500 italic">{plant.species}</p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                    {isHarvested && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
                    )}
                    {stageName}
                    {durationStr ? <span className="ml-1">{durationStr}</span> : null}
                  </p>
                </div>
              </Link>
            </li>
          )
          })
        )}
      </ul>
    </div>
  )
}

/** Display label from plant library stage key (matches JSON: germination, seedling, vegetative, flowering, fruiting) */
function stageLabelFromPlant(podStage: PodRecord['growthStage']): string {
  const stageKey = POD_STAGE_TO_PLANT_STAGE[podStage]
  if (!stageKey) return '—'
  return stageKey.charAt(0).toUpperCase() + stageKey.slice(1).replace(/_/g, ' ')
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

function stageDurationLabel(growthStage: PodRecord['growthStage'], plant: PlantOption | undefined): string {
  if (!plant) return '—'
  const stageKey = POD_STAGE_TO_PLANT_STAGE[growthStage]
  if (!stageKey) return '' // harvested: no duration
  if (growthStage === 'germination' && plant.germination?.duration)
    return formatDuration(plant.germination.duration)
  const entry = plant.growth_stages?.find((s) => s?.stage === stageKey)
  if (entry?.duration) return formatDuration(entry.duration)
  if (growthStage === 'harvest_ready') {
    const fruiting = plant.growth_stages?.find((s) => s?.stage === 'fruiting')
    if (fruiting?.duration) return formatDuration(fruiting.duration)
  }
  return '—'
}
