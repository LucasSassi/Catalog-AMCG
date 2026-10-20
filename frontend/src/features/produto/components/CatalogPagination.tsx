interface CatalogPaginationProps {
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

const arrowButtonClassName =
  'grid h-10 w-10 place-items-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

export function CatalogPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: CatalogPaginationProps) {
  if (!hasPrevious && !hasNext) {
    return null
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
      aria-label="Paginação de produtos"
    >
      <button
        type="button"
        className={arrowButtonClassName}
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Página anterior"
      >
        <ArrowIcon direction="left" />
      </button>

      <button
        type="button"
        className={arrowButtonClassName}
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Próxima página"
      >
        <ArrowIcon direction="right" />
      </button>
    </nav>
  )
}
