import { Link } from 'react-router-dom'
import { PRODUCT_CATEGORY_LABELS } from '../constants'
import type { CatalogProduct } from '../types'

interface FeaturedProductsRowProps {
  products: CatalogProduct[]
}

export function FeaturedProductsRow({ products }: FeaturedProductsRowProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section
      id="produtos-destaque"
      className="scroll-mt-28 border-b border-slate-200 bg-brand-900/5 py-10"
    >
      <div className="mx-auto flex max-w-7xl items-stretch gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1 rounded-3xl border border-white/70 bg-white/40 p-4 backdrop-blur sm:p-6">
          <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wide text-brand-900 sm:hidden">
            Produtos de Destaque
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {products.slice(0, 3).map((product, index) => {
              const isCenter = index === 1 || products.length === 1
              const categoryLabel =
                PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria

              return (
                <Link
                  key={product.id}
                  to={`/produtos/${product.id}`}
                  className={`flex flex-col items-center rounded-3xl border p-5 text-center transition hover:-translate-y-0.5 ${
                    isCenter
                      ? 'border-transparent bg-white shadow-md'
                      : 'border-white/80 bg-white/55'
                  }`}
                >
                  <img
                    src={product.fotoDivulgacao.url}
                    alt={product.nome}
                    className="h-24 w-24 rounded-full border border-slate-200 object-cover"
                  />
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {product.nome}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                    {product.descricao}
                  </p>
                  <span
                    className={`mt-4 inline-flex rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                      isCenter
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-700'
                    }`}
                  >
                    {product.produtor.nome}
                  </span>
                  <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {categoryLabel}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        <p className="hidden w-8 shrink-0 items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-brand-800 [writing-mode:vertical-rl] sm:flex">
          Produtos
        </p>
      </div>
    </section>
  )
}
