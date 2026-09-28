interface CatalogPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
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

function getPageButtonClassName(isActive: boolean): string {
  const stateClassName = isActive
    ? 'bg-brand-600 text-white'
    : 'bg-white text-slate-900 hover:bg-slate-100'

  return `grid h-10 w-10 place-items-center rounded-full text-sm font-bold shadow-sm transition ${stateClassName}`
}

export function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
      aria-label="Paginação de produtos"
    >
      <button
        type="button"
        className={arrowButtonClassName}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ArrowIcon direction="left" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={getPageButtonClassName(page === currentPage)}
          onClick={() => onPageChange(page)}
          aria-label={`Página ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className={arrowButtonClassName}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
      >
        <ArrowIcon direction="right" />
      </button>
    </nav>
  )
}
