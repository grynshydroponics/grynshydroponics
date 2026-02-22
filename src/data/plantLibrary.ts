/**
 * Plant list from plantLibraryMaster.json (in project root).
 * Add entries to the master file and rebuild; the app list will grow.
 */

import masterData from '../../plantLibraryMaster.json'
import { capitalizeWords } from '@/utils/capitalize'
import { sortAlphabetically } from '@/utils/sortAlphabetically'

export interface GrowthStageEntry {
  stage: string
  duration?: { min?: number; max?: number; unit?: string }
  description?: string
  rate?: number
}

export interface MasterPlantEntry {
  name: string
  species: string | null
  description: string | null
  img: string | null
  icon_img: string | null
  harvest: { duration?: { max?: number; min?: number; unit?: string } } | null
  yield: { unit?: string; value?: number; label?: string } | null
  /** Deprecated: use growth_stages. Kept for backward compat; derived from growth_stages if missing. */
  germination?: { duration?: { max?: number; min?: number; unit?: string }; rate?: number } | null
  growth_stages?: (GrowthStageEntry | null)[]
  hardinessZone: { max?: number; min?: number } | null
}

export interface PlantOption {
  id: string
  name: string
  species: string
  description: string | null
  img: string | null
  icon_img: string | null
  harvest: MasterPlantEntry['harvest']
  yield: MasterPlantEntry['yield']
  germination: { duration?: { min?: number; max?: number; unit?: string }; rate?: number } | null
  growth_stages: (GrowthStageEntry | null)[]
  hardinessZone: MasterPlantEntry['hardinessZone']
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'plant'
}

const raw = (masterData as { _schema?: string[]; plants: MasterPlantEntry[] }).plants || []

function getGerminationFromEntry(entry: GrowthStageEntry | null | undefined): PlantOption['germination'] {
  if (!entry?.duration) return null
  return { duration: entry.duration, rate: entry.rate }
}

export const PLANT_LIBRARY: PlantOption[] = sortAlphabetically(
  raw.map((p) => {
    const growthStages = p.growth_stages ?? []
    const germinationEntry = growthStages.find((s): s is GrowthStageEntry => s?.stage === 'germination')
    const germination = getGerminationFromEntry(germinationEntry) ?? p.germination ?? null
    return {
      id: slug(p.name),
      name: capitalizeWords(p.name),
      species: p.species ?? '',
      description: p.description ?? null,
      img: p.img ?? null,
      icon_img: p.icon_img ?? null,
      harvest: p.harvest ?? null,
      yield: p.yield ?? null,
      germination,
      growth_stages: p.growth_stages ?? [],
      hardinessZone: p.hardinessZone ?? null,
    }
  }),
  (p) => p.name
)

/** Resolved plant image URL: uses img if set, otherwise /plants/{id}.webp (files in public/plants/). */
export function getPlantImageUrl(plant: { id: string; img: string | null }): string {
  return plant.img ?? `/plants/${plant.id}.webp`
}

/** URL for list/dropdown icon: uses icon_img filename in public/plants/, e.g. /plants/bellpepper.webp */
export function getPlantIconUrl(plant: { icon_img: string | null }): string | null {
  return plant.icon_img ? `/plants/${plant.icon_img}` : null
}
