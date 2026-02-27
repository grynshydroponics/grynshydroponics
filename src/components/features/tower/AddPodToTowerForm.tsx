import type React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BOTTOM_NAV_HEIGHT } from '@/components/ui/BottomNav'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LinkQrCodeButton } from '@/components/ui/LinkQrCodeButton'
import { PodPhotoPicker } from '@/components/ui/PodPhotoPicker'
import { Select } from '@/components/ui/Select'
import { PlantSelect } from '@/components/ui/PlantSelect'
import { toDateInputValue } from '@/utils/date'
import { isQrSupported } from '@/utils/qr'
import { QrScanModal } from '@/components/features/qr/QrScanModal'

const ADD_POD_PAGE_STYLE = {
  paddingBottom: `max(${BOTTOM_NAV_HEIGHT}, calc(${BOTTOM_NAV_HEIGHT} + env(safe-area-inset-bottom, 0px)))`,
}

interface AddPodToTowerHeaderProps {
  towerId: string
  onScanClick: () => void
}

function AddPodToTowerHeader({ towerId, onScanClick }: AddPodToTowerHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link to={`/tower/${towerId}`} className="shrink-0 p-1 text-slate-400 hover:text-slate-100">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-lg font-medium text-slate-100">Add pod</span>
      </div>
      {isQrSupported() && (
        <div className="flex shrink-0 items-center gap-1">
          <LinkQrCodeButton onClick={onScanClick} ariaLabel="Scan QR code to link to this pod" />
        </div>
      )}
    </header>
  )
}

interface AddPodFormFieldsProps {
  podPhotoImageUrl: string | null
  photoDataUrl: string | null
  onPhotoChange: (url: string | null) => void
  plantName: string
  plantId: string
  onPlantIdChange: (id: string) => void
  slotNumber: number
  slotNumberValid: boolean
  defaultSlot: number | undefined
  availableSlots: number[]
  onSlotChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  plantedAt: number
  onPlantedAtChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  qrPromptOpen: boolean
  onQrClose: () => void
  onQrResult: (value: string) => void
}

function AddPodFormFields({
  podPhotoImageUrl,
  photoDataUrl,
  onPhotoChange,
  plantName,
  plantId,
  onPlantIdChange,
  slotNumber,
  slotNumberValid,
  defaultSlot,
  availableSlots,
  onSlotChange,
  plantedAt,
  onPlantedAtChange,
  qrPromptOpen,
  onQrClose,
  onQrResult,
}: AddPodFormFieldsProps) {
  return (
    <div className="space-y-6 px-4 py-6">
      <div className="mb-2 flex justify-center">
        <PodPhotoPicker
          imageUrl={podPhotoImageUrl}
          value={photoDataUrl}
          onChange={onPhotoChange}
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
          onChange={onPlantIdChange}
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
              onChange={onSlotChange}
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
              onChange={onPlantedAtChange}
              className="h-full w-full min-h-0 rounded-none border-0 bg-transparent py-0"
            />
          </div>
        </div>
      </div>

      <QrScanModal
        open={qrPromptOpen}
        onClose={onQrClose}
        onResult={onQrResult}
        title="Scan pod QR code"
      />
    </div>
  )
}

interface AddPodToTowerFormProps {
  towerId: string
  podPhotoImageUrl: string | null
  photoDataUrl: string | null
  onPhotoChange: (url: string | null) => void
  plantName: string
  plantId: string
  onPlantIdChange: (id: string) => void
  slotNumber: number
  slotNumberValid: boolean
  defaultSlot: number | undefined
  availableSlots: number[]
  onSlotChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  plantedAt: number
  onPlantedAtChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  qrPromptOpen: boolean
  onQrOpen: () => void
  onQrClose: () => void
  onQrResult: (value: string) => void
  onSave: () => void
  saving: boolean
}

export function AddPodToTowerForm({
  towerId,
  podPhotoImageUrl,
  photoDataUrl,
  onPhotoChange,
  plantName,
  plantId,
  onPlantIdChange,
  slotNumber,
  slotNumberValid,
  defaultSlot,
  availableSlots,
  onSlotChange,
  plantedAt,
  onPlantedAtChange,
  qrPromptOpen,
  onQrOpen,
  onQrClose,
  onQrResult,
  onSave,
  saving,
}: AddPodToTowerFormProps) {
  return (
    <div
      className="fixed inset-0 z-10 flex flex-col overflow-hidden bg-slate-900"
      style={ADD_POD_PAGE_STYLE}
    >
      <AddPodToTowerHeader towerId={towerId} onScanClick={onQrOpen} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <AddPodFormFields
          podPhotoImageUrl={podPhotoImageUrl}
          photoDataUrl={photoDataUrl}
          onPhotoChange={onPhotoChange}
          plantName={plantName}
          plantId={plantId}
          onPlantIdChange={onPlantIdChange}
          slotNumber={slotNumber}
          slotNumberValid={slotNumberValid}
          defaultSlot={defaultSlot}
          availableSlots={availableSlots}
          onSlotChange={onSlotChange}
          plantedAt={plantedAt}
          onPlantedAtChange={onPlantedAtChange}
          qrPromptOpen={qrPromptOpen}
          onQrClose={onQrClose}
          onQrResult={onQrResult}
        />
      </div>
      <div className="shrink-0 bg-slate-900/95 px-4 py-3 pb-6 backdrop-blur">
        <Button className="w-full" onClick={onSave} disabled={!plantId || saving}>
          {saving ? 'Saving...' : 'Save pod'}
        </Button>
      </div>
    </div>
  )
}

