import { Modal } from '../../../shared/components/Modal'
import amcgLogo from '../../../shared/assets/amcg-catalogo.jpeg'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import type { CatalogProduct } from '../types'

type CatalogProducer = CatalogProduct['produtor']

interface ProducerInfoModalProps {
  producer: CatalogProducer
  products: CatalogProduct[]
  onClose: () => void
  onSelectProduct: (product: CatalogProduct) => void
}

// TODO: substituir pela descrição vinda do backend
const PLACEHOLDER_DESCRIPTION =
  'Produtor da agricultura familiar dos Campos Gerais, selecionado por edital da AMCG em parceria com o Sebrae. Produz com dedicação e qualidade, valorizando a tradição e a identidade produtiva da região.'

export function ProducerInfoModal({
  producer,
  products,
  onClose,
  onSelectProduct,
}: ProducerInfoModalProps) {
  const whatsappUrl = buildWhatsAppUrl({
    telefone: producer.telefone,
    nomeProdutor: producer.nome,
  })

  return (
    <Modal title="Informações do produtor" onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-4">
            <img
              src={amcgLogo}
              alt={`Logo de ${producer.nome}`}
              className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
            />
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-brand-900">
                {producer.nome}
              </h3>
              <p className="mt-0.5 text-sm text-slate-600">
                {producer.municipio}
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto"
          >
            Falar no WhatsApp
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sobre o produtor
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {PLACEHOLDER_DESCRIPTION}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Produtos deste produtor
          </h3>

          {products.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              Nenhum outro produto deste produtor no catálogo filtrado.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <img
                    src={product.fotoDivulgacao.url}
                    alt={product.nome}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-brand-900">
                      {product.nome}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatCurrency(product.valorCentavos)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
