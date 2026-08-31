import { Feedback } from '../../../shared/components/Feedback'
import type { ProductListFilter } from '../api/products'
import type { Product } from '../types'
import { ProductReviewCard } from './ProductReviewCard'

interface ProductReviewListProps {
  products: Product[]
  status: ProductListFilter
  isLoading: boolean
  error: string
  onSelect: (product: Product) => void
}

export function ProductReviewList({
  products,
  status,
  isLoading,
  error,
  onSelect,
}: ProductReviewListProps) {
  if (isLoading) {
    return <Feedback title="Carregando produtos..." />
  }

  if (error) {
    return (
      <Feedback
        tone="error"
        title="Não foi possível carregar os produtos"
        description={error}
      />
    )
  }

  let title = 'Produtos pendentes'
  let emptyMessage = 'Nenhum produto pendente'

  if (status === 'REJEITADO') {
    title = 'Produtos rejeitados'
    emptyMessage = 'Nenhum produto rejeitado'
  }

  if (status === 'APROVADO') {
    title = 'Produtos aprovados'
    emptyMessage = 'Nenhum produto aprovado'
  }

  if (status === 'TODOS') {
    title = 'Todos os produtos'
    emptyMessage = 'Nenhum produto cadastrado'
  }

  if (products.length === 0) {
    return <Feedback title={emptyMessage} />
  }

  return (
    <section aria-labelledby="product-list-title">
      <h2 id="product-list-title" className="mb-4 text-xl font-bold">
        {title}
      </h2>
      <div className="space-y-4">
        {products.map((product) => (
          <ProductReviewCard
            key={product.id}
            product={product}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
