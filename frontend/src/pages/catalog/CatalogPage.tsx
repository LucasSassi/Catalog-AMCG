import { useState, type ReactNode } from 'react'
import { CatalogSidebar } from '../../features/produto/components/CatalogSidebar'
import { CategoryNav } from '../../features/produto/components/CategoryNav'
import { ProductCard } from '../../features/produto/components/ProductCard'
import { ProductDetailModal } from '../../features/produto/components/ProductDetailModal'
import { ProducerInfoModal } from '../../features/produto/components/ProducerInfoModal'
import { useCatalogProducts } from '../../features/produto/hooks/useCatalogProducts'
import type {
  CatalogFilters as CatalogFiltersValue,
  CatalogProduct,
} from '../../features/produto/types'
import { bannerImages } from '../../shared/assets/banners'
import { BannerCarousel } from '../../shared/components/BannerCarousel'
import { Feedback } from '../../shared/components/Feedback'

const initialFilters: CatalogFiltersValue = {
  busca: '',
  categoria: '',
  municipio: '',
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
  const [selectedProduct, setSelectedProduct] =
    useState<CatalogProduct | null>(null)
  const [selectedProducer, setSelectedProducer] = useState<
    CatalogProduct['produtor'] | null
  >(null)
  const { products, categories, cities, isLoading, error } =
    useCatalogProducts(filters)

  const producerProducts = selectedProducer
    ? products.filter(
        (product) => product.produtor.id === selectedProducer.id,
      )
    : []

  function selectCategory(categoria: string): void {
    setFilters({ ...filters, categoria })
  }

  function openProduct(product: CatalogProduct): void {
    setSelectedProducer(null)
    setSelectedProduct(product)
  }

  function openProducer(producer: CatalogProduct['produtor']): void {
    setSelectedProduct(null)
    setSelectedProducer(producer)
  }

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

      <div>
        <CategoryNav
          categories={categories}
          selected={filters.categoria}
          onSelect={selectCategory}
        />

        <main
          id="produtos"
          className="scroll-mt-32 py-8 pl-2 pr-4 sm:pl-3 sm:pr-6 lg:pl-4 lg:pr-8"
        >
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <CatalogSidebar
                filters={filters}
                cities={cities}
                onChange={setFilters}
              />
            </aside>

            <div className="min-w-0">
              <div className="mx-auto w-full max-w-4xl ml-16 xl:max-w-6xl">
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
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={openProduct}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>

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

      <section className="border-t border-slate-200 bg-brand-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
              Quem somos
            </h2>
            <p className="mt-1 text-sm font-semibold text-brand-700">
              Associação dos Municípios dos Campos Gerais
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm leading-7 text-slate-700 sm:text-base">
                A AMCG é um órgão de representação municipal e microrregional,
                constituída sob a forma de sociedade civil sem fins lucrativos.
                É composta por 19 municípios: Arapoti, Carambeí, Castro,
                Curiúva, Imbaú, Ipiranga, Ivaí, Jaguariaíva, Ortigueira,
                Palmeira, Piraí do Sul, Porto Amazonas, Ponta Grossa, Reserva,
                São João do Triunfo, Sengés, Telêmaco Borba, Tibagi e Ventania.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                Seu principal objetivo é a integração regional, econômica e
                administrativa, buscando o fortalecimento dos municípios e o
                desenvolvimento econômico e social. Este catálogo — 1ª edição
                lançada na ExpoIpiranga, em parceria com o Sebrae e com apoio
                dos Comitês Territoriais Avança Campos Gerais e Vale do Tibagi —
                amplia a visibilidade dos empreendedores rurais e fortalece a
                identidade produtiva da região.
              </p>
              <a
                href="https://www.amcg.com.br"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Conhecer o site da AMCG
              </a>
            </div>

            <aside className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                Sobre o catálogo
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Mais de 50 produtos da agricultura familiar</li>
                <li>25 produtores de 13 municípios</li>
                <li>Seleção por critérios técnicos de edital</li>
                <li>Parceria AMCG + Sebrae</li>
                <li>
                  Destaques: queijos, mel, embutidos, biscoitos, pães, sucos e
                  geleias
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProducer={openProducer}
        />
      ) : null}

      {selectedProducer ? (
        <ProducerInfoModal
          producer={selectedProducer}
          products={producerProducts}
          onClose={() => setSelectedProducer(null)}
          onSelectProduct={openProduct}
        />
      ) : null}
    </>
  )
}
