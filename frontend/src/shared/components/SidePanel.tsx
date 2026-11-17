import { useRef, type ReactNode } from 'react'
import { useDialogBehavior } from '../hooks/useDialogBehavior'
import { CloseIcon } from './Modal'

interface SidePanelProps {
  label: string
  onClose: () => void
  children: ReactNode
  toolbar?: ReactNode
  header?: ReactNode
  tabs?: ReactNode
  footer?: ReactNode
  width?: 'default' | 'wide'
}

const WIDTH_CLASS = {
  default: 'sm:max-w-[760px]',
  wide: 'sm:max-w-[820px]',
} as const

/**
 * Painel lateral modal (direita) com cabeçalho, abas, conteúdo rolável e
 * rodapé fixo para ações. Mantém o contexto da lista visível ao fundo.
 */
export function SidePanel({
  label,
  onClose,
  children,
  toolbar,
  header,
  tabs,
  footer,
  width = 'default',
}: SidePanelProps) {
  const panelRef = useRef<HTMLElement>(null)

  useDialogBehavior(panelRef, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[rgba(8,28,18,0.45)] motion-safe:animate-fade-in"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`flex h-full w-full flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.18)] outline-none motion-safe:animate-slide-in-right ${WIDTH_CLASS[width]}`}
      >
        <div className="flex min-h-14 items-center gap-2 border-b border-border-soft px-4 py-2 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">{toolbar}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border-soft text-foreground transition hover:bg-background"
          >
            <CloseIcon />
          </button>
        </div>

        {header ? (
          <div className="border-b border-border-soft px-4 pt-5 sm:px-6">
            {header}
            {tabs ? <div className="mt-4">{tabs}</div> : <div className="pb-5" />}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <footer className="flex flex-wrap items-center gap-2.5 border-t border-border-soft bg-background px-4 py-3 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}

interface PanelTabsProps<T extends string> {
  tabs: ReadonlyArray<{ id: T; label: string; count?: number }>
  value: T
  onChange: (tab: T) => void
  label: string
}

export function PanelTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: PanelTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mb-px flex gap-1 overflow-x-auto"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
          return
        }

        const index = tabs.findIndex((tab) => tab.id === value)
        const step = event.key === 'ArrowRight' ? 1 : -1
        const next = tabs[(index + step + tabs.length) % tabs.length]
        onChange(next.id)
        const button = event.currentTarget.querySelector<HTMLButtonElement>(
          `[data-tab="${next.id}"]`,
        )
        button?.focus()
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === value

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab={tab.id}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-11 shrink-0 items-center gap-1.5 border-b-[3px] px-3 text-sm transition ${
              active
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent font-semibold text-text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={`rounded-full px-1.5 text-xs font-bold ${
                  active ? 'bg-approved-soft text-primary-darker' : 'bg-slate-100'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

interface PanelPagerProps {
  position: number
  total: number
  onPrevious?: () => void
  onNext?: () => void
}

export function PanelPager({
  position,
  total,
  onPrevious,
  onNext,
}: PanelPagerProps) {
  if (total <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!onPrevious}
        aria-label="Anterior"
        className="grid h-10 w-10 place-items-center rounded-lg border border-border-soft text-foreground transition hover:bg-background disabled:opacity-40"
      >
        <ChevronIcon direction="left" />
      </button>
      <span className="min-w-14 text-center text-sm font-semibold text-text-muted">
        {position} de {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        aria-label="Próximo"
        className="grid h-10 w-10 place-items-center rounded-lg border border-border-soft text-foreground transition hover:bg-background disabled:opacity-40"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  )
}

export function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}
