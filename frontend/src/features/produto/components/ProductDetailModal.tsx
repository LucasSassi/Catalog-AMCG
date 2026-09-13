import { Modal } from '../../../shared/components/Modal'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { buildProductWhatsAppUrl } from '../lib/whatsapp'
import type { CatalogProduct } from '../types'

interface ProductDetailModalProps {
  product: CatalogProduct
  onClose: () => void
  onSelectProducer: (producer: CatalogProduct['produtor']) => void
}

export function ProductDetailModal({
  product,
  onClose,
  onSelectProducer,
}: ProductDetailModalProps) {
  const price = formatCurrency(product.valorCentavos)
  const whatsappUrl = buildProductWhatsAppUrl(product)

  return (
    <Modal title={product.nome} onClose={onClose}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <img
            src={product.fotoDivulgacao.url}
            alt={product.nome}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {product.categoria}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {product.produtor.municipio}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {product.descricao}
          </p>

          <div className="mt-5">
            <p className="text-2xl font-bold text-slate-900">{price}</p>
            <p className="text-sm text-slate-500">
              por {product.unidadeMedida}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectProducer(product.produtor)}
            className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Produtor
            </p>
            <p className="mt-1 font-semibold text-brand-900">
              {product.produtor.nome}
            </p>
            <p className="text-sm text-slate-600">
              {product.produtor.municipio}
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700">
              Ver produtor →
            </span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  )
}
