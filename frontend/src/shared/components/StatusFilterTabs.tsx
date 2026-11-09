import type {
  ReviewStatusCounts,
  ReviewStatusFilter,
} from '../lib/review-status'

interface StatusFilterTabsProps {
  value: ReviewStatusFilter
  counts: ReviewStatusCounts
  onChange: (status: ReviewStatusFilter) => void
  order?: ReviewStatusFilter[]
}

const LABELS: Record<ReviewStatusFilter, string> = {
  PENDENTE: 'Pendentes',
  APROVADO: 'Aprovados',
  REJEITADO: 'Rejeitados',
  TODOS: 'Todos',
}

const DEFAULT_ORDER: ReviewStatusFilter[] = [
  'PENDENTE',
  'APROVADO',
  'REJEITADO',
  'TODOS',
]

export function StatusFilterTabs({
  value,
  counts,
  onChange,
  order = DEFAULT_ORDER,
}: StatusFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="flex flex-wrap gap-2"
    >
      {order.map((status) => {
        const active = status === value

        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(status)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
              active
                ? 'border-foreground bg-foreground text-white'
                : 'border-slate-300 bg-white text-text hover:border-primary hover:text-primary-dark'
            }`}
          >
            {LABELS[status]}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                active ? 'bg-white/20' : 'bg-slate-100'
              }`}
            >
              {counts[status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
