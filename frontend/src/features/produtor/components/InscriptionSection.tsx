import type { ReactNode } from 'react'

interface InscriptionSectionProps {
  id?: string
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function InscriptionSection({
  id,
  title,
  open,
  onToggle,
  children,
}: InscriptionSectionProps) {
  return (
    <section
      data-section={id}
      className="scroll-mt-24 rounded-2xl border border-slate-300 bg-white shadow-sm"
    >
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

      {/* Fica montado mesmo fechado para a validação encontrar os campos. */}
      <div
        hidden={!open}
        data-section-content=""
        className="border-t border-slate-200 px-5 pb-5 pt-4"
      >
        {children}
      </div>
    </section>
  )
}
