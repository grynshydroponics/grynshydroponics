import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useTowerContext } from '@/context/TowerContext'
import { SplashScreen } from '@/components/features/SplashScreen'
import { AppLayout } from '@/components/features/AppLayout'
import { Dashboard } from '@/components/features/Dashboard'
import { TowerView } from '@/components/features/TowerView'
import { AddPodToTower } from '@/components/features/AddPodToTower'
import { PodDetail } from '@/components/features/PodDetail'
import { PlantLibrary } from '@/components/features/PlantLibrary'
import { PlantDetail } from '@/components/features/PlantDetail'
import { OnboardingFlow } from '@/components/features/onboarding/OnboardingFlow'
import { InstallGate } from '@/components/features/InstallGate'

const SPLASH_DURATION_MS = 5000

function AppRoutes() {
  const { towers, pods, isInitialized } = useTowerContext()
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  const hasTowerData = towers.length > 0
  const showSplash = !splashDone

  if (showSplash) {
    return <SplashScreen />
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  const initialRoute = hasTowerData ? '/dashboard' : '/onboarding'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={initialRoute} replace />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard
              towers={towers}
              podCountByTower={pods.reduce<Record<string, number>>((acc, p) => {
                acc[p.towerId] = (acc[p.towerId] ?? 0) + 1
                return acc
              }, {})}
            />
          </AppLayout>
        }
      />
      <Route
        path="/tower/:towerId"
        element={
          <AppLayout>
            <TowerRoute />
          </AppLayout>
        }
      />
      <Route
        path="/tower/:towerId/add-pod"
        element={
          <AppLayout>
            <AddPodToTower />
          </AppLayout>
        }
      />
      <Route
        path="/pod/:podId"
        element={
          <AppLayout>
            <PodRoute />
          </AppLayout>
        }
      />
      <Route
        path="/plants"
        element={
          <AppLayout>
            <PlantLibrary />
          </AppLayout>
        }
      />
      <Route
        path="/plant/:plantId"
        element={
          <AppLayout>
            <PlantDetail />
          </AppLayout>
        }
      />
      <Route path="*" element={<Navigate to={initialRoute} replace />} />
    </Routes>
  )
}

function TowerRoute() {
  const { towerId } = useParams<{ towerId: string }>()
  const { towers, pods } = useTowerContext()
  const tower = towers.find((t) => t.id === towerId)
  if (!tower) return <Navigate to="/dashboard" replace />
  return <TowerView tower={tower} pods={pods} />
}

function PodRoute() {
  const { podId } = useParams<{ podId: string }>()
  const { pods } = useTowerContext()
  const pod = pods.find((p) => p.id === podId)
  if (!pod) return <Navigate to="/dashboard" replace />
  return <PodDetail pod={pod} />
}

export default function App() {
  return (
    <InstallGate>
      <AppRoutes />
    </InstallGate>
  )
}
