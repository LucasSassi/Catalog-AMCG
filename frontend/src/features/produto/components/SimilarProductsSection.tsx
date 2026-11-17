import type { CatalogProduct } from '../types'
import { ProductCarouselCard } from './SimilarProductsCarousel'

interface SimilarProductsSectionProps {
  title: string
  products: CatalogProduct[]
  isLoading: boolean
}

/** Lista fixa (até 3 cards) de produtos de outros produtores. */
export function SimilarProductsSection({
  title,
  products,
  isLoading,
}: SimilarProductsSectionProps) {
  if (!isLoading && products.length === 0) {
    return null
  }

  return (
    <section className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5">
      <h2 className="text-[22px] font-extrabold tracking-tight text-foreground sm:text-[28px]">
        {title}
      </h2>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-text-muted">
          Carregando produtos...
        </p>
      ) : (
        // No celular os cards rolam para o lado; a partir do tablet ficam lado a lado.
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
          {products.map((product) => (
            <li
              key={product.id}
              className="w-[46%] shrink-0 snap-start sm:w-auto"
            >
              <ProductCarouselCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
