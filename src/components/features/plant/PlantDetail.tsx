import { useParams, Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { PLANT_LIBRARY, getPlantIconUrl, type GrowthStageEntry } from '@/data/plants'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
import { formatDuration } from '@/utils/formatDuration'
import { formatStageKey } from '@/utils/plantStage'

export function PlantDetail() {
  const { plantId } = useParams<{ plantId: string }>()
  const plant = PLANT_LIBRARY.find((p) => p.id === plantId)

  if (!plant) {
    return (
      <div className="px-4 py-6">
        <p className="text-slate-500">Plant not found.</p>
        <Link to="/plants" className="mt-2 inline-block text-accent">
          Back to library
        </Link>
      </div>
    )
  }

  const iconUrl = resolvePlantAssetUrl(getPlantIconUrl(plant))
  const displayImageUrl = iconUrl

  return (
    <div className="px-4 py-6">
      <Link
        to="/plants"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-100"
      >
        ← Library
      </Link>

      <div className="mt-4 flex flex-col items-center text-center">
        <div className="h-32 w-32 overflow-hidden rounded-full border border-slate-700 bg-surface-muted">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const n = e.currentTarget.nextElementSibling
                if (n instanceof HTMLElement) {
                  n.classList.remove('hidden')
                  n.classList.add('flex')
                }
              }}
            />
          ) : null}
          <span className="hidden h-full w-full items-center justify-center" aria-hidden>
            <Leaf className="h-12 w-12 text-slate-500" />
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-slate-100">{plant.name}</h1>
        {plant.species && (
          <p className="mt-1 text-sm italic text-slate-400">{plant.species}</p>
        )}
      </div>

      {plant.description && (
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-300">
          {plant.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {plant.harvest?.duration && (
          <div className="rounded-xl border border-slate-700 bg-surface p-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">Harvest</p>
            <p className="mt-0.5 text-sm text-slate-100">
              {formatDuration(plant.harvest.duration)}
            </p>
          </div>
        )}
        {plant.yield && (
          <div className="rounded-xl border border-slate-700 bg-surface p-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">Yield</p>
            <p className="mt-0.5 text-sm text-slate-100">
              {plant.yield.label ??
                (plant.yield.value != null && plant.yield.unit != null
                  ? `${plant.yield.value} ${plant.yield.unit}`
                  : plant.yield.unit ?? '—')}
            </p>
          </div>
        )}
      </div>

      {plant.growth_stages?.filter((s): s is GrowthStageEntry => s != null).length ? (
        <div className="mt-4 rounded-xl border border-slate-700 bg-surface p-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
            Growth stages
          </p>
          <ul className="space-y-3">
            {plant.growth_stages
              .filter((s): s is GrowthStageEntry => s != null)
              .map((stage) => (
                <li
                  key={stage.stage}
                  className="border-b border-slate-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-slate-100">
                      {formatStageKey(stage.stage)}
                    </span>
                    {stage.duration && (
                      <span className="text-sm text-slate-400">
                        {formatDuration(stage.duration)}
                      </span>
                    )}
                  </div>
                  {stage.description && (
                    <p className="mt-1 text-sm text-slate-400">{stage.description}</p>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {plant.hardinessZone &&
        (plant.hardinessZone.min != null || plant.hardinessZone.max != null) && (
          <div className="mt-4 rounded-xl border border-slate-700 bg-surface p-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Hardiness zone
            </p>
            <p className="mt-0.5 text-sm text-slate-100">
              {[plant.hardinessZone.min, plant.hardinessZone.max]
                .filter((n) => n != null)
                .join(' – ')}
            </p>
          </div>
        )}
    </div>
  )
}

