/** Perenual API response shapes (v2 species-list item) */
export interface PerenualSpeciesListItem {
  id: number
  common_name: string
  scientific_name?: string[] | null
  other_name?: string[] | null
  default_image?: {
    image_id?: number
    original_url?: string
    regular_url?: string
    medium_url?: string
    small_url?: string
    thumbnail?: string
  } | null
  [key: string]: unknown
}

/** Perenual API species details response */
export interface PerenualSpeciesDetails extends PerenualSpeciesListItem {
  cycle?: string
  watering?: string
  sunlight?: string[]
  pruning_month?: string[]
  maintenance?: string
  growth_rate?: string
  description?: string
  [key: string]: unknown
}

/** Perenual care guide list item (species-care-guide-list) */
export interface PerenualCareGuideSection {
  id?: number
  type?: string
  description?: string
}

export interface PerenualCareGuideItem {
  id?: number
  species_id?: number
  common_name?: string
  section?: PerenualCareGuideSection[]
  [key: string]: unknown
}

/** Local plant shape after mapping (for UI and pod record) */
export interface MappedPlant {
  id: string
  name: string
  image: string | null
  perenualId: number
}
