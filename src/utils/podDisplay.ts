import type { PodRecord } from '@/db'
import { PLANT_LIBRARY, getPlantIconUrl, type PlantOption } from '@/data/plants'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
import { stageLabelFromPlant, stageDurationLabel } from '@/utils/plantStage'

export interface PodDisplayInfo {
  pod: PodRecord
  plant: PlantOption | undefined
  displayUrl: string | null
  isHarvested: boolean
  stageName: string
  durationStr: string
}

/**
 * Compute display info for a pod (for use in tower slot list, etc.).
 */
export function getPodDisplayInfo(pod: PodRecord): PodDisplayInfo {
  const plant = PLANT_LIBRARY.find((p) => p.id === pod.plantId)
  const iconUrl = plant ? resolvePlantAssetUrl(getPlantIconUrl(plant)) : null
  const displayUrl = pod.photoDataUrl ?? iconUrl
  const isHarvested = pod.growthStage === 'harvested'
  const stageName = isHarvested ? 'Harvested' : stageLabelFromPlant(pod.growthStage)
  const durationStr = isHarvested ? '' : stageDurationLabel(pod.growthStage, plant)
  return { pod, plant, displayUrl, isHarvested, stageName, durationStr }
}
