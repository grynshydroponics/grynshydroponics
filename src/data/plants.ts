/**
 * Re-exports plant library from master map so the app uses one source of truth.
 * Edit plantLibraryMaster.json (project root) and rebuild to grow the list.
 */

export {
  PLANT_LIBRARY,
  getPlantImageUrl,
  getPlantIconUrl,
  type PlantOption,
  type GrowthStageEntry,
} from './plantLibrary'
