/**
 * Pod photo circle + camera button + photo picker modal. Use on pod detail and add-pod screens.
 * Parent passes imageUrl (what to show), value/onChange (current photo and update).
 */
import { useState } from 'react'
import { Camera, Leaf } from 'lucide-react'
import { PhotoPickerModal } from '@/components/ui/PhotoPickerModal'

export type PodPhotoPlaceholder = 'camera' | 'leaf'

interface PodPhotoPickerProps {
  /** Image URL to show in the circle (custom photo or plant icon). */
  imageUrl: string | null
  /** Current photo value (for the picker modal). */
  value: string | null
  onChange: (dataUrl: string | null) => void
  placeholder: PodPhotoPlaceholder
  alt: string
  /** Modal title. */
  title?: string
  /** When true, camera button uses lower z-index so it stays behind overlays (e.g. QR modal). */
  cameraButtonBehindOverlay?: boolean
}

export function PodPhotoPicker({
  imageUrl,
  value,
  onChange,
  placeholder,
  alt,
  title = 'Pod photo',
  cameraButtonBehindOverlay = false,
}: PodPhotoPickerProps) {
  const [open, setOpen] = useState(false)
  const PlaceholderIcon = placeholder === 'camera' ? Camera : Leaf

  return (
    <>
      <div className="relative h-40 w-40 shrink-0">
        <div className="absolute inset-0 overflow-hidden rounded-full border border-slate-700 bg-surface-muted">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={alt}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling
                  if (fallback instanceof HTMLElement) fallback.classList.remove('hidden')
                }}
              />
              <div
                className="absolute inset-0 flex hidden items-center justify-center bg-surface-muted"
                aria-hidden
              >
                <Leaf className="h-16 w-16 text-slate-600" />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center" aria-hidden>
              <PlaceholderIcon className="h-16 w-16 text-slate-500" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/95 text-slate-100 shadow-lg backdrop-blur hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent ${cameraButtonBehindOverlay ? 'z-0' : 'z-[100]'}`}
          aria-label="Change pod photo"
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>
      <PhotoPickerModal
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onChange={onChange}
        title={title}
      />
    </>
  )
}
