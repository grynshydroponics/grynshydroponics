import { Link } from 'react-router-dom'
import { CheckCircle, Leaf, Plus } from 'lucide-react'
import type { PodRecord, TowerRecord } from '@/db'
import { capitalizeWords } from '@/utils/capitalize'
import { getPodDisplayInfo } from '@/utils/podDisplay'

interface TowerViewProps {
  tower: TowerRecord
  pods: PodRecord[]
}

export function TowerView({ tower, pods }: TowerViewProps) {
  const podsBySlot = pods
    .filter((p) => p.towerId === tower.id)
    .sort((a, b) => a.slotNumber - b.slotNumber)

  const podRows = podsBySlot.map(getPodDisplayInfo)

  return (
    <div className="space-y-4 px-4 py-6">
      <p className="text-sm text-slate-500">Version {__APP_VERSION__}</p>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Tower {tower.index + 1}</h1>
        <Link
          to={`/tower/${tower.id}/add-pod`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-muted"
          aria-label="Add pod"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>
      <p className="text-slate-400">
        {podsBySlot.length} of {tower.slotCount} slots in use
      </p>
      <ul className="space-y-2">
        {podsBySlot.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-600 bg-surface/50 py-8 text-center text-slate-500">
            No pods in this tower yet.
          </li>
        ) : (
          podRows.map((row) => (
            <li key={row.pod.id}>
              <Link
                to={`/pod/${row.pod.id}`}
                className="relative flex items-center gap-4 rounded-xl border border-slate-700 bg-surface px-4 py-2.5 transition-colors hover:border-accent/50"
              >
                <span className="absolute top-2 right-3 rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                  Slot {row.pod.slotNumber}
                </span>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {row.displayUrl ? (
                    <>
                      <img
                        src={row.displayUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const n = e.currentTarget.nextElementSibling
                          if (n instanceof HTMLElement) n.classList.remove('hidden')
                        }}
                      />
                      <span className="hidden h-full w-full items-center justify-center bg-surface-muted [&.flex]:flex" aria-hidden>
                        <Leaf className="h-8 w-8 text-slate-500" />
                      </span>
                    </>
                  ) : (
                    <Leaf className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pr-16">
                  <p className="font-medium text-slate-100">{capitalizeWords(row.pod.plantName)}</p>
                  {row.plant?.species && (
                    <p className="text-sm italic text-slate-500">{row.plant.species}</p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                    {row.isHarvested && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
                    )}
                    {row.stageName}
                    {row.durationStr ? <span className="ml-1">{row.durationStr}</span> : null}
                  </p>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
