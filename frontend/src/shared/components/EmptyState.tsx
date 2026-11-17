import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  tone?: 'neutral' | 'success'
}

export function EmptyState({
  title,
  description,
  action,
  tone = 'neutral',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className={`grid h-14 w-14 place-items-center rounded-full ${
          tone === 'success'
            ? 'bg-approved-soft text-primary-darker'
            : 'bg-background text-text-muted'
        }`}
      >
        {tone === 'success' ? (
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        )}
      </span>
      <p className="text-lg font-extrabold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-text-muted">{description}</p>
      ) : null}
      {action}
    </div>
  )
}
