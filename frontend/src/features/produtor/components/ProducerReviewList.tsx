import { Feedback } from '../../../shared/components/Feedback'
import type { Producer } from '../types'
import { ProducerReviewCard } from './ProducerReviewCard'

interface ProducerReviewListProps {
  producers: Producer[]
  status: 'PENDENTE' | 'REJEITADO'
  isLoading: boolean
  error: string
  onSelect: (producer: Producer) => void
}

export function ProducerReviewList({
  producers,
  status,
  isLoading,
  error,
  onSelect,
}: ProducerReviewListProps) {
  if (isLoading) {
    return <Feedback title="Carregando produtores..." />
  }

  if (error) {
    return (
      <Feedback
        tone="error"
        title="Não foi possível carregar os produtores"
        description={error}
      />
    )
  }

  let title = 'Produtores pendentes'
  let emptyMessage = 'Nenhum produtor pendente'

  if (status === 'REJEITADO') {
    title = 'Produtores rejeitados'
    emptyMessage = 'Nenhum produtor rejeitado'
  }

  if (producers.length === 0) {
    return <Feedback title={emptyMessage} />
  }

  return (
    <section aria-labelledby="producer-list-title">
      <h2 id="producer-list-title" className="mb-4 text-xl font-bold">
        {title}
      </h2>
      <div className="space-y-4">
        {producers.map((producer) => (
          <ProducerReviewCard
            key={producer.id}
            producer={producer}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
