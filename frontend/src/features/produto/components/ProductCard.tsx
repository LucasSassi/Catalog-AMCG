import { Link } from 'react-router-dom'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
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
    <article className="[contain-intrinsic-size:auto_480px] [content-visibility:auto]">
      <Link
        to={`/produtos/${product.id}`}
        className="group flex h-full w-full flex-col rounded-3xl border border-slate-300 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={buildThumbnailUrl(
              product.fotoDivulgacao.url,
              THUMBNAIL_WIDTH.card,
            )}
            alt={product.nome}
            width={600}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            {categoryLabel}
          </span>
          {product.premiado ? (
            <img
              src={premiadoBadge}
              alt="Produto premiado"
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="absolute right-2 top-2 h-10 w-10 object-contain drop-shadow"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-2 pt-4">
          <h2 className="line-clamp-2 min-h-[3.5rem] text-center text-lg font-bold leading-7 text-slate-900">
            {product.nome}
          </h2>
          <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-justify text-xs leading-5 text-slate-600">
            {product.descricao}
          </p>
          <p className="mt-2 truncate text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {product.produtor.nome} · {product.produtor.municipio}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">{price}</p>
              <p className="text-[11px] text-slate-500">
                por {product.unidadeMedida}
              </p>
            </div>
            <span className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 px-4 text-xs font-bold uppercase tracking-wide text-white transition group-hover:bg-brand-700">
              Ver produto
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
