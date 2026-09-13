import type { CatalogFilters as CatalogFiltersValue } from '../types'

interface CatalogFiltersProps {
  filters: CatalogFiltersValue
  cities: string[]
  onChange: (filters: CatalogFiltersValue) => void
}

export function CatalogFilters({
  filters,
  cities,
  onChange,
}: CatalogFiltersProps) {
  function updateFilter(
    field: keyof CatalogFiltersValue,
    value: string,
  ): void {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
      <label>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Buscar
        </span>
        <input
          type="search"
          value={filters.busca}
          onChange={(event) => updateFilter('busca', event.target.value)}
          placeholder="Produto ou produtor"
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
        />
      </label>

      <label>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Município
        </span>
        <select
          value={filters.municipio}
          onChange={(event) => updateFilter('municipio', event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand-600"
        >
          <option value="">Todos</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
