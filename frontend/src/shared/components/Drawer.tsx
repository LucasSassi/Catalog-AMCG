import { useEffect, type ReactNode } from 'react'

interface DrawerProps {
  title: string
  children: ReactNode
  onClose: () => void
}

export function Drawer({ title, children, onClose }: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-950/55"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose()
          }
        }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl sm:w-[28rem]"
      >
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <h2 id="drawer-title" className="text-xl font-bold text-brand-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Fechar painel"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </section>
    </div>
  )
}
