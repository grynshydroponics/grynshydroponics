import Dexie, { type Table } from 'dexie'

export interface TowerRecord {
  id: string
  index: number
  slotCount: number
  createdAt: number
}

export interface PodRecord {
  id: string
  towerId: string
  plantId: string
  plantName: string
  slotNumber: number
  plantedAt: number
  photoDataUrl: string | null
  growthStage: GrowthStage
  updatedAt: number
  /** Perenual species ID when plant was chosen from online search */
  perenualId: number | null
  /** Plant image URL from Perenual (or local) for display */
  plantImageUrl: string | null
}

export type GrowthStage = 'germination' | 'sprouted' | 'growing' | 'harvest_ready' | 'harvested'

export class GrynsDB extends Dexie {
  towers!: Table<TowerRecord, string>
  pods!: Table<PodRecord, string>

  constructor() {
    super('GrynsDB')
    this.version(1).stores({
      towers: 'id, index',
      pods: 'id, towerId, slotNumber',
    })
    this.version(2).upgrade((tx) =>
      tx.table('pods').toCollection().modify((pod: Record<string, unknown>) => {
        if (pod.perenualId === undefined) pod.perenualId = null
        if (pod.plantImageUrl === undefined) pod.plantImageUrl = null
      })
    )
    this.version(3).upgrade((tx) =>
      tx.table('pods').toCollection().modify((pod: Record<string, unknown>) => {
        if (pod.growthStage === 'planted') pod.growthStage = 'germination'
      })
    )
  }
}

export const db = new GrynsDB()
