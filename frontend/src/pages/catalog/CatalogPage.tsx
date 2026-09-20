import { useState, type ReactNode } from 'react'
import { CatalogFilterBar } from '../../features/produto/components/CatalogFilterBar'
import { FeaturedProductsRow } from '../../features/produto/components/FeaturedProductsRow'
import { ProductCard } from '../../features/produto/components/ProductCard'
import { useCatalogProducts } from '../../features/produto/hooks/useCatalogProducts'
import type { CatalogFilters as CatalogFiltersValue } from '../../features/produto/types'
import { FeaturedProducersRow } from '../../features/produtor/components/FeaturedProducersRow'
import { useCatalogProducers } from '../../features/produtor/hooks/useCatalogProducers'
import { bannerImages } from '../../shared/assets/banners'
import { BannerCarousel } from '../../shared/components/BannerCarousel'
import { Feedback } from '../../shared/components/Feedback'

const initialFilters: CatalogFiltersValue = {
  busca: '',
  categoria: '',
  municipio: '',
  certificacao: '',
}

const iconClassName = 'h-8 w-8 shrink-0 text-brand-600'

const trustBadges: Array<{
  title: string
  subtitle: string
  icon: ReactNode
}> = [
  {
    title: 'Produtores verificados',
    subtitle: 'Seleção por edital AMCG + Sebrae',
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l7 3v5c0 4.5-2.9 7.8-7 9-4.1-1.2-7-4.5-7-9V6l7-3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 12l1.8 1.8L15 10"
        />
      </svg>
    ),
  },
  {
    title: 'Compra direta',
    subtitle: 'Sem intermediários, fale com quem produz',
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h8M8 14h5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        />
      </svg>
    ),
  },
  {
    title: 'Qualidade regional',
    subtitle: 'Agricultura familiar dos Campos Gerais',
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l1.8 4.6L19 9l-3.8 3.2L16.5 17 12 14.6 7.5 17l1.3-4.8L5 9l5.2-1.4L12 3z"
        />
      </svg>
    ),
  },
]

const whyBuyItems = [
  {
    title: 'Produtores selecionados por edital',
    description:
      'Itens escolhidos com critérios técnicos definidos pela AMCG em parceria com o Sebrae, garantindo qualidade e procedência.',
  },
  {
    title: 'Contato direto com quem produz',
    description:
      'Negocie pelo WhatsApp com o próprio produtor, sem intermediários — da roça à sua mesa.',
  },
  {
    title: 'Agricultura familiar dos Campos Gerais',
    description:
      'Mais de 50 produtos de 25 produtores em 13 municípios: queijos, méis, embutidos, pães, geleias, sucos e biscoitos.',
  },
  {
    title: 'Identidade produtiva regional',
    description:
      'Valorizamos famílias do campo, fortalecemos a cadeia produtiva e aproximamos a região de novos mercados.',
  },
]

export function CatalogPage() {
  const [filters, setFilters] =
    useState<CatalogFiltersValue>(initialFilters)
  const { products, categories, cities, certifications, isLoading, error } =
    useCatalogProducts(filters)
  const unfilteredCatalog = useCatalogProducts(initialFilters)
  const { producers } = useCatalogProducers()

  const featuredProducers = producers.filter((producer) => producer.destaque)
  const featuredProducts = unfilteredCatalog.products.filter(
    (product) => product.destaque,
  )

  return (
    <>
      <BannerCarousel images={bannerImages} />
      <h1 className="sr-only">
        Catálogo de Produtos dos Campos Gerais — AMCG
      </h1>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              {badge.icon}
              <div>
                <p className="text-sm font-bold text-brand-700">{badge.title}</p>
                <p className="text-xs text-slate-600">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FeaturedProducersRow producers={featuredProducers} />
      <FeaturedProductsRow products={featuredProducts} />

      <CatalogFilterBar
        filters={filters}
        categories={categories}
        cities={cities}
        certifications={certifications}
        onChange={setFilters}
      />

      <main
        id="produtos"
        className="scroll-mt-40 py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-brand-700 sm:text-3xl">
              Produtos disponíveis
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Seleção Especial
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {products.length} resultado(s)
            </p>
          </div>

          {isLoading ? <Feedback title="Carregando produtos..." /> : null}

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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </main>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
              Por que comprar no Catálogo AMCG
            </h2>
            <p className="mt-1 text-sm font-semibold text-brand-700">
              Valorizamos quem produz nos Campos Gerais
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyBuyItems.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-base font-bold text-brand-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
