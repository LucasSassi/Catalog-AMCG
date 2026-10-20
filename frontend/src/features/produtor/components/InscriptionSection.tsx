import type { ReactNode } from 'react'

interface InscriptionSectionProps {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function InscriptionSection({
  title,
  open,
  onToggle,
  children,
}: InscriptionSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <h2 className="text-base font-bold text-slate-800 sm:text-lg">
          {title}
        </h2>
        <span
          className={`text-xl text-accent-yellow transition ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-200 px-5 pb-5 pt-4">{children}</div>
      ) : null}
    </section>
  )
}
