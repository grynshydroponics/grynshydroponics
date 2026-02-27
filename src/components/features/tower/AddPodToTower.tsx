import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PLANT_LIBRARY, getPlantIconUrl } from '@/data/plants'
import { useTowerContext } from '@/context/TowerContext'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
import { saveNewPod } from '@/handlers/podHandlers'
import { TowerNotFound, AddPodAllSlotsUsed } from './AddPodToTowerEmptyStates'
import { AddPodToTowerForm } from './AddPodToTowerForm'

export function AddPodToTower() {
  const { towerId } = useParams<{ towerId: string }>()
  const navigate = useNavigate()
  const { towers, pods, addPod } = useTowerContext()

  const tower = towers.find((t) => t.id === towerId)
  const occupiedSlots = tower ? pods.filter((p) => p.towerId === tower.id).map((p) => p.slotNumber) : []
  const allSlots = tower ? Array.from({ length: tower.slotCount }, (_, i) => i + 1) : []
  const availableSlots = allSlots.filter((s) => !occupiedSlots.includes(s))

  const [plantId, setPlantId] = useState('')
  const [slotNumber, setSlotNumber] = useState(1)
  const [plantedAt, setPlantedAt] = useState(Date.now())
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [scanPodId, setScanPodId] = useState<string | null>(null)
  const [qrPromptOpen, setQrPromptOpen] = useState(false)

  const plant = PLANT_LIBRARY.find((p) => p.id === plantId)
  const plantName = (plant?.name ?? plantId) || ''
  const defaultSlot = availableSlots[0]
  const slotNumberValid = defaultSlot != null && availableSlots.includes(slotNumber)
  const podPhotoImageUrl = photoDataUrl ?? (plant ? resolvePlantAssetUrl(getPlantIconUrl(plant)) : null)

  useEffect(() => {
    if (tower && defaultSlot != null && !availableSlots.includes(slotNumber)) {
      setSlotNumber(defaultSlot)
    }
  }, [tower?.id, defaultSlot, slotNumber, availableSlots])

  const handleSave = async () => {
    if (!tower) return
    const chosenSlot = slotNumberValid ? slotNumber : defaultSlot
    if (!plantId || !plantName.trim() || chosenSlot == null) return
    setSaving(true)
    try {
      await saveNewPod(addPod, navigate, {
        towerId: tower.id,
        plantId,
        plantName: plantName.trim(),
        slotNumber: chosenSlot,
        plantedAt,
        photoDataUrl,
        plantImageUrl: plant?.img ?? null,
        scanPodId: scanPodId ?? undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleQrResult = (value: string) => {
    setScanPodId(value)
    setQrPromptOpen(false)
  }

  const handlePlantedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlantedAt(new Date(e.target.value).getTime())
  }

  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSlotNumber(parseInt(e.target.value, 10))
  }

  let content
  if (!tower) {
    content = <TowerNotFound />
  } else if (availableSlots.length === 0) {
    content = <AddPodAllSlotsUsed towerId={tower.id} />
  } else {
    content = (
      <AddPodToTowerForm
        towerId={tower.id}
        podPhotoImageUrl={podPhotoImageUrl}
        photoDataUrl={photoDataUrl}
        onPhotoChange={setPhotoDataUrl}
        plantName={plantName}
        plantId={plantId}
        onPlantIdChange={setPlantId}
        slotNumber={slotNumber}
        slotNumberValid={slotNumberValid}
        defaultSlot={defaultSlot}
        availableSlots={availableSlots}
        onSlotChange={handleSlotChange}
        plantedAt={plantedAt}
        onPlantedAtChange={handlePlantedAtChange}
        qrPromptOpen={qrPromptOpen}
        onQrOpen={() => setQrPromptOpen(true)}
        onQrClose={() => setQrPromptOpen(false)}
        onQrResult={handleQrResult}
        onSave={handleSave}
        saving={saving}
      />
    )
  }

  return content
}
