import { useEffect, useId, useRef, useState } from 'react'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from '../constants'
import type { ProductCategory } from '../types'

interface CategoryFilterDropdownProps {
  value: ProductCategory | ''
  onChange: (value: ProductCategory | '') => void
}

const OPTIONS: Array<{ value: ProductCategory | ''; label: string }> = [
  { value: '', label: 'Todos' },
  ...PRODUCT_CATEGORIES.map((categoria) => ({
    value: categoria,
    label: PRODUCT_CATEGORY_LABELS[categoria],
  })),
]

export function CategoryFilterDropdown({
  value,
  onChange,
}: CategoryFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const isHighlighted = isOpen || value !== ''

  useEffect(() => {
    if (!isOpen) {
      return
    }

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
  }, [isOpen])

  function select(option: ProductCategory | '') {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-sm font-semibold transition ${
          isHighlighted
            ? 'border-primary-dark bg-primary-dark text-accent-yellow-soft'
            : 'border-slate-300 bg-white text-foreground hover:border-primary'
        }`}
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 5h18l-7 8v6l-4 2v-8z" />
        </svg>
        Categoria
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isHighlighted ? 'text-accent-yellow' : 'text-primary'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-30 pt-2 sm:left-auto sm:right-0">
          <div
            id={panelId}
            className="grid w-[min(20rem,calc(100vw-2rem))] grid-cols-1 gap-x-3 gap-y-1 rounded-b-3xl bg-primary-dark px-5 py-4 shadow-lg sm:w-max sm:max-w-[calc(100vw-2rem)] sm:grid-cols-[repeat(3,auto)]"
          >
            {OPTIONS.map((option) => {
              const isSelected = option.value === value

              return (
                <button
                  key={option.value || 'todos'}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => select(option.value)}
                  className={`min-h-10 whitespace-nowrap rounded-md px-3 text-left text-sm font-semibold transition sm:text-center ${
                    isSelected
                      ? 'bg-white/10 text-accent-yellow-soft'
                      : 'text-white hover:bg-primary-darker hover:text-accent-yellow-soft'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
