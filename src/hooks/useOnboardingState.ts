import { useState, useCallback } from 'react'
import type { TowerRecord } from '@/db'

export interface OnboardingFormData {
  towerCount: number
  podsPerTower: number
  createdTowers: TowerRecord[]
  plantId: string
  plantName: string
  towerId: string
  slotNumber: number
  plantedAt: number
  photoDataUrl: string | null
  perenualId: number | null
  plantImageUrl: string | null
}

const defaultData: OnboardingFormData = {
  towerCount: 1,
  podsPerTower: 12,
  createdTowers: [],
  plantId: '',
  plantName: '',
  towerId: '',
  slotNumber: 1,
  plantedAt: Date.now(),
  photoDataUrl: null,
  perenualId: null,
  plantImageUrl: null,
}

const TOTAL_STEPS = 7

export function useOnboardingState() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingFormData>(defaultData)

  const setField = useCallback(<K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), [])
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])

  return { step, data, setField, next, back, totalSteps: TOTAL_STEPS }
}
