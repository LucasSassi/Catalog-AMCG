import { Link } from 'react-router-dom'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { buildProductWhatsAppUrl } from '../lib/whatsapp'
import type { CatalogProduct } from '../types'

interface SimilarProductsCarouselProps {
  products: CatalogProduct[]
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  isLoading: boolean
}

export function SimilarProductsCarousel({
  products,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isLoading,
}: SimilarProductsCarouselProps) {
  if (!isLoading && products.length === 0) {
    return null
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-center">
        <span className="rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
          Produtos similares
        </span>
      </div>

      <div className="relative">
        {hasPrevious ? (
          <button
            type="button"
            aria-label="Página anterior de produtos similares"
            onClick={onPrevious}
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition hover:bg-slate-50"
          >
            <span aria-hidden="true">‹</span>
          </button>
        ) : null}

        {hasNext ? (
          <button
            type="button"
            aria-label="Próxima página de produtos similares"
            onClick={onNext}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition hover:bg-slate-50"
          >
            <span aria-hidden="true">›</span>
          </button>
        ) : null}

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Carregando produtos similares...
          </p>
        ) : (
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-8 sm:pb-0">
            {products.map((product) => {
              const whatsappUrl = buildProductWhatsAppUrl(product)

              return (
                <article
                  key={product.id}
                  className="min-w-[78%] shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:min-w-0"
                >
                  <Link to={`/produtos/${product.id}`} className="block">
                    <img
                      src={buildThumbnailUrl(
                        product.fotoDivulgacao.url,
                        THUMBNAIL_WIDTH.card,
                      )}
                      alt={product.nome}
                      width={600}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full rounded-xl object-cover"
                    />
                    <h3 className="mt-3 line-clamp-2 text-base font-bold text-slate-900">
                      {product.nome}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                      {product.descricao}
                    </p>
                  </Link>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(product.valorCentavos)}
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-primary px-3 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-primary-darker"
                    >
                      WhatsApp
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
