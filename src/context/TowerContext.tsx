import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { db, type PodRecord, type TowerRecord, type GrowthStage } from '@/db'

interface TowerContextValue {
  towers: TowerRecord[]
  pods: PodRecord[]
  isInitialized: boolean
  setTowers: React.Dispatch<React.SetStateAction<TowerRecord[]>>
  setPods: React.Dispatch<React.SetStateAction<PodRecord[]>>
  addTower: (slotCount: number) => Promise<TowerRecord>
  deleteTower: (towerId: string) => Promise<void>
  addPod: (pod: Omit<PodRecord, 'id' | 'updatedAt'> & { id?: string }) => Promise<PodRecord>
  updatePod: (id: string, updates: Partial<PodRecord>) => Promise<void>
  updatePodStage: (id: string, stage: GrowthStage) => Promise<void>
  deletePod: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const TowerContext = createContext<TowerContextValue | null>(null)

export function TowerProvider({ children }: { children: React.ReactNode }) {
  const [towers, setTowers] = useState<TowerRecord[]>([])
  const [pods, setPods] = useState<PodRecord[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const refresh = useCallback(async () => {
    const [t, p] = await Promise.all([db.towers.toArray(), db.pods.toArray()])
    setTowers(t.sort((a, b) => a.index - b.index))
    setPods(p)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      await refresh()
      if (!cancelled) setIsInitialized(true)
    }
    init()
    return () => { cancelled = true }
  }, [refresh])

  const addTower = useCallback(async (slotCount: number) => {
    const id = crypto.randomUUID()
    const index = (await db.towers.count())
    const record: TowerRecord = { id, index, slotCount, createdAt: Date.now() }
    await db.towers.add(record)
    await refresh()
    return record
  }, [refresh])

  const deleteTower = useCallback(async (towerId: string) => {
    await db.pods.where('towerId').equals(towerId).delete()
    await db.towers.delete(towerId)
    await refresh()
  }, [refresh])

  const addPod = useCallback(async (pod: Omit<PodRecord, 'id' | 'updatedAt'> & { id?: string }) => {
    const id = pod.id ?? crypto.randomUUID()
    const now = Date.now()
    const record: PodRecord = { ...pod, id, updatedAt: now }
    await db.pods.add(record)
    await refresh()
    return record
  }, [refresh])

  const updatePod = useCallback(async (id: string, updates: Partial<PodRecord>) => {
    await db.pods.update(id, { ...updates, updatedAt: Date.now() })
    await refresh()
  }, [refresh])

  const updatePodStage = useCallback(async (id: string, stage: GrowthStage) => {
    await db.pods.update(id, { growthStage: stage, updatedAt: Date.now() })
    await refresh()
  }, [refresh])

  const deletePod = useCallback(async (id: string) => {
    await db.pods.delete(id)
    await refresh()
  }, [refresh])

  const value: TowerContextValue = {
    towers,
    pods,
    isInitialized,
    setTowers,
    setPods,
    addTower,
    deleteTower,
    addPod,
    updatePod,
    updatePodStage,
    deletePod,
    refresh,
  }

  return <TowerContext.Provider value={value}>{children}</TowerContext.Provider>
}

export function useTowerContext() {
  const ctx = useContext(TowerContext)
  if (!ctx) throw new Error('useTowerContext must be used within TowerProvider')
  return ctx
}
