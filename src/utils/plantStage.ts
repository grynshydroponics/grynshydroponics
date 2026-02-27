import type { GrowthStage } from '@/db'
import type { PlantOption } from '@/data/plants'
import { formatDuration } from './formatDuration'

/** Map pod growth stage to plant library growth_stages key (matches JSON). */
export const POD_STAGE_TO_PLANT_STAGE: Record<GrowthStage, string | null> = {
  germination: 'germination',
  sprouted: 'seedling',
  growing: 'vegetative',
  harvest_ready: 'flowering',
  fruiting: 'fruiting',
  harvested: 'fruiting',
}

/**
 * Format a stage key for display (e.g. "vegetative" → "Vegetative", "growth_stage" → "Growth Stage").
 */
export function formatStageKey(stage: string): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Display label from plant library stage key (e.g. germination → Germination, vegetative → Vegetative).
 */
export function stageLabelFromPlant(podStage: GrowthStage): string {
  const stageKey = POD_STAGE_TO_PLANT_STAGE[podStage]
  if (!stageKey) return '—'
  return stageKey.charAt(0).toUpperCase() + stageKey.slice(1).replace(/_/g, ' ')
}

/**
 * Duration string for a pod's current growth stage (for list/detail display).
 * Returns '' for harvested.
 */
export function stageDurationLabel(
  growthStage: GrowthStage,
  plant: PlantOption | undefined
): string {
  if (!plant) return '—'
  const stageKey = POD_STAGE_TO_PLANT_STAGE[growthStage]
  if (!stageKey) return ''
  if (growthStage === 'germination' && plant.germination?.duration) {
    return formatDuration(plant.germination.duration)
  }
  const entry = plant.growth_stages?.find((s) => s?.stage === stageKey)
  if (entry?.duration) return formatDuration(entry.duration)
  if (growthStage === 'harvest_ready') {
    const fruiting = plant.growth_stages?.find((s) => s?.stage === 'fruiting')
    if (fruiting?.duration) return formatDuration(fruiting.duration)
  }
  return '—'
}
