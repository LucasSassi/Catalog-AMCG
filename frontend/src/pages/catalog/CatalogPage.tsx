import { useState } from 'react'
import { CatalogFilters } from '../../features/produto/components/CatalogFilters'
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

const trustBadges = [
  'Produtores verificados — seleção por edital',
  'Compra direta — sem intermediários',
  'Qualidade regional — AMCG + Sebrae',
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
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {trustBadges.map((badge) => (
            <p
              key={badge}
              className="rounded-lg bg-brand-50 px-3 py-2 text-center text-xs font-semibold text-brand-800 sm:text-sm"
            >
              {badge}
            </p>
          ))}
        </div>
      </section>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              filters.categoria === ''
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                filters.categoria === category
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <main
        id="produtos"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8"
      >
        <CatalogFilters
          filters={filters}
          cities={cities}
          onChange={setFilters}
        />

        <div className="mb-5 mt-10 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
            Produtos disponíveis
          </h2>
          <p className="mt-1 text-sm font-semibold text-brand-700">
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
