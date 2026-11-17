import { useState, type ReactNode } from 'react'
import { Modal } from './Modal'

export interface FormModalRenderProps {
  onSuccess: () => void
  onCancel: () => void
  onDirtyChange: (dirty: boolean) => void
}

interface FormModalProps {
  title: string
  subtitle?: ReactNode
  successTitle: string
  successMessage: string
  onClose: () => void
  onSuccess: () => void
  children: (props: FormModalRenderProps) => ReactNode
}

/**
 * Modal para formulários longos: confirma antes de fechar com alterações não
 * salvas (Esc, fundo ou X) e mostra uma confirmação clara após salvar.
 */
export function FormModal({
  title,
  subtitle,
  successTitle,
  successMessage,
  onClose,
  onSuccess,
  children,
}: FormModalProps) {
  const [didSucceed, setDidSucceed] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  function guardedClose() {
    if (
      !didSucceed &&
      isDirty &&
      !window.confirm('Descartar as alterações não salvas?')
    ) {
      return
    }

    onClose()
  }

  function handleSuccess() {
    setIsDirty(false)
    setDidSucceed(true)
    onSuccess()
  }

  return (
    <Modal
      title={title}
      subtitle={
        subtitle ? (
          <div className="text-sm text-text-muted">{subtitle}</div>
        ) : undefined
      }
      size="wide"
      onClose={guardedClose}
      bodyClassName={didSucceed ? 'p-5 sm:p-6' : 'p-0'}
    >
      {didSucceed ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span
            aria-hidden="true"
            className="grid h-16 w-16 place-items-center rounded-full bg-approved-soft text-primary-darker"
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="text-xl font-extrabold text-foreground">{successTitle}</p>
          <p className="max-w-md text-sm leading-6 text-text-muted">
            {successMessage}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 min-h-11 rounded-[10px] bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-darker"
          >
            Fechar
          </button>
        </div>
      ) : (
        children({
          onSuccess: handleSuccess,
          onCancel: guardedClose,
          onDirtyChange: setIsDirty,
        })
      )}
    </Modal>
  )
}
