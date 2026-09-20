import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProducerInfoModal } from '../../features/produto/components/ProducerInfoModal'
import { useCatalogProducts } from '../../features/produto/hooks/useCatalogProducts'
import type { CatalogFilters, CatalogProduct } from '../../features/produto/types'
import { useCatalogProducers } from '../../features/produtor/hooks/useCatalogProducers'
import type { CatalogProducer } from '../../features/produtor/types'
import logoPlaceholder from '../../shared/assets/logo-catalogo-campos-gerais.png'
import { Feedback } from '../../shared/components/Feedback'

const emptyFilters: CatalogFilters = {
  busca: '',
  categoria: '',
  municipio: '',
  certificacao: '',
}

export function ProducersPage() {
  const { producers, isLoading, error } = useCatalogProducers()
  const { products } = useCatalogProducts(emptyFilters)
  const [selectedProducer, setSelectedProducer] =
    useState<CatalogProducer | null>(null)

  const selectedProducts: CatalogProduct[] = selectedProducer
    ? products.filter((product) => product.produtor.id === selectedProducer.id)
    : []

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-900 sm:text-3xl">
          Nossos Produtores
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Conheça os produtores aprovados do Catálogo dos Campos Gerais.
        </p>
      </div>

      {isLoading ? <Feedback title="Carregando produtores..." /> : null}

      {!isLoading && error ? (
        <Feedback
          tone="error"
          title="Não foi possível carregar os produtores"
          description={error}
        />
      ) : null}

      {!isLoading && !error && producers.length === 0 ? (
        <Feedback title="Nenhum produtor disponível no momento" />
      ) : null}

      {!isLoading && !error && producers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {producers.map((producer) => (
            <button
              key={producer.id}
              type="button"
              onClick={() => setSelectedProducer(producer)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <img
                  src={logoPlaceholder}
                  alt=""
                  className="h-16 w-16 rounded-full border border-slate-200 object-contain p-1"
                />
                <div>
                  <h2 className="text-lg font-bold text-brand-900">
                    {producer.nome}
                  </h2>
                  <p className="text-sm text-slate-600">{producer.municipio}</p>
                  {producer.destaque ? (
                    <span className="mt-2 inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                      Destaque
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          Voltar ao catálogo
        </Link>
      </div>

      {selectedProducer ? (
        <ProducerInfoModal
          producer={{
            id: selectedProducer.id,
            nome: selectedProducer.nome,
            municipio: selectedProducer.municipio,
            telefone: selectedProducer.telefone,
          }}
          products={selectedProducts}
          onClose={() => setSelectedProducer(null)}
        />
      ) : null}
    </main>
  )
}
