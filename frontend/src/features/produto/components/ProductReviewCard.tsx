import { Skeleton } from '../../../shared/components/Skeleton'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import {
  formatWaitingDays,
  getWaitingDays,
  WAITING_DAYS_WARNING,
} from '../../../shared/lib/review-status'
import { PRODUCT_CATEGORY_LABELS } from '../constants'
import type { Product } from '../types'

interface ProductReviewCardProps {
  product: Product
  producerLabel: string
  isUpdating: boolean
  destaqueLimitReached: boolean
  selected: boolean
  onToggleSelected: (product: Product) => void
  onSelect: (product: Product) => void
  onToggleAtivo: (product: Product) => void
  onToggleDestaque: (product: Product) => void
}

export function ProductReviewCard({
  product,
  producerLabel,
  isUpdating,
  destaqueLimitReached,
  selected,
  onToggleSelected,
  onSelect,
  onToggleAtivo,
  onToggleDestaque,
}: ProductReviewCardProps) {
  const image = product.fotosDivulgacao[0]
  const isApproved = product.status === 'APROVADO'
  const isPending = (product.status === 'PENDENTE' || product.status === 'ALTERADO')
  const isHidden = isApproved && !product.ativo
  const waiting = getWaitingDays(product.createdAt)
  const canToggleDestaque =
    isApproved &&
    product.ativo &&
    !isUpdating &&
    (product.destaque || !destaqueLimitReached)

  let destaqueHint = product.destaque ? 'Remover destaque' : 'Destacar'

  if (!product.ativo) {
    destaqueHint = 'Mostre o produto na vitrine para destacá-lo'
  } else if (!product.destaque && destaqueLimitReached) {
    destaqueHint = 'Limite de destaques atingido'
  }

  return (
    <article
      onClick={() => onSelect(product)}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition hover:border-primary hover:shadow-md ${
        selected
          ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
          : 'border-border-soft'
      } ${isHidden ? 'opacity-80' : ''}`}
    >
      <div className="relative h-40 bg-background">
        {image ? (
          <img
            src={buildThumbnailUrl(image.url, THUMBNAIL_WIDTH.card)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full place-items-center text-xs text-text-muted">
            Sem foto de divulgação
          </span>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {isApproved ? (
            <label
              onClick={(event) => event.stopPropagation()}
              className={`grid h-8 w-8 place-items-center rounded-lg bg-white/95 shadow-sm transition ${
                selected ? '' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100'
              }`}
            >
              <span className="sr-only">Selecionar {product.nome}</span>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelected(product)}
                className="h-[18px] w-[18px] accent-primary"
              />
            </label>
          ) : null}
          <StatusBadge status={product.status} hidden={isHidden} />
        </div>
        {isApproved ? (
          <button
            type="button"
            disabled={!canToggleDestaque}
            aria-pressed={product.destaque}
            aria-label={`${destaqueHint}: ${product.nome}`}
            title={destaqueHint}
            onClick={(event) => {
              event.stopPropagation()
              onToggleDestaque(product)
            }}
            className={`absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-white/95 transition disabled:cursor-not-allowed disabled:opacity-60 ${
              product.destaque ? 'text-[#8a6400]' : 'text-text-muted'
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={product.destaque ? '#f7c948' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5z" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-darker">
          {PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria}
        </p>
        <h3 className="text-base font-bold text-foreground">{product.nome}</h3>
        <p className="text-sm text-text-muted">{producerLabel}</p>
        <p className="mt-1 text-lg font-extrabold text-foreground">
          {formatCurrency(product.valorCentavos)}{' '}
          <span className="text-sm font-medium text-text-muted">
            / {product.unidadeMedida}
          </span>
        </p>
        {product.motivoRejeicao ? (
          <p className="mt-1 line-clamp-2 whitespace-pre-line rounded-lg bg-danger-soft p-2 text-xs text-danger">
            <strong>Motivo:</strong> {product.motivoRejeicao}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5">
        {isApproved ? (
          <button
            type="button"
            role="switch"
            aria-checked={product.ativo}
            aria-label={`Mostrar ${product.nome} na vitrine`}
            disabled={isUpdating}
            onClick={(event) => {
              event.stopPropagation()
              onToggleAtivo(product)
            }}
            className="flex min-h-11 items-center gap-2.5 text-sm font-semibold text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={`relative inline-block h-6 w-10 rounded-full transition ${
                product.ativo ? 'bg-primary' : 'bg-slate-400'
              }`}
              aria-hidden="true"
            >
              <span
                className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
                  product.ativo ? 'left-[19px]' : 'left-[3px]'
                }`}
              />
            </span>
            {product.ativo ? 'Na vitrine' : 'Oculto'}
          </button>
        ) : (
          <span
            className={`text-sm font-semibold ${
              isPending
                ? waiting > WAITING_DAYS_WARNING
                  ? 'text-[#8a4b00]'
                  : 'text-pending'
                : 'text-danger'
            }`}
          >
            {isPending
              ? `Aguardando ${formatWaitingDays(waiting)}`
              : 'Rejeitado'}
          </span>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect(product)
          }}
          className={`min-h-11 rounded-lg border px-3.5 text-sm font-semibold transition ${
            isPending
              ? 'border-primary bg-primary text-white hover:bg-primary-darker'
              : 'border-slate-300 bg-white text-foreground hover:border-primary hover:text-primary-dark'
          }`}
        >
          {isPending ? 'Revisar' : 'Detalhes'}
        </button>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white">
      <Skeleton className="h-40 rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-5 w-1/3" />
      </div>
      <div className="border-t border-slate-100 px-4 py-3">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}
