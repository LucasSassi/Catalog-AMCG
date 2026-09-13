import type { CatalogFilters as CatalogFiltersValue } from '../types'

interface CatalogSidebarProps {
  filters: CatalogFiltersValue
  cities: string[]
  onChange: (filters: CatalogFiltersValue) => void
}

function municipalityItemClass(isActive: boolean): string {
  return [
    'block w-full rounded-md px-1 py-1.5 text-left text-sm transition',
    isActive
      ? 'font-bold text-brand-800'
      : 'font-normal text-slate-800 hover:text-brand-600',
  ].join(' ')
}

export function CatalogSidebar({
  filters,
  cities,
  onChange,
}: CatalogSidebarProps) {
  function updateFilter(
    field: keyof CatalogFiltersValue,
    value: string,
  ): void {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label>
          <span className="mb-1.5 block text-sm font-bold text-slate-900">
            Buscar
          </span>
          <input
            type="search"
            value={filters.busca}
            onChange={(event) => updateFilter('busca', event.target.value)}
            placeholder="Produto ou produtor"
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600"
          />
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-slate-900">Municípios</h2>
        <nav aria-label="Filtrar por município">
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => updateFilter('municipio', '')}
                className={municipalityItemClass(filters.municipio === '')}
              >
                Todos
              </button>
            </li>
            {cities.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  onClick={() => updateFilter('municipio', city)}
                  className={municipalityItemClass(filters.municipio === city)}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
