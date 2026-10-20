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
  2: 'lg:w-[26rem] lg:grid-cols-2',
  3: 'lg:w-[40rem] lg:grid-cols-3',
  4: 'lg:w-[46rem] lg:grid-cols-4',
}

const DESKTOP_FILTER_MEDIA = '(min-width: 1024px)'

function getColumnCount(optionCount: number): ColumnCount {
  const columns = Math.ceil((optionCount + 1) / OPTIONS_PER_COLUMN)

  return Math.min(4, Math.max(2, columns)) as ColumnCount
}

function getOptionClassName(isSelected: boolean): string {
  const stateClassName = isSelected
    ? 'text-accent-yellow-soft'
    : 'text-white hover:bg-primary-darker hover:text-accent-yellow-soft'

  return `block w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition lg:text-center ${stateClassName}`
}

function useIsDesktopFilterLayout(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(DESKTOP_FILTER_MEDIA).matches
      : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_FILTER_MEDIA)

    function handleChange(event: MediaQueryListEvent): void {
      setIsDesktop(event.matches)
    }

    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-accent-yellow transition-transform ${
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
  const isDesktopLayout = useIsDesktopFilterLayout()
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
      className="relative"
      onPointerEnter={(event) => openOnMouseHover(event.pointerType)}
      onPointerLeave={(event) => closeOnMouseLeave(event.pointerType)}
    >
      <button
        type="button"
        className={`inline-flex min-h-11 items-center gap-2 px-3 py-2 text-sm font-semibold transition hover:text-accent-yellow-soft sm:text-base ${
          isHighlighted ? 'text-accent-yellow-soft' : 'text-white'
        }`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-30 w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] pt-3 lg:w-auto">
          <div
            id={menuId}
            className={`grid max-h-80 grid-cols-1 gap-x-4 gap-y-1 overflow-y-auto rounded-b-3xl bg-primary-dark px-4 py-4 shadow-lg lg:max-h-none lg:grid-flow-col lg:px-6 ${PANEL_LAYOUT_CLASS[columns]}`}
            style={
              isDesktopLayout
                ? { gridTemplateRows: `repeat(${rowCount}, auto)` }
                : undefined
            }
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

function FilterDropdowns({
  filters,
  categoryOptions,
  cityOptions,
  certificationOptions,
  onChange,
}: {
  filters: CatalogFilters
  categoryOptions: FilterOption[]
  cityOptions: FilterOption[]
  certificationOptions: FilterOption[]
  onChange: (filters: CatalogFilters) => void
}) {
  return (
    <>
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
    </>
  )
}

export function CatalogFilterBar({
  filters,
  categories,
  cities,
  certifications,
  onChange,
}: CatalogFilterBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const filtersPanelId = useId()

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

  const activeFilterCount = [
    filters.municipio,
    filters.categoria,
    filters.certificacao,
  ].filter((value) => value !== ALL_OPTIONS_VALUE).length
  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="z-30 bg-primary-dark shadow-md lg:sticky lg:top-[5.5rem]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="hidden flex-wrap items-center gap-1 sm:gap-6 lg:flex">
          <FilterDropdowns
            filters={filters}
            categoryOptions={categoryOptions}
            cityOptions={cityOptions}
            certificationOptions={certificationOptions}
            onChange={onChange}
          />
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                isFiltersOpen || hasActiveFilters
                  ? 'border-accent-yellow text-accent-yellow-soft'
                  : 'border-primary text-white'
              }`}
              aria-expanded={isFiltersOpen}
              aria-controls={filtersPanelId}
              onClick={() => setIsFiltersOpen((current) => !current)}
            >
              Filtros
              {hasActiveFilters ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-yellow px-1.5 text-xs font-bold text-foreground">
                  {activeFilterCount}
                </span>
              ) : (
                <ChevronIcon isOpen={isFiltersOpen} />
              )}
            </button>
            <label className="sr-only" htmlFor="catalog-search-mobile">
              Buscar
            </label>
            <input
              id="catalog-search-mobile"
              type="search"
              placeholder="Buscar produtos..."
              value={filters.busca}
              onChange={(event) =>
                onChange({ ...filters, busca: event.target.value })
              }
              className="min-h-11 w-full rounded-lg border border-primary bg-foreground/40 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent-yellow focus:outline-none"
            />
          </div>

          {isFiltersOpen ? (
            <div
              id={filtersPanelId}
              className="flex flex-wrap items-center gap-1 border-t border-primary pt-2"
            >
              <FilterDropdowns
                filters={filters}
                categoryOptions={categoryOptions}
                cityOptions={cityOptions}
                certificationOptions={certificationOptions}
                onChange={onChange}
              />
            </div>
          ) : null}
        </div>

        <div className="hidden flex-1 items-center gap-3 lg:flex lg:max-w-md lg:justify-end">
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
            className="min-h-10 w-full rounded-lg border border-primary bg-foreground/40 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent-yellow focus:outline-none"
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
