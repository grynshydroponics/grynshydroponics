import { useNavigate } from 'react-router-dom'
import { useTowerContext } from '@/context/TowerContext'
import { useOnboardingState } from '@/hooks/useOnboardingState'
import { Button } from '@/components/ui/Button'
import { OnboardingStep1 } from './OnboardingStep1'
import { OnboardingStepPodsPerTower } from './OnboardingStepPodsPerTower'
import { OnboardingStep2 } from './OnboardingStep2'
import { OnboardingStep3 } from './OnboardingStep3'
import { OnboardingStep4 } from './OnboardingStep4'
import { OnboardingStep5 } from './OnboardingStep5'
import { OnboardingStep6 } from './OnboardingStep6'
import { ChevronLeft } from 'lucide-react'

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { step, data, setField, next, back, totalSteps } = useOnboardingState()
  const { towers, addTower, addPod, refresh } = useTowerContext()

  const handleStep2Next = async (podsPerTower: number) => {
    setField('podsPerTower', podsPerTower)
    const count = data.towerCount
    const created: Awaited<ReturnType<typeof addTower>>[] = []
    for (let i = 0; i < count; i++) {
      const record = await addTower(podsPerTower)
      created.push(record)
    }
    setField('createdTowers', created)
    await refresh()
    next()
  }

  const handleFinish = () => {
    navigate('/dashboard', { replace: true })
  }

  const handleStep7Finish = async () => {
    await addPod({
      ...(data.nfcPodId && { id: data.nfcPodId }),
      towerId: data.towerId,
      plantId: data.plantId,
      plantName: data.plantName,
      slotNumber: data.slotNumber,
      plantedAt: data.plantedAt,
      photoDataUrl: data.photoDataUrl,
      growthStage: 'germination',
      perenualId: data.perenualId,
      plantImageUrl: data.plantImageUrl,
    })
    handleFinish()
  }

  const towersForSlotStep = data.createdTowers.length > 0 ? data.createdTowers : towers

  return (
    <div className="min-h-screen pb-safe">
      {step > 1 && (
        <header className="sticky top-0 z-10 flex items-center border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
          <Button variant="ghost" size="sm" onClick={back} className="gap-1">
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
          <span className="ml-4 text-sm text-slate-500">
            Step {step} of {totalSteps}
          </span>
        </header>
      )}

      {step === 1 && (
        <OnboardingStep1
          value={data.towerCount}
          onChange={(n) => setField('towerCount', n)}
          onNext={next}
        />
      )}
      {step === 2 && (
        <OnboardingStepPodsPerTower
          value={data.podsPerTower}
          onChange={(n) => setField('podsPerTower', n)}
          onNext={handleStep2Next}
        />
      )}
      {step === 3 && (
        <OnboardingStep2
          plantId={data.plantId}
          plantName={data.plantName}
          onChange={(id, name) => {
            setField('plantId', id)
            setField('plantName', name)
          }}
          onNext={next}
        />
      )}
      {step === 4 && (
        <OnboardingStep3
          towers={towersForSlotStep}
          towerId={data.towerId}
          slotNumber={data.slotNumber}
          onTowerChange={(id) => setField('towerId', id)}
          onSlotChange={(n) => setField('slotNumber', n)}
          onNext={next}
        />
      )}
      {step === 5 && (
        <OnboardingStep4
          plantedAt={data.plantedAt}
          onChange={(ts) => setField('plantedAt', ts)}
          onNext={next}
        />
      )}
      {step === 6 && (
        <OnboardingStep5
          photoDataUrl={data.photoDataUrl}
          onChange={(url) => setField('photoDataUrl', url)}
          onNext={next}
        />
      )}
      {step === 7 && (
        <OnboardingStep6
          nfcPodId={data.nfcPodId}
          onNfcChange={(id) => setField('nfcPodId', id)}
          onFinish={handleStep7Finish}
        />
      )}
    </div>
  )
}
