import { Kbd } from '../../../shared/components/Kbd'
import { MAX_PRODUCER_DESTAQUES } from '../constants'
import type { Producer } from '../types'

export interface ProducerDecisionHandlers {
  onApprove: () => void
  onReject: () => void
  onToggleDestaque: () => void
}

interface ProducerDecisionActionsProps extends ProducerDecisionHandlers {
  producer: Producer
  disabled: boolean
  destaqueCount: number
  approveLabel?: string
  showShortcuts?: boolean
}

export function ProducerDecisionActions({
  producer,
  disabled,
  destaqueCount,
  approveLabel = 'Aprovar',
  showShortcuts = false,
  onApprove,
  onReject,
  onToggleDestaque,
}: ProducerDecisionActionsProps) {
  if ((producer.status === 'PENDENTE' || producer.status === 'ALTERADO')) {
    return (
      <>
        <button
          type="button"
          disabled={disabled}
          onClick={onReject}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-danger-border bg-white px-4 text-sm font-bold text-danger transition hover:bg-danger-soft disabled:opacity-60"
        >
          Rejeitar
          {showShortcuts ? <Kbd>R</Kbd> : null}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onApprove}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-darker disabled:opacity-60 sm:flex-none"
        >
          {approveLabel}
          {showShortcuts ? (
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-xs">A</span>
          ) : null}
        </button>
      </>
    )
  }

  if (producer.status === 'REJEITADO') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onApprove}
        className="inline-flex min-h-11 items-center rounded-[10px] bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-darker disabled:opacity-60"
      >
        Reconsiderar e aprovar
      </button>
    )
  }

  const limitReached =
    !producer.destaque && destaqueCount >= MAX_PRODUCER_DESTAQUES

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        aria-pressed={producer.destaque}
        disabled={disabled || limitReached}
        title={limitReached ? 'Limite de destaques atingido' : undefined}
        onClick={onToggleDestaque}
        className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          producer.destaque
            ? 'border-warning bg-pending-soft text-pending'
            : 'border-primary bg-white text-primary-darker hover:bg-secondary-background'
        }`}
      >
        <span aria-hidden="true">★</span>
        {producer.destaque ? 'Remover destaque' : 'Destacar'}
      </button>
      <span className="text-xs text-text-muted">
        {destaqueCount} de {MAX_PRODUCER_DESTAQUES} destaques em uso
      </span>
    </div>
  )
}
