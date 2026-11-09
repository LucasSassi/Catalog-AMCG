import { useId, useRef, useState } from 'react'
import { useDialogBehavior } from '../hooks/useDialogBehavior'
import {
  buildRejectionMessage,
  type RejectionReason,
} from '../lib/rejection'
import { CloseIcon } from './Modal'

interface RejectionDialogProps {
  itemName: string
  description: string
  reasons: ReadonlyArray<RejectionReason>
  confirmLabel: string
  disabled?: boolean
  onCancel: () => void
  onConfirm: (motivo: string) => void | Promise<void>
}

/**
 * Confirmação de rejeição: motivos prontos (multi-seleção), observação livre
 * e prévia do texto que o produtor verá. Cancelar recebe o foco inicial.
 */
export function RejectionDialog({
  itemName,
  description,
  reasons,
  confirmLabel,
  disabled = false,
  onCancel,
  onConfirm,
}: RejectionDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const noteId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState('')

  useDialogBehavior(dialogRef, onCancel, cancelRef)

  const chosen = reasons.filter((reason) => selected.includes(reason.id))
  const message = buildRejectionMessage(chosen, note)
  const canConfirm = message.length > 0 && !disabled

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(8,28,18,0.5)] p-3 motion-safe:animate-fade-in"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl outline-none"
      >
        <div className="flex items-start gap-3.5 px-6 pt-6">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger"
          >
            <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2 21h20z" />
              <path d="M12 10v4M12 17.5v.5" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-xl font-extrabold text-foreground">
              Rejeitar {itemName}?
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-text-muted">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border-soft text-foreground transition hover:bg-background"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <fieldset>
            <legend className="mb-2.5 text-sm font-bold text-foreground">
              Motivos{' '}
              <span className="font-medium text-text-muted">
                (escolha um ou mais)
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {reasons.map((reason) => {
                const on = selected.includes(reason.id)

                return (
                  <button
                    key={reason.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(reason.id)}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition ${
                      on
                        ? 'border-danger bg-danger-soft text-danger'
                        : 'border-slate-300 bg-white text-text hover:border-danger-border'
                    }`}
                  >
                    {on ? <span aria-hidden="true">✓</span> : null}
                    {reason.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={noteId} className="text-sm font-bold text-foreground">
              Observação para o produtor{' '}
              <span className="font-medium text-text-muted">
                {chosen.length > 0 ? '(opcional)' : '(ou escreva o motivo)'}
              </span>
            </label>
            <textarea
              id={noteId}
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex.: envie uma foto do rótulo com o número do registro visível."
              className="resize-y rounded-[10px] border border-slate-300 px-3 py-2.5 text-sm text-text focus:border-primary"
            />
          </div>

          <div className="rounded-xl border border-border-soft bg-background px-3.5 py-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.06em] text-text-muted">
              O produtor verá
            </p>
            <p className="whitespace-pre-line text-sm text-text">
              {message || 'Escolha ao menos um motivo para ver a mensagem.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2.5 border-t border-border-soft bg-background px-6 py-3.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-[10px] border-2 border-primary bg-white px-4 text-sm font-bold text-foreground transition hover:bg-secondary-background"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => void onConfirm(message)}
            className="min-h-11 rounded-[10px] bg-[#b42318] px-[18px] text-sm font-bold text-white transition hover:bg-danger disabled:cursor-not-allowed disabled:bg-[#e7ebe8] disabled:text-text-muted"
          >
            {message ? confirmLabel : 'Escolha um motivo'}
          </button>
        </div>
      </section>
    </div>
  )
}
