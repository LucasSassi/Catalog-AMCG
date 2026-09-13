import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { Product } from '../types'

interface ProductReviewCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductReviewCard({
  product,
  onSelect,
}: ProductReviewCardProps) {
  const image = product.fotosDivulgacao[0]
  let statusClasses = 'bg-amber-100 text-amber-800'
  let statusLabel = 'Pendente'

  if (product.status === 'REJEITADO') {
    statusClasses = 'bg-red-100 text-red-800'
    statusLabel = 'Rejeitado'
  }

  if (product.status === 'APROVADO') {
    statusClasses = 'bg-green-100 text-green-800'
    statusLabel = 'Aprovado'
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex gap-4">
        {image ? (
          <img
            src={image.url}
            alt=""
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
        </div>
      </div>

      {product.motivoRejeicao ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <strong>Motivo:</strong> {product.motivoRejeicao}
        </p>
      ) : null}

      <p className="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-brand-700">
        Clique para analisar o cadastro
      </p>
    </button>
  )
}
