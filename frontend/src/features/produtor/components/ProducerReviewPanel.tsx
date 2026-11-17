import { Kbd } from '../../../shared/components/Kbd'
import {
  AlertChips,
  ReviewChecklist,
} from '../../../shared/components/ReviewChecklist'
import { ChevronIcon } from '../../../shared/components/SidePanel'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import {
  formatWaitingDays,
  getWaitingDays,
  type ReviewAlert,
  type ReviewChecklistItem,
} from '../../../shared/lib/review-status'
import type { Producer } from '../types'
import { ProducerAvatar } from './ProducerAvatar'
import {
  ProducerDecisionActions,
  type ProducerDecisionHandlers,
} from './ProducerDecisionActions'

interface ProducerReviewPanelProps extends ProducerDecisionHandlers {
  producer: Producer
  alerts: ReviewAlert[]
  checklist: ReviewChecklistItem[]
  position: number
  total: number
  autoAdvance: boolean
  disabled: boolean
  destaqueCount: number
  onAutoAdvanceChange: (value: boolean) => void
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
  onOpenDetails: () => void
  onEdit: () => void
}

/** Revisão rápida ao lado da lista: confere, decide e segue para o próximo. */
export function ProducerReviewPanel({
  producer,
  alerts,
  checklist,
  position,
  total,
  autoAdvance,
  disabled,
  destaqueCount,
  onAutoAdvanceChange,
  onPrevious,
  onNext,
  onClose,
  onOpenDetails,
  onEdit,
  ...handlers
}: ProducerReviewPanelProps) {
  const fotos = producer.fotos ?? []
  const isPending = (producer.status === 'PENDENTE' || producer.status === 'ALTERADO')

  return (
    <section
      aria-label={`Revisão rápida de ${producer.nomeEmpresa}`}
      className="overflow-hidden rounded-2xl border border-border-soft bg-white lg:sticky lg:top-6"
    >
      <div className="flex items-center gap-1 border-b border-slate-100 px-3 py-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!onPrevious}
          aria-label="Produtor anterior"
          className="grid h-10 w-10 place-items-center rounded-lg text-foreground transition hover:bg-background disabled:opacity-40"
        >
          <ChevronIcon direction="left" />
        </button>
        <span className="text-sm font-semibold text-text-muted">
          {position} de {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!onNext}
          aria-label="Próximo produtor"
          className="grid h-10 w-10 place-items-center rounded-lg text-foreground transition hover:bg-background disabled:opacity-40"
        >
          <ChevronIcon direction="right" />
        </button>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar revisão rápida"
          className="grid h-10 w-10 place-items-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          ×
        </button>
      </div>

      <div className="flex items-start gap-3.5 p-5 pb-4">
        <ProducerAvatar producer={producer} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={producer.status} />
            {isPending ? (
              <span className="text-xs font-semibold text-text-muted">
                na fila {formatWaitingDays(getWaitingDays(producer.createdAt))}
              </span>
            ) : null}
          </div>
          <h2 className="mt-1.5 text-lg font-extrabold leading-tight text-foreground">
            {producer.nomeEmpresa}
          </h2>
          <p className="text-sm text-text-muted">
            {producer.endereco.cidade}/{producer.endereco.estado} ·{' '}
            {producer.contato.telefone}
          </p>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="px-5 pb-4">
          <AlertChips alerts={alerts} />
        </div>
      ) : null}

      {fotos.length > 0 ? (
        <div className="grid grid-cols-4 gap-1.5 px-5 pb-4">
          {fotos.slice(0, 4).map((foto, index) => (
            <img
              key={`${foto.url}-${index}`}
              src={buildThumbnailUrl(foto.url, THUMBNAIL_WIDTH.gallery)}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-square w-full rounded-lg bg-background object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="border-t border-slate-100 px-5 py-4">
        <ReviewChecklist items={checklist} />
      </div>

      {producer.motivoRejeicao ? (
        <p className="mx-5 mb-4 whitespace-pre-line rounded-lg bg-danger-soft p-3 text-sm text-danger">
          <strong>Motivo da rejeição:</strong> {producer.motivoRejeicao}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-background px-5 py-3.5">
        <ProducerDecisionActions
          producer={producer}
          disabled={disabled}
          destaqueCount={destaqueCount}
          showShortcuts
          approveLabel={autoAdvance && onNext ? 'Aprovar e próximo' : 'Aprovar'}
          {...handlers}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
        <button
          type="button"
          onClick={onOpenDetails}
          className="min-h-10 font-semibold text-primary-darker hover:text-primary-dark"
        >
          Ver perfil completo
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="min-h-10 font-semibold text-primary-darker hover:text-primary-dark disabled:opacity-60"
        >
          Editar dados
        </button>
        {isPending ? (
          <label className="ml-auto flex min-h-10 items-center gap-2 text-text-muted">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(event) => onAutoAdvanceChange(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Avançar sozinho
          </label>
        ) : null}
      </div>

      <p className="hidden flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 px-5 py-2.5 text-xs text-text-muted lg:flex">
        <span>
          <Kbd>↑</Kbd> <Kbd>↓</Kbd> navegar
        </span>
        <span>
          <Kbd>A</Kbd> aprovar
        </span>
        <span>
          <Kbd>R</Kbd> rejeitar
        </span>
        <span>
          <Kbd>?</Kbd> atalhos
        </span>
      </p>
    </section>
  )
}
