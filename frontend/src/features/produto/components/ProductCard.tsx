import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { PRODUCT_CATEGORY_LABELS } from '../constants'
import type { CatalogProduct } from '../types'
import premiadoBadge from '../../../shared/assets/premiado.png'

interface ProductCardProps {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const price = formatCurrency(product.valorCentavos)
  const categoryLabel =
    PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria

  return (
    <article>
      <Link
        to={`/produtos/${product.id}`}
        className="group flex h-full w-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={product.fotoDivulgacao.url}
            alt={product.nome}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            {categoryLabel}
          </span>
          {product.premiado ? (
            <img
              src={premiadoBadge}
              alt="Produto premiado"
              className="absolute right-2 top-2 h-10 w-10 object-contain drop-shadow"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h2 className="line-clamp-2 text-base font-bold text-brand-900">
            {product.nome}
          </h2>
          <p className="mt-1 text-sm font-medium text-brand-700">
            {product.produtor.nome}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {product.produtor.municipio}
          </p>

          <div className="mt-auto pt-4">
            <p className="text-lg font-bold text-slate-900">{price}</p>
            <p className="text-xs text-slate-500">
              por {product.unidadeMedida}
            </p>
            <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition group-hover:bg-brand-700">
              Ver produto
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
