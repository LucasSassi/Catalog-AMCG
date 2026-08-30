import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { CatalogProduct } from '../types'

interface ProductCardProps {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const price = formatCurrency(product.valorCentavos)
  const message = encodeURIComponent(
    `Olá! Vi o produto "${product.nome}" no Catálogo AMCG e gostaria de saber mais.`,
  )
  const phone = product.produtor.telefone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`

  return (
    <article className="group flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="w-32 shrink-0 overflow-hidden bg-slate-100 sm:w-40">
        <img
          src={product.fotoDivulgacao.url}
          alt={product.nome}
          className="h-full min-h-52 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {product.categoria}
          </span>
          <span className="text-xs text-slate-500">
            {product.produtor.municipio}
          </span>
        </div>
        <h2 className="text-lg font-bold text-brand-900">{product.nome}</h2>
        <p className="mt-1 text-sm font-medium text-brand-700">
          {product.produtor.nome}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {product.descricao}
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-lg font-bold text-slate-900">{price}</p>
            <p className="text-xs text-slate-500">
              por {product.unidadeMedida}
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}
