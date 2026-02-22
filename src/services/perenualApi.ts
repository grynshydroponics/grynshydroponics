/**
 * Perenual API v2 service.
 * @see https://perenual.com/docs/api
 */

import type {
  PerenualSpeciesListItem,
  PerenualSpeciesDetails,
  PerenualCareGuideItem,
  MappedPlant,
} from './perenualApi.types'

const BASE_URL = 'https://perenual.com/api/v2/'
const CARE_GUIDE_BASE = 'https://perenual.com/api/'

const API_KEY = import.meta.env.VITE_PERENUAL_API_KEY || ''

export interface SearchPlantsResponse {
  data: PerenualSpeciesListItem[]
  total?: number
  current_page?: number
  last_page?: number
}

export async function searchPlants(query: string): Promise<SearchPlantsResponse> {
  if (!API_KEY) {
    console.warn('VITE_PERENUAL_API_KEY is not set; Perenual search will fail.')
  }
  const params = new URLSearchParams({ key: API_KEY, q: query || '' })
  const url = `${BASE_URL}species-list?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Perenual search failed: ${res.status}`)
  return res.json()
}

export async function getPlantDetails(id: number): Promise<PerenualSpeciesDetails> {
  if (!API_KEY) {
    console.warn('VITE_PERENUAL_API_KEY is not set; Perenual details will fail.')
  }
  const params = new URLSearchParams({ key: API_KEY })
  const url = `${BASE_URL}species/details/${id}?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Perenual details failed: ${res.status}`)
  return res.json()
}

export interface GetGrowthStagesResponse {
  data: PerenualCareGuideItem[]
}

export async function getGrowthStages(speciesId: number): Promise<GetGrowthStagesResponse> {
  if (!API_KEY) {
    console.warn('VITE_PERENUAL_API_KEY is not set; Perenual care guide will fail.')
  }
  const params = new URLSearchParams({ key: API_KEY, species_id: String(speciesId) })
  const url = `${CARE_GUIDE_BASE}species-care-guide-list?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Perenual care guide failed: ${res.status}`)
  return res.json()
}

/** Map Perenual item to local schema: common_name -> name, default_image.original_url -> image */
export function mapPerenualToPlant(
  item: PerenualSpeciesListItem | PerenualSpeciesDetails
): MappedPlant {
  const id = String(item.id)
  const name = item.common_name || 'Unknown'
  const image = item.default_image?.original_url ?? item.default_image?.regular_url ?? null
  return { id, name, image, perenualId: item.id }
}

export type GrowthDurationSource = 'detail' | 'care_guide' | 'cycle_default'

export interface EstimatedGrowthDuration {
  estimatedDaysToHarvest: number | null
  cycle: string | null
  source: GrowthDurationSource
}

/**
 * Estimate growth duration from details + care guide.
 * If no explicit "days to harvest" in details, check care-guide for Maintenance/Pruning keywords,
 * or default by cycle (Annual/Perennial).
 */
export function estimateGrowthDuration(
  details: PerenualSpeciesDetails | null,
  careGuideList: PerenualCareGuideItem[] = []
): EstimatedGrowthDuration {
  const cycle = details?.cycle ?? null

  const maintenanceSection = careGuideList
    .flatMap((guide) => guide.section || [])
    .find(
      (s) =>
        s.type &&
        (s.type.toLowerCase().includes('maintenance') || s.type.toLowerCase().includes('pruning'))
    )

  if (maintenanceSection?.description) {
    const desc = maintenanceSection.description.toLowerCase()
    if (desc.includes('weekly') || desc.includes('every week'))
      return { estimatedDaysToHarvest: 60, cycle, source: 'care_guide' }
    if (desc.includes('monthly') || desc.includes('every month'))
      return { estimatedDaysToHarvest: 90, cycle, source: 'care_guide' }
    if (desc.includes('yearly') || desc.includes('once a year'))
      return { estimatedDaysToHarvest: 180, cycle, source: 'care_guide' }
  }

  if (cycle) {
    const lower = cycle.toLowerCase()
    if (lower === 'annual') return { estimatedDaysToHarvest: 90, cycle, source: 'cycle_default' }
    if (lower === 'perennial') return { estimatedDaysToHarvest: 180, cycle, source: 'cycle_default' }
    if (lower === 'biennial' || lower === 'biannual')
      return { estimatedDaysToHarvest: 365, cycle, source: 'cycle_default' }
  }

  return { estimatedDaysToHarvest: null, cycle, source: 'cycle_default' }
}
