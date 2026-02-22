import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { PLANT_LIBRARY, getPlantIconUrl } from '@/data/plants'
import { resolvePlantAssetUrl } from '@/utils/assetUrl'
export function PlantLibrary() {
  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-semibold text-slate-100">Plant library</h1>
      <p className="mt-1 text-sm text-slate-400">
        Tap a plant to see full details.
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {PLANT_LIBRARY.map((plant) => {
          const iconUrl = resolvePlantAssetUrl(getPlantIconUrl(plant))
          return (
            <li key={plant.id}>
              <Link
                to={`/plant/${plant.id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-surface transition-colors hover:border-accent/50"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
                  {iconUrl ? (
                    <>
                      <img
                        src={iconUrl}
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
                      <span className="hidden h-full w-full items-center justify-center" aria-hidden>
                        <Leaf className="h-10 w-10 text-slate-500" />
                      </span>
                    </>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <Leaf className="h-10 w-10 text-slate-500" />
                    </span>
                  )}
                </div>
                <p className="truncate p-2 text-center text-sm font-medium text-slate-100">
                  {plant.name}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
