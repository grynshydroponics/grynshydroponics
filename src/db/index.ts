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
  /** QR code value linked to this pod (scan to open from nav); set when linking at add or on pod detail */
  linkedQrCode: string | null
}

export type GrowthStage = 'germination' | 'sprouted' | 'growing' | 'harvest_ready' | 'fruiting' | 'harvested'

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
    this.version(4).upgrade((tx) =>
      tx.table('pods').toCollection().modify((pod: Record<string, unknown>) => {
        if (pod.linkedQrCode === undefined) pod.linkedQrCode = null
      })
    )
  }
}

export const db = new GrynsDB()
