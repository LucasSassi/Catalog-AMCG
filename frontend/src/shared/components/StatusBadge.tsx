import type { ReviewItemStatus } from '../lib/review-status'

interface StatusBadgeProps {
  status: ReviewItemStatus
  hidden?: boolean
  className?: string
}

const STATUS_STYLES: Record<ReviewItemStatus, { label: string; classes: string }> =
  {
    ALTERADO: { label: 'Após modificação', classes: 'bg-blue-100 text-blue-900' },
    PENDENTE: { label: 'Pendente', classes: 'bg-pending-soft text-pending' },
    APROVADO: {
      label: 'Aprovado',
      classes: 'bg-approved-soft text-primary-darker',
    },
    REJEITADO: { label: 'Rejeitado', classes: 'bg-danger-soft text-danger' },
  }

export function StatusBadge({
  status,
  hidden = false,
  className = '',
}: StatusBadgeProps) {
  let label = STATUS_STYLES[status].label
  let classes = STATUS_STYLES[status].classes

  if (hidden) {
    label = 'Oculto'
    classes = 'bg-slate-200 text-slate-700'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${classes} ${className}`}
    >
      {label}
    </span>
  )
}
