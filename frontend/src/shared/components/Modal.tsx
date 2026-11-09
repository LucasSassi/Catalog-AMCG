import { useId, useRef, type ReactNode, type RefObject } from 'react'
import { useDialogBehavior } from '../hooks/useDialogBehavior'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  size?: 'small' | 'default' | 'wide'
  leading?: ReactNode
  subtitle?: ReactNode
  footer?: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  bodyClassName?: string
}

const SIZE_CLASS = {
  small: 'max-w-xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
} as const

export function Modal({
  title,
  children,
  onClose,
  size = 'default',
  leading,
  subtitle,
  footer,
  initialFocusRef,
  bodyClassName = 'p-5 sm:p-6',
}: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLElement>(null)

  useDialogBehavior(dialogRef, onClose, initialFocusRef)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,28,18,0.5)] p-3 motion-safe:animate-fade-in sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none ${SIZE_CLASS[size]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-soft bg-white px-5 py-4">
          {leading ? <div className="shrink-0">{leading}</div> : null}
          <div className="min-w-0 flex-1 self-center">
            <h2 id={titleId} className="text-xl font-extrabold text-foreground">
              {title}
            </h2>
            {subtitle ? <div className="mt-1">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border-soft text-foreground transition hover:bg-background"
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>
        <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
        {footer ? (
          <footer className="flex flex-wrap items-center gap-2.5 border-t border-border-soft bg-background px-5 py-3.5">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}

export function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
