import { Plus, QrCode } from 'lucide-react'

interface LinkQrCodeButtonProps {
  onClick: () => void
  ariaLabel?: string
}

export function LinkQrCodeButton({ onClick, ariaLabel = 'Link QR code to pod' }: LinkQrCodeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-100"
      aria-label={ariaLabel}
    >
      <QrCode className="h-5 w-5" />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
        <Plus className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    </button>
  )
}
