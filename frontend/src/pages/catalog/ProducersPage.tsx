import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProducerInfoModal } from '../../features/produto/components/ProducerInfoModal'
import { ProducerCard } from '../../features/produtor/components/ProducerCard'
import { useCatalogProducers } from '../../features/produtor/hooks/useCatalogProducers'
import { Feedback } from '../../shared/components/Feedback'

export function ProducersPage() {
  const { producers, isLoading, error } = useCatalogProducers()
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(
    null,
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground sm:text-3xl">
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
            <ProducerCard
              key={producer.id}
              producer={producer}
              onSelect={setSelectedProducerId}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-sm font-semibold text-primary-darker hover:underline"
        >
          Voltar ao catálogo
        </Link>
      </div>

      {selectedProducerId ? (
        <ProducerInfoModal
          producerId={selectedProducerId}
          onClose={() => setSelectedProducerId(null)}
        />
      ) : null}
    </main>
  )
}
