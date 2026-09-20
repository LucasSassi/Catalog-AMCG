import { useEffect, useId, useRef, useState } from 'react'
import { PRODUCT_CATEGORY_LABELS } from '../constants'
import type { CatalogFilters, ProductCategory } from '../types'
import logoCatalogo from '../../../shared/assets/logo-catalogo-campos-gerais-branca.png'

interface CatalogFilterBarProps {
  filters: CatalogFilters
  categories: ProductCategory[]
  cities: string[]
  certifications: string[]
  onChange: (filters: CatalogFilters) => void
}

function FilterDropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onSelect: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white transition hover:text-accent-300"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
        <span className="text-accent-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="absolute left-0 top-full z-30 mt-1 max-h-72 min-w-56 overflow-auto rounded-b-xl bg-brand-800 p-2 shadow-lg"
        >
          <button
            type="button"
            className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
              !value ? 'text-accent-300' : 'text-white hover:bg-brand-700'
            }`}
            onClick={() => {
              onSelect('')
              setIsOpen(false)
            }}
          >
            Todos
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                value === option.value
                  ? 'text-accent-300'
                  : 'text-white hover:bg-brand-700'
              }`}
              onClick={() => {
                onSelect(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function CatalogFilterBar({
  filters,
  categories,
  cities,
  certifications,
  onChange,
}: CatalogFilterBarProps) {
  const categoryOptions = categories.map((categoria) => ({
    value: categoria,
    label: PRODUCT_CATEGORY_LABELS[categoria] ?? categoria,
  }))

  const cityOptions = cities.map((cidade) => ({
    value: cidade,
    label: cidade,
  }))

  const certificationOptions = certifications.map((certificacao) => ({
    value: certificacao,
    label: certificacao,
  }))

  return (
    <div className="sticky top-[4.5rem] z-30 bg-brand-800 shadow-md md:top-[5.5rem]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-1 sm:gap-3">
          <FilterDropdown
            label="Município"
            value={filters.municipio}
            options={cityOptions}
            onSelect={(municipio) => onChange({ ...filters, municipio })}
          />
          <FilterDropdown
            label="Categoria"
            value={filters.categoria}
            options={categoryOptions}
            onSelect={(categoria) => onChange({ ...filters, categoria })}
          />
          <FilterDropdown
            label="Certificação"
            value={filters.certificacao}
            options={certificationOptions}
            onSelect={(certificacao) => onChange({ ...filters, certificacao })}
          />
        </div>

        <div className="flex flex-1 items-center gap-3 lg:max-w-md lg:justify-end">
          <label className="sr-only" htmlFor="catalog-search">
            Buscar
          </label>
          <input
            id="catalog-search"
            type="search"
            placeholder="Buscar produtos..."
            value={filters.busca}
            onChange={(event) =>
              onChange({ ...filters, busca: event.target.value })
            }
            className="min-h-10 w-full rounded-lg border border-brand-600 bg-brand-900/40 px-3 py-2 text-sm text-white placeholder:text-brand-200 focus:border-accent-400 focus:outline-none"
          />
          <img
            src={logoCatalogo}
            alt=""
            className="hidden h-10 w-auto object-contain xl:block"
          />
        </div>
      </div>
    </div>
  )
}
