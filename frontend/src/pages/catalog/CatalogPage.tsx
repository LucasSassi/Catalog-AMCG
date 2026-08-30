import { useState } from 'react'
import { CatalogFilters } from '../../features/produto/components/CatalogFilters'
import { ProductCard } from '../../features/produto/components/ProductCard'
import { useCatalogProducts } from '../../features/produto/hooks/useCatalogProducts'
import type {
  CatalogFilters as CatalogFiltersValue,
} from '../../features/produto/types'
import { Feedback } from '../../shared/components/Feedback'

const initialFilters: CatalogFiltersValue = {
  busca: '',
  categoria: '',
  municipio: '',
}

export function CatalogPage() {
  const [filters, setFilters] =
    useState<CatalogFiltersValue>(initialFilters)
  const { products, categories, cities, isLoading, error } =
    useCatalogProducts(filters)

  return (
    <>
      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-400">
            Produtos dos Campos Gerais
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            Sabores locais, histórias que fortalecem a nossa região
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-brand-100 sm:text-lg">
            Conheça produtores e artesãos da AMCG e negocie diretamente com
            quem produz.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CatalogFilters
          filters={filters}
          categories={categories}
          cities={cities}
          onChange={setFilters}
        />

        <div className="mb-5 mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-700">
              Seleção regional
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Produtos disponíveis
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {products.length} resultado(s)
          </p>
        </div>

        {isLoading ? (
          <Feedback title="Carregando produtos..." />
        ) : null}

        {!isLoading && error ? (
          <Feedback
            tone="error"
            title="Não foi possível carregar o catálogo"
            description={error}
          />
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <Feedback
            title="Nenhum produto encontrado"
            description="Altere os filtros para visualizar outras opções."
          />
        ) : null}

        {!isLoading && !error && products.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </main>
    </>
  )
}
