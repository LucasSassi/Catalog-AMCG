import { Link } from 'react-router-dom'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { CatalogProduct } from '../types'

interface FeaturedProductsStripProps {
  products: CatalogProduct[]
}

/** Vitrine de destaques: foto inteira com nome, produtor e preço sobrepostos. */
export function FeaturedProductsStrip({ products }: FeaturedProductsStripProps) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/produtos/${product.id}`}
          className="group relative block h-40 w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl bg-foreground text-white shadow-sm sm:h-44 sm:w-auto"
        >
          <img
            src={buildThumbnailUrl(
              product.fotoDivulgacao.url,
              THUMBNAIL_WIDTH.card,
            )}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,59,37,0)_30%,rgba(10,59,37,0.92)_100%)]"
          />
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent-yellow-soft px-2.5 py-1 text-[11px] font-extrabold text-foreground">
            <StarIcon />
            Destaque
          </span>
          <span className="absolute inset-x-3.5 bottom-3 flex items-end justify-between gap-2.5">
            <span className="min-w-0">
              <span className="line-clamp-2 block text-base font-extrabold leading-tight">
                {product.nome}
              </span>
              <span className="mt-0.5 block truncate text-xs text-surface">
                {product.produtor.nome} · {product.produtor.municipio}
              </span>
            </span>
            <span className="shrink-0 rounded-[10px] bg-white px-2.5 py-1.5 text-[13px] font-extrabold text-foreground">
              {formatCurrency(product.valorCentavos)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}

function StarIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
    </svg>
  )
}
