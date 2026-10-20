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
    <article className="[contain-intrinsic-size:auto_360px] [content-visibility:auto] sm:[contain-intrinsic-size:auto_480px]">
      <Link
        to={`/produtos/${product.id}`}
        className="group flex h-full w-full flex-col rounded-2xl border border-slate-300 bg-white p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:rounded-3xl sm:p-3"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl">
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
          <span className="absolute left-2 top-2 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-primary-darker shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
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
              className="absolute right-1.5 top-1.5 h-8 w-8 object-contain drop-shadow sm:right-2 sm:top-2 sm:h-10 sm:w-10"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-1 pt-3 sm:px-2 sm:pt-4">
          <h2 className="line-clamp-2 min-h-[2.5rem] text-center text-sm font-bold leading-5 text-slate-900 sm:min-h-[3.5rem] sm:text-lg sm:leading-7">
            {product.nome}
          </h2>
          <p className="mt-2 hidden min-h-[3.75rem] text-justify text-xs leading-5 text-slate-600 sm:line-clamp-3">
            {product.descricao}
          </p>
          <p className="mt-2 truncate text-center text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-[11px]">
            {product.produtor.nome} · {product.produtor.municipio}
          </p>

          <div className="mt-auto flex flex-col items-stretch gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-4">
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-sm font-bold text-slate-900 sm:text-base">
                {price}
              </p>
              <p className="text-[10px] text-slate-500 sm:text-[11px]">
                por {product.unidadeMedida}
              </p>
            </div>
            <span className="inline-flex min-h-9 w-full shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-[10px] font-bold uppercase tracking-wide text-white transition group-hover:bg-primary-darker sm:w-auto sm:px-4 sm:text-xs">
              Ver produto
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
