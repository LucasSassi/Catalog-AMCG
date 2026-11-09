import type { ReviewAlert, ReviewChecklistItem } from '../lib/review-status'

export function ReviewChecklist({
  items,
  title = 'Conferência',
}: {
  items: ReviewChecklistItem[]
  title?: string
}) {
  const done = items.filter((item) => item.ok).length

  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <span className="text-xs font-semibold text-text-muted">
          {done} de {items.length} ok
        </span>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                item.ok
                  ? 'bg-approved-soft text-primary-darker'
                  : 'bg-pending-soft text-pending'
              }`}
            >
              {item.ok ? '✓' : '!'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-text">{item.label}</span>
              <span className="sr-only">{item.ok ? ': ok' : ': pendente'}</span>
              {item.detail ? (
                <span className="text-text-muted"> · {item.detail}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AlertChips({ alerts }: { alerts: ReviewAlert[] }) {
  if (alerts.length === 0) {
    return null
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Alertas">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
            alert.tone === 'danger'
              ? 'bg-danger-soft text-danger'
              : 'bg-[#fff4e5] text-[#8a4b00]'
          }`}
        >
          {alert.label}
        </li>
      ))}
    </ul>
  )
}
