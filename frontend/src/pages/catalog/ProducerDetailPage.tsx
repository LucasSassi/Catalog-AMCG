import { Link, useParams } from 'react-router-dom'
import { ProducerProfile } from '../../features/produtor/components/ProducerProfile'
import { useCatalogProducer } from '../../features/produtor/hooks/useCatalogProducer'
import { Feedback } from '../../shared/components/Feedback'

export function ProducerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { producer, isLoading, error } = useCatalogProducer(id)

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <Feedback title="Carregando produtor..." />
      </main>
    )
  }

  if (error || !producer) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <Feedback
          tone="error"
          title="Produtor não encontrado"
          description={
            error || 'Este produtor não está disponível no catálogo.'
          }
        />
        <Link
          to="/produtores"
          className="mt-4 inline-flex text-sm font-semibold text-primary-darker hover:underline"
        >
          Voltar aos produtores
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-background-secondary py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-visible rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <ProducerProfile producer={producer} />
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/produtores"
            className="text-sm font-semibold text-primary-darker hover:underline"
          >
            Voltar aos produtores
          </Link>
        </div>
      </div>
    </main>
  )
}
