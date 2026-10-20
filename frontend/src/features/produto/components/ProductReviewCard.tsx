import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { Product } from '../types'

interface ProductReviewCardProps {
  product: Product
  onSelect: (product: Product) => void
  onToggleAtivo?: (id: string, ativo: boolean) => Promise<boolean>
  isUpdating?: boolean
}

export function ProductReviewCard({
  product,
  onSelect,
  onToggleAtivo,
  isUpdating = false,
}: ProductReviewCardProps) {
  const image = product.fotosDivulgacao[0]
  const isApproved = product.status === 'APROVADO'
  let statusClasses = 'bg-amber-100 text-amber-800'
  let statusLabel = 'Pendente'

  if (product.status === 'REJEITADO') {
    statusClasses = 'bg-red-100 text-red-800'
    statusLabel = 'Rejeitado'
  }

  if (isApproved) {
    statusClasses = 'bg-green-100 text-green-800'
    statusLabel = 'Aprovado'
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-success hover:shadow-md"
    >
      <div className="flex gap-4">
        {image ? (
          <img
            src={buildThumbnailUrl(image.url, THUMBNAIL_WIDTH.avatar)}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="h-24 w-24 rounded-lg bg-slate-100 object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{product.nome}</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
            >
              {statusLabel}
            </span>
            {isApproved ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  product.ativo
                    ? 'bg-secondary-background text-primary-dark'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {product.ativo ? 'No catálogo' : 'Oculto'}
              </span>
            ) : null}
            {product.destaque ? (
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-primary-dark">
                Destaque
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">{product.descricao}</p>
          <dl className="mt-3 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Categoria</dt>
              <dd className="font-medium">{product.categoria}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Valor</dt>
              <dd className="font-medium">
                {formatCurrency(product.valorCentavos)} / {product.unidadeMedida}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Produtor</dt>
              <dd className="truncate font-medium">{product.produtorId}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Registros</dt>
              <dd className="font-medium">
                {product.registros.map((item) => item.tipo).join(', ')}
              </dd>
            </div>
          </dl>

          {isApproved && onToggleAtivo ? (
            <label
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                role="switch"
                checked={product.ativo}
                disabled={isUpdating}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                onChange={(event) => {
                  void onToggleAtivo(product.id, event.target.checked)
                }}
              />
              No catálogo
            </label>
          ) : null}
        </div>
      </div>

      {product.motivoRejeicao ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <strong>Motivo:</strong> {product.motivoRejeicao}
        </p>
      ) : null}

      <p className="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-primary-darker">
        Clique para analisar o cadastro
      </p>
    </button>
  )
}
