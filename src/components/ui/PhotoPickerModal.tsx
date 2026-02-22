import { useRef, useState, useEffect } from 'react'
import { ArrowLeft, Camera, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PhotoPickerModalProps {
  open: boolean
  onClose: () => void
  value: string | null
  onChange: (dataUrl: string | null) => void
  title?: string
}

export function PhotoPickerModal({
  open,
  onClose,
  value,
  onChange,
  title = 'Photo',
}: PhotoPickerModalProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraView, setCameraView] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setCameraView(false)
      setCameraError(null)
      setCameraReady(false)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open || !cameraView || !videoRef.current) return
    setCameraError(null)
    setCameraReady(false)
    const video = videoRef.current
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
      .then((stream) => {
        streamRef.current = stream
        video.srcObject = stream
        video.play().catch(() => {})
      })
      .catch((err) => {
        setCameraError(err.message || 'Camera access denied')
      })
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      video.srcObject = null
    }
  }, [open, cameraView])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
      onClose()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || !video.srcObject) return
    let w = video.videoWidth
    let h = video.videoHeight
    if (!w || !h) return
    const maxDim = 1024
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w)
        w = maxDim
      } else {
        w = Math.round((w * maxDim) / h)
        h = maxDim
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setCameraView(false)
      onChange(dataUrl)
      onClose()
    } catch {
      setCameraError('Failed to capture photo')
    }
  }

  const handleRemove = () => {
    onChange(null)
    onClose()
  }

  if (!open) return null

  if (cameraView) {
    return (
      <div
        className="fixed inset-0 z-[200] flex flex-col bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="Camera"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          onLoadedData={() => setCameraReady(videoRef.current != null && videoRef.current.videoWidth > 0)}
          onCanPlay={() => setCameraReady(videoRef.current != null && videoRef.current.videoWidth > 0)}
        />
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 p-4">
            <p className="text-center text-slate-300">{cameraError}</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4 pb-8">
          <Button variant="secondary" onClick={() => setCameraView(false)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleCapture}
            disabled={!!cameraError || !cameraReady}
            className="h-14 w-14 rounded-full border-4 border-white bg-white/20 p-0"
            aria-label="Capture photo"
          >
            <Camera className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-picker-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-800 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="photo-picker-modal-title" className="mb-3 text-lg font-medium text-slate-100">
          {title}
        </h2>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => uploadInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Upload photo
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => setCameraView(true)}
          >
            <Camera className="h-4 w-4" />
            Take photo
          </Button>
          {value && (
            <Button
              variant="secondary"
              className="w-full justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              Remove photo
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
