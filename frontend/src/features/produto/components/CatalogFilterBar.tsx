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

interface FilterOption {
  value: string
  label: string
}

type ColumnCount = 2 | 3 | 4

interface FilterDropdownProps {
  label: string
  value: string
  options: FilterOption[]
  columns: ColumnCount
  onSelect: (value: string) => void
}

const ALL_OPTIONS_VALUE = ''
const OPTIONS_PER_COLUMN = 5
const MOUSE_POINTER = 'mouse'

const PANEL_LAYOUT_CLASS: Record<ColumnCount, string> = {
  2: 'sm:w-[26rem] sm:grid-cols-2',
  3: 'sm:w-[40rem] sm:grid-cols-3',
  4: 'sm:w-[46rem] sm:grid-cols-4',
}

function getColumnCount(optionCount: number): ColumnCount {
  const columns = Math.ceil((optionCount + 1) / OPTIONS_PER_COLUMN)

  return Math.min(4, Math.max(2, columns)) as ColumnCount
}

function getOptionClassName(isSelected: boolean): string {
  const stateClassName = isSelected
    ? 'text-accent-300'
    : 'text-white hover:bg-brand-700 hover:text-accent-300'

  return `block w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition sm:text-center ${stateClassName}`
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-accent-400 transition-transform ${
        isOpen ? 'rotate-180' : ''
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  columns,
  onSelect,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const isHighlighted = isOpen || value !== ALL_OPTIONS_VALUE
  const allOptions: FilterOption[] = [
    { value: ALL_OPTIONS_VALUE, label: 'Todos' },
    ...options,
  ]
  const rowCount = Math.ceil(allOptions.length / columns)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function selectOption(optionValue: string): void {
    onSelect(optionValue)
    setIsOpen(false)
  }

  function openOnMouseHover(pointerType: string): void {
    if (pointerType === MOUSE_POINTER) {
      setIsOpen(true)
    }
  }

  function closeOnMouseLeave(pointerType: string): void {
    if (pointerType === MOUSE_POINTER) {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={ref}
      className="sm:relative"
      onPointerEnter={(event) => openOnMouseHover(event.pointerType)}
      onPointerLeave={(event) => closeOnMouseLeave(event.pointerType)}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold transition hover:text-accent-300 sm:text-base ${
          isHighlighted ? 'text-accent-300' : 'text-white'
        }`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full z-30 pt-3 sm:inset-x-auto sm:left-0">
          <div
            id={menuId}
            className={`grid max-h-80 grid-cols-1 gap-x-4 gap-y-1 overflow-y-auto rounded-b-3xl bg-brand-800 px-4 py-4 shadow-lg sm:max-h-none sm:grid-flow-col sm:px-6 ${PANEL_LAYOUT_CLASS[columns]}`}
            style={{ gridTemplateRows: `repeat(${rowCount}, auto)` }}
          >
            {allOptions.map((option) => (
              <button
                key={option.value || 'todos'}
                type="button"
                className={getOptionClassName(value === option.value)}
                onClick={() => selectOption(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
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
        <div className="relative flex flex-wrap items-center gap-1 sm:gap-6">
          <FilterDropdown
            label="Município"
            value={filters.municipio}
            options={cityOptions}
            columns={4}
            onSelect={(municipio) => onChange({ ...filters, municipio })}
          />
          <FilterDropdown
            label="Categoria"
            value={filters.categoria}
            options={categoryOptions}
            columns={3}
            onSelect={(categoria) => onChange({ ...filters, categoria })}
          />
          <FilterDropdown
            label="Certificação"
            value={filters.certificacao}
            options={certificationOptions}
            columns={getColumnCount(certificationOptions.length)}
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
