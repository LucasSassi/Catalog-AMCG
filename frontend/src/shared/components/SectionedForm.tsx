import { useId, useState, type FormEvent, type ReactNode } from 'react'

export type SectionStatus = 'ok' | 'incompleto' | 'aviso'

export interface FormSection {
  id: string
  label: string
  description?: string
  status: SectionStatus
  content: ReactNode
}

interface SectionedFormProps {
  sections: FormSection[]
  isDirty: boolean
  isSubmitting: boolean
  submitLabel: string
  submittingLabel: string
  error?: string
  intro?: ReactNode
  onSubmit: () => void
  onCancel?: () => void
}

/**
 * Formulário longo dividido em seções: navegação lateral com o estado de cada
 * seção, validação nativa (marca as seções com erro depois da primeira
 * tentativa) e rodapé fixo com o aviso de alterações não salvas.
 */
export function SectionedForm({
  sections,
  isDirty,
  isSubmitting,
  submitLabel,
  submittingLabel,
  error,
  intro,
  onSubmit,
  onCancel,
}: SectionedFormProps) {
  const prefix = useId()
  const [triedSubmit, setTriedSubmit] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const pending = sections.filter((section) => section.status === 'incompleto')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTriedSubmit(true)

    if (pending.length > 0) {
      document
        .getElementById(`${prefix}-${pending[0].id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    onSubmit()
  }

  function goTo(id: string) {
    const section = document.getElementById(`${prefix}-${id}`)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    section?.querySelector<HTMLElement>('input, select, textarea')?.focus({
      preventScroll: true,
    })
  }

  function handleCancel() {
    if (!onCancel) {
      return
    }

    if (isDirty && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }

    onCancel()
  }

  return (
    <form
      noValidate={false}
      onSubmit={handleSubmit}
      onInvalidCapture={() => setTriedSubmit(true)}
      className="flex min-h-full flex-col"
    >
      <div className="flex flex-1 flex-col md:grid md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav
          aria-label="Seções do formulário"
          className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-border-soft bg-white px-4 py-2 md:h-fit md:flex-col md:overflow-visible md:border-b-0 md:border-r md:px-3 md:py-5"
        >
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => goTo(section.id)}
              className="flex min-h-10 shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-semibold text-text transition hover:bg-background"
            >
              <SectionMark
                status={section.status}
                index={index + 1}
                showErrors={triedSubmit}
              />
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-8 px-4 py-5 sm:px-6">
          {intro}
          {sections.map((section) => (
            <section
              key={section.id}
              id={`${prefix}-${section.id}`}
              aria-labelledby={`${prefix}-${section.id}-title`}
              className="scroll-mt-16 md:scroll-mt-4"
            >
              <h3
                id={`${prefix}-${section.id}-title`}
                className="text-base font-extrabold text-foreground"
              >
                {section.label}
              </h3>
              {section.description ? (
                <p className="mt-0.5 text-sm text-text-muted">
                  {section.description}
                </p>
              ) : null}
              {triedSubmit && section.status === 'incompleto' ? (
                <p className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
                  Preencha os campos obrigatórios desta seção.
                </p>
              ) : null}
              <div className="mt-4 flex flex-col gap-4">{section.content}</div>
            </section>
          ))}

          {error ? (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2.5 border-t border-border-soft bg-background px-4 py-3 sm:px-6">
        <span
          className={`flex items-center gap-2 text-sm font-semibold ${
            isDirty ? 'text-pending' : 'text-text-muted'
          }`}
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${isDirty ? 'bg-warning' : 'bg-muted'}`}
          />
          {isDirty ? 'Alterações não salvas' : 'Nenhuma alteração'}
        </span>
        <span className="flex-1" />
        {onCancel ? (
          <button
            type="button"
            onClick={handleCancel}
            onBlur={() => setConfirmDiscard(false)}
            className={`min-h-11 rounded-[10px] px-4 text-sm font-bold transition ${
              confirmDiscard
                ? 'bg-danger-soft text-danger'
                : 'text-foreground hover:bg-white'
            }`}
          >
            {confirmDiscard ? 'Descartar alterações?' : isDirty ? 'Descartar' : 'Cancelar'}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-[10px] bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-darker disabled:opacity-60"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

function SectionMark({
  status,
  index,
  showErrors,
}: {
  status: SectionStatus
  index: number
  showErrors: boolean
}) {
  if (status === 'ok') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-approved-soft text-xs font-bold text-primary-darker">
        ✓<span className="sr-only">, completa</span>
      </span>
    )
  }

  if (status === 'aviso') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pending-soft text-xs font-bold text-pending">
        !<span className="sr-only">, revisar</span>
      </span>
    )
  }

  if (showErrors) {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger-soft text-xs font-bold text-danger">
        ×<span className="sr-only">, campos obrigatórios faltando</span>
      </span>
    )
  }

  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-text-muted">
      {index}
    </span>
  )
}

export const formInputClassName =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-text focus:border-primary aria-[invalid=true]:border-[#b42318]'

export function FormField({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  )
}
