import { Link } from 'react-router-dom'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { PRODUCT_CATEGORY_LABELS } from '../constants'
import type { CatalogProduct } from '../types'

interface FeaturedProductsStripProps {
  products: CatalogProduct[]
}

export function FeaturedProductsStrip({ products }: FeaturedProductsStripProps) {
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/produtos/${product.id}`}
          className="flex min-w-[80%] snap-start items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-0"
        >
          <img
            src={buildThumbnailUrl(
              product.fotoDivulgacao.url,
              THUMBNAIL_WIDTH.avatar,
            )}
            alt={product.nome}
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            className="h-20 w-20 shrink-0 rounded-xl bg-slate-100 object-cover"
          />
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
              {product.nome}
            </h3>
            <p className="mt-1 truncate text-xs text-slate-600">
              {product.produtor.nome} · {product.produtor.municipio}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
              {PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
