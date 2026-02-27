import { useState } from 'react'
import { BottomNav, BOTTOM_NAV_HEIGHT } from '@/components/ui/BottomNav'
import { QrScanModal } from './QrScanModal'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [scanModalOpen, setScanModalOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <main style={{ paddingBottom: BOTTOM_NAV_HEIGHT }}>{children}</main>
      <QrScanModal open={scanModalOpen} onClose={() => setScanModalOpen(false)} />
      <BottomNav onScanClick={() => setScanModalOpen(true)} />
    </div>
  )
}
