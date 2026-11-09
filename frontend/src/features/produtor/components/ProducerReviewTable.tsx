import { AlertChips } from '../../../shared/components/ReviewChecklist'
import { Skeleton } from '../../../shared/components/Skeleton'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  formatWaitingDays,
  getWaitingDays,
  WAITING_DAYS_WARNING,
  type ReviewAlert,
} from '../../../shared/lib/review-status'
import type { Producer } from '../types'
import { ProducerAvatar } from './ProducerAvatar'

export interface ProducerProductCount {
  aprovados: number
  total: number
}

interface ProducerReviewTableProps {
  producers: Producer[]
  productCounts: Map<string, ProducerProductCount>
  alertsById: Map<string, ReviewAlert[]>
  selectedIds: ReadonlySet<string>
  focusedId: string | null
  reviewingId: string | null
  disabled: boolean
  onToggleSelected: (producer: Producer) => void
  onToggleAllSelected: (checked: boolean) => void
  onOpenDetails: (producer: Producer) => void
  onReview: (producer: Producer) => void
  onApprove: (producer: Producer) => void
  onReject: (producer: Producer) => void
}

const GRID_COLUMNS =
  'md:grid md:grid-cols-[2.5rem_minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_6rem] md:items-center md:gap-3'

export function ProducerReviewTable({
  producers,
  productCounts,
  alertsById,
  selectedIds,
  focusedId,
  reviewingId,
  disabled,
  onToggleSelected,
  onToggleAllSelected,
  onOpenDetails,
  onReview,
  onApprove,
  onReject,
}: ProducerReviewTableProps) {
  const pending = producers.filter((producer) => producer.status === 'PENDENTE')
  const allSelected =
    pending.length > 0 && pending.every((producer) => selectedIds.has(producer.id))

  return (
    <section aria-label="Lista de produtores">
      <ul className="flex flex-col gap-3 md:hidden">
        {producers.map((producer) => (
          <MobileProducerCard
            key={producer.id}
            producer={producer}
            alerts={alertsById.get(producer.id) ?? []}
            disabled={disabled}
            onOpenDetails={onOpenDetails}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </ul>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white max-md:hidden">
        <div
          className={`border-b border-border-soft bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-[0.06em] text-text-muted ${GRID_COLUMNS}`}
        >
          <span className="grid place-items-center">
            <input
              type="checkbox"
              aria-label="Selecionar todos os pendentes visíveis"
              checked={allSelected}
              disabled={pending.length === 0}
              onChange={(event) => onToggleAllSelected(event.target.checked)}
              className="h-[18px] w-[18px] accent-primary disabled:opacity-40"
            />
          </span>
          <span>Produtor</span>
          <span>Cidade</span>
          <span>Na fila</span>
          <span>Status</span>
          <span className="sr-only">Ações</span>
        </div>

        <ul>
          {producers.map((producer) => {
            const counts = productCounts.get(producer.id) ?? {
              aprovados: 0,
              total: 0,
            }
            const alerts = alertsById.get(producer.id) ?? []
            const isPending = producer.status === 'PENDENTE'
            const waiting = getWaitingDays(producer.createdAt)
            const isFocused = producer.id === focusedId
            const isReviewing = producer.id === reviewingId
            const isSelected = selectedIds.has(producer.id)

            return (
              <li
                key={producer.id}
                data-producer-row={producer.id}
                aria-current={isReviewing ? 'true' : undefined}
                className={`relative border-b border-slate-100 px-4 py-3 last:border-b-0 md:min-h-[68px] ${GRID_COLUMNS} ${
                  isReviewing || isSelected
                    ? 'bg-secondary-background'
                    : 'bg-white hover:bg-background'
                } ${isFocused ? 'shadow-[inset_4px_0_0_var(--color-primary)]' : ''}`}
              >
                <span className="grid place-items-center">
                  {isPending ? (
                    <input
                      type="checkbox"
                      aria-label={`Selecionar ${producer.nomeEmpresa}`}
                      checked={isSelected}
                      onChange={() => onToggleSelected(producer)}
                      className="h-[18px] w-[18px] accent-primary"
                    />
                  ) : null}
                </span>
                <div className="flex min-w-0 items-center gap-3">
                  <ProducerAvatar producer={producer} />
                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => onOpenDetails(producer)}
                      className="max-w-full truncate text-left text-sm font-bold text-foreground underline-offset-4 hover:underline"
                    >
                      {producer.nomeEmpresa}
                    </button>
                    <span className="text-xs text-text-muted">
                      {producer.documento.tipo} · {counts.aprovados} de{' '}
                      {counts.total} produtos aprovados
                    </span>
                    <AlertChips alerts={alerts} />
                  </div>
                </div>
                <span className="text-sm text-slate-700">
                  {producer.endereco.cidade}
                </span>
                <span
                  className={`text-sm ${
                    isPending && waiting > WAITING_DAYS_WARNING
                      ? 'font-bold text-[#8a4b00]'
                      : 'text-text-muted'
                  }`}
                >
                  {isPending ? formatWaitingDays(waiting) : '—'}
                </span>
                <span>
                  <StatusBadge status={producer.status} />
                </span>
                <button
                  type="button"
                  onClick={() => onReview(producer)}
                  aria-label={`Revisão rápida de ${producer.nomeEmpresa}`}
                  aria-pressed={isReviewing}
                  className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                    isReviewing
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-300 bg-white text-foreground hover:border-primary hover:text-primary-dark'
                  }`}
                >
                  Revisar
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function MobileProducerCard({
  producer,
  alerts,
  disabled,
  onOpenDetails,
  onApprove,
  onReject,
}: {
  producer: Producer
  alerts: ReviewAlert[]
  disabled: boolean
  onOpenDetails: (producer: Producer) => void
  onApprove: (producer: Producer) => void
  onReject: (producer: Producer) => void
}) {
  const isPending = producer.status === 'PENDENTE'
  const waiting = getWaitingDays(producer.createdAt)

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-3.5">
      <button
        type="button"
        onClick={() => onOpenDetails(producer)}
        aria-haspopup="dialog"
        className="flex items-center gap-3 text-left"
      >
        <ProducerAvatar producer={producer} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-foreground">
            {producer.nomeEmpresa}
          </span>
          <span className="block text-xs text-text-muted">
            {producer.endereco.cidade} · {producer.documento.tipo}
            {isPending ? ` · ${formatWaitingDays(waiting)}` : ''}
          </span>
        </span>
        {isPending ? null : <StatusBadge status={producer.status} />}
        <svg className="h-[18px] w-[18px] shrink-0 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <AlertChips alerts={alerts} />
      {isPending ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApprove(producer)}
            className="min-h-[46px] flex-1 rounded-xl bg-primary text-[15px] font-bold text-white transition hover:bg-primary-darker disabled:opacity-60"
          >
            Aprovar
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onReject(producer)}
            className="min-h-[46px] flex-1 rounded-xl border border-danger-border bg-white text-[15px] font-bold text-danger transition hover:bg-danger-soft disabled:opacity-60"
          >
            Rejeitar
          </button>
        </div>
      ) : null}
    </li>
  )
}

export function ProducerTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando produtores"
      className="overflow-hidden rounded-2xl border border-border-soft bg-white"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full max-md:hidden" />
          <Skeleton className="h-10 w-20 rounded-lg max-md:hidden" />
        </div>
      ))}
    </div>
  )
}
