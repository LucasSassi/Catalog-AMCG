import type { ReactNode } from 'react'

interface BackofficePageHeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function BackofficePageHeader({
  title,
  description,
  actions,
}: BackofficePageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-primary-darker">Curadoria</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">{description}</p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </header>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger-border bg-danger-soft p-3 text-sm text-danger"
    >
      {message}
    </p>
  )
}

export function PlusIcon() {
  return (
    <svg
      className="mr-2 h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
