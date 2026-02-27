import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BOTTOM_NAV_HEIGHT } from '@/components/ui/BottomNav'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LinkQrCodeButton } from '@/components/ui/LinkQrCodeButton'
import { PodPhotoPicker } from '@/components/ui/PodPhotoPicker'
import { Select } from '@/components/ui/Select'
import { PlantSelect } from '@/components/ui/PlantSelect'
import { PLANT_LIBRARY, getPlantIconUrl } from '@/data/plants'
import { useTowerContext } from '@/context/TowerContext'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
import { toDateInputValue } from '@/utils/date'
import { isQrSupported } from '@/utils/qr'
import { QrScanPromptModal } from '@/components/features/QrScanPromptModal'

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
      await addPod({
        ...(scanPodId && { id: scanPodId, linkedQrCode: scanPodId }),
        towerId: tower.id,
        plantId,
        plantName: plantName.trim(),
        slotNumber: chosenSlot,
        plantedAt,
        photoDataUrl,
        growthStage: 'germination',
        perenualId: null,
        plantImageUrl: plant?.img ?? null,
      })
      navigate(`/tower/${tower.id}`, { replace: true })
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

  if (!tower) {
    return (
      <div className="px-4 py-6">
        <p className="text-slate-500">Tower not found.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-accent">Back to dashboard</Link>
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className="min-h-screen pb-8">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
          <Link to={`/tower/${tower.id}`} className="p-1 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-lg font-medium text-slate-100">Add pod</span>
        </header>
        <div className="px-4 py-6">
          <p className="text-slate-400">All slots in this tower are in use.</p>
          <Link to={`/tower/${tower.id}`} className="mt-2 inline-block text-accent">Back to tower</Link>
        </div>
      </div>
    )
  }

  const podPhotoImageUrl = photoDataUrl ?? (plant ? resolvePlantAssetUrl(getPlantIconUrl(plant)) : null)
  const paddingBottomStyle = { paddingBottom: `max(${BOTTOM_NAV_HEIGHT}, calc(${BOTTOM_NAV_HEIGHT} + env(safe-area-inset-bottom, 0px)))` }

  return (
    <div
      className="fixed inset-0 z-10 flex flex-col overflow-hidden bg-slate-900"
      style={paddingBottomStyle}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link to={`/tower/${tower.id}`} className="shrink-0 p-1 text-slate-400 hover:text-slate-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-lg font-medium text-slate-100">Add pod</span>
        </div>
        {isQrSupported() && (
          <div className="flex shrink-0 items-center gap-1">
            <LinkQrCodeButton onClick={() => setQrPromptOpen(true)} ariaLabel="Scan QR code to link to this pod" />
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-6">
          <div className="mb-2 flex justify-center">
            <PodPhotoPicker
              imageUrl={podPhotoImageUrl}
              value={photoDataUrl}
              onChange={setPhotoDataUrl}
              placeholder="camera"
              alt={plantName || 'Plant'}
              title="Pod photo"
              cameraButtonBehindOverlay={qrPromptOpen}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Plant</label>
            <PlantSelect
              value={plantId}
              onChange={setPlantId}
              placeholder="Select a plant"
              ariaLabel="Plant"
            />
          </div>

          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-400">Slot</label>
              <div className="h-10 overflow-hidden rounded-lg border border-slate-600 bg-slate-800">
                <Select
                  value={slotNumberValid ? slotNumber : defaultSlot ?? 1}
                  onChange={handleSlotChange}
                  className="h-full w-full min-h-0 rounded-none border-0 bg-transparent"
                >
                  {availableSlots.map((s) => (
                    <option key={s} value={s}>
                      Slot {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-400">Planted date</label>
              <div className="h-10 overflow-hidden rounded-lg border border-slate-600 bg-slate-800">
                <Input
                  type="date"
                  value={toDateInputValue(plantedAt)}
                  onChange={handlePlantedAtChange}
                  className="h-full w-full min-h-0 rounded-none border-0 bg-transparent py-0"
                />
              </div>
            </div>
          </div>

          <QrScanPromptModal
            open={qrPromptOpen}
            onClose={() => setQrPromptOpen(false)}
            onResult={handleQrResult}
            title="Scan pod QR code"
          />
        </div>
      </div>

      <div className="shrink-0 bg-slate-900/95 px-4 py-3 pb-6 backdrop-blur">
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!plantId || saving}
        >
          {saving ? 'Saving...' : 'Save pod'}
        </Button>
      </div>
    </div>
  )
}
