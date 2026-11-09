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
    <article className="[contain-intrinsic-size:auto_300px] [content-visibility:auto] sm:[contain-intrinsic-size:auto_340px]">
      <Link
        to={`/produtos/${product.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-white text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(10,59,37,0.35)]"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
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
          <span className="absolute left-2 top-2 max-w-[calc(100%-4rem)] truncate rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-primary-darker shadow-sm sm:text-[11px]">
            {categoryLabel}
          </span>
          {product.premiado ? (
            <img
              src={premiadoBadge}
              alt="Produto premiado"
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="absolute right-1.5 top-1.5 h-9 w-9 object-contain drop-shadow sm:h-11 sm:w-11"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-3.5 sm:pb-3.5 sm:pt-3">
          <p className="flex items-center gap-1 truncate text-[11px] text-text-muted sm:text-xs">
            <PinIcon />
            <span className="truncate">
              <span className="hidden sm:inline">{product.produtor.nome} · </span>
              {product.produtor.municipio}
            </span>
          </p>
          <h2 className="mt-1 line-clamp-2 min-h-[2.25rem] text-[13px] font-bold leading-snug text-foreground sm:min-h-10 sm:text-[15px]">
            {product.nome}
          </h2>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2 sm:pt-2.5">
            <p className="min-w-0">
              <span className="text-[15px] font-extrabold text-foreground sm:text-[17px]">
                {price}
              </span>
              <span className="text-[11px] text-text-muted sm:text-xs">
                {' '}/ {product.unidadeMedida.toLowerCase()}
              </span>
            </p>
            <span
              aria-hidden="true"
              className="hidden h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-secondary-background text-primary transition group-hover:bg-primary group-hover:text-white sm:grid"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function PinIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0 sm:h-[13px] sm:w-[13px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
