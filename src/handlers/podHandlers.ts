/**
 * Handlers for pod-related flows (add pod, etc.).
 * Pure logic: take dependencies + payload, perform side effects (context, navigate).
 * Components gather state and call these; no React state in handlers.
 */

export interface SaveNewPodParams {
  towerId: string
  plantId: string
  plantName: string
  slotNumber: number
  plantedAt: number
  photoDataUrl: string | null
  plantImageUrl: string | null
  /** When set, use as pod id and linked QR code (from scan/manual entry). */
  scanPodId?: string | null
}

type AddPodFn = (pod: {
  towerId: string
  plantId: string
  plantName: string
  slotNumber: number
  plantedAt: number
  photoDataUrl: string | null
  growthStage: 'germination'
  perenualId: null
  plantImageUrl: string | null
  id?: string
  linkedQrCode?: string | null
}) => Promise<unknown>

type NavigateFn = (path: string, opts?: { replace?: boolean }) => void

/**
 * Persist a new pod and navigate to the tower.
 * Caller is responsible for loading state (e.g. setSaving).
 */
export async function saveNewPod(
  addPod: AddPodFn,
  navigate: NavigateFn,
  params: SaveNewPodParams
): Promise<void> {
  const {
    towerId,
    plantId,
    plantName,
    slotNumber,
    plantedAt,
    photoDataUrl,
    plantImageUrl,
    scanPodId,
  } = params

  await addPod({
    ...(scanPodId && { id: scanPodId, linkedQrCode: scanPodId }),
    towerId,
    plantId,
    plantName,
    slotNumber,
    plantedAt,
    photoDataUrl,
    growthStage: 'germination',
    perenualId: null,
    plantImageUrl,
  })

  navigate(`/tower/${towerId}`, { replace: true })
}
