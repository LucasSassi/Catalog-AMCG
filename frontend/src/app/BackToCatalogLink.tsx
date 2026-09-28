import { Link } from 'react-router-dom'

const BACK_LABEL = 'Voltar para o catálogo'

interface BackToCatalogLinkProps {
  onClick?: () => void
}

export function BackToCatalogLink({ onClick }: BackToCatalogLinkProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={BACK_LABEL}
      title={BACK_LABEL}
      className="inline-grid h-11 w-11 place-items-center rounded-full bg-transparent text-accent-400 transition hover:bg-brand-700 hover:text-accent-300"
    >
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
      </svg>
    </Link>
  )
}
