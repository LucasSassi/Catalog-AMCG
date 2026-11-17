import { useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useCatalogBanners } from '../../features/banner/hooks/useCatalogBanners'
import { CatalogFilterBar } from '../../features/produto/components/CatalogFilterBar'
import { CatalogPagination } from '../../features/produto/components/CatalogPagination'
import { FeaturedProductsStrip } from '../../features/produto/components/FeaturedProductsStrip'
import { ProductCard } from '../../features/produto/components/ProductCard'
import { useCatalogProducts } from '../../features/produto/hooks/useCatalogProducts'
import { useFeaturedProducts } from '../../features/produto/hooks/useFeaturedProducts'
import { PRODUCT_CATEGORY_LABELS } from '../../features/produto/constants'
import type {
  CatalogFilters as CatalogFiltersValue,
  ProductCategory,
} from '../../features/produto/types'
import { FeaturedProducersStrip } from '../../features/produtor/components/FeaturedProducersStrip'
import { useFeaturedProducers } from '../../features/produtor/hooks/useFeaturedProducers'
import { BannerCarousel } from '../../shared/components/BannerCarousel'
import { Feedback } from '../../shared/components/Feedback'
import {
  TabbedSection,
  type SectionTab,
} from '../../shared/components/TabbedSection'

const initialFilters: CatalogFiltersValue = {
  busca: '',
  categoria: '',
  municipio: '',
  certificacao: '',
  premiado: false,
}

const PRODUCTS_PER_PAGE = 20

type FilterKey = 'busca' | 'categoria' | 'municipio' | 'certificacao' | 'premiado'

const HIGHLIGHT_TAB = {
  products: 'produtos',
  producers: 'produtores',
} as const

const HIGHLIGHT_TAB_BY_HASH: Record<string, string> = {
  '#produtos-destaque': HIGHLIGHT_TAB.products,
  '#produtores-destaque': HIGHLIGHT_TAB.producers,
}

const highlightAnchorClassName = 'block scroll-mt-32'

const iconClassName = 'h-[18px] w-[18px]'

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
        strokeWidth="2"
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
        strokeWidth="2"
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
        strokeWidth="2"
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
  const catalogBanners = useCatalogBanners()
  const [filters, setFilters] =
    useState<CatalogFiltersValue>(initialFilters)
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null])
  const currentCursor = cursorStack[cursorStack.length - 1] ?? null
  const catalogFilters: CatalogFiltersValue = {
    ...filters,
    pageSize: PRODUCTS_PER_PAGE,
    ...(currentCursor ? { lastItemId: currentCursor } : {}),
  }
  const {
    products,
    categories,
    cities,
    certifications,
    hasNext,
    isLoading,
    error,
  } = useCatalogProducts(catalogFilters)
  const { products: featuredProducts } = useFeaturedProducts()
  const { producers: featuredProducers } = useFeaturedProducers()
  const productsSectionRef = useRef<HTMLElement>(null)
  const { hash, key: locationKey } = useLocation()
  const [highlightSelection, setHighlightSelection] = useState<{
    locationKey: string
    tabId: string
  } | null>(null)

  const activeHighlightTab =
    highlightSelection?.locationKey === locationKey
      ? highlightSelection.tabId
      : (HIGHLIGHT_TAB_BY_HASH[hash] ?? HIGHLIGHT_TAB.products)

  const highlightTabs: SectionTab[] = []

  if (featuredProducts.length > 0) {
    highlightTabs.push({
      id: HIGHLIGHT_TAB.products,
      label: 'Produtos',
      content: <FeaturedProductsStrip products={featuredProducts} />,
    })
  }

  if (featuredProducers.length > 0) {
    highlightTabs.push({
      id: HIGHLIGHT_TAB.producers,
      label: 'Produtores',
      content: <FeaturedProducersStrip producers={featuredProducers} />,
    })
  }

  function handleHighlightTabChange(tabId: string): void {
    setHighlightSelection({ locationKey, tabId })
  }

  function handleFiltersChange(nextFilters: CatalogFiltersValue): void {
    setFilters({
      busca: nextFilters.busca,
      categoria: nextFilters.categoria,
      municipio: nextFilters.municipio,
      certificacao: nextFilters.certificacao,
      premiado: nextFilters.premiado ?? false,
    })
    setCursorStack([null])
  }

  const activeFilterChips: Array<{ key: FilterKey; label: string }> = []

  if (filters.busca.trim()) {
    activeFilterChips.push({ key: 'busca', label: `“${filters.busca.trim()}”` })
  }

  if (filters.categoria) {
    activeFilterChips.push({
      key: 'categoria',
      label:
        PRODUCT_CATEGORY_LABELS[filters.categoria as ProductCategory] ??
        filters.categoria,
    })
  }

  if (filters.municipio) {
    activeFilterChips.push({ key: 'municipio', label: filters.municipio })
  }

  if (filters.certificacao) {
    activeFilterChips.push({ key: 'certificacao', label: filters.certificacao })
  }

  if (filters.premiado) {
    activeFilterChips.push({ key: 'premiado', label: 'Premiados' })
  }

  function removeFilter(key: FilterKey): void {
    handleFiltersChange(
      key === 'premiado'
        ? { ...filters, premiado: false }
        : { ...filters, [key]: '' },
    )
  }

  function handlePreviousPage(): void {
    if (cursorStack.length <= 1) {
      return
    }
    setCursorStack((current) => current.slice(0, -1))
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleNextPage(): void {
    if (!hasNext || products.length === 0) {
      return
    }

    const nextCursor = products[products.length - 1]?.id
    if (!nextCursor) {
      return
    }

    setCursorStack((current) => [...current, nextCursor])
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <BannerCarousel banners={catalogBanners.banners} isLoading={catalogBanners.isLoading} />
      <h1 className="sr-only">
        Catálogo de Produtos dos Campos Gerais — AMCG
      </h1>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-9 gap-y-2.5 px-4 py-3 sm:px-6 lg:px-8">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-secondary-background text-primary">
                {badge.icon}
              </span>
              <p className="text-[13px] leading-tight">
                <strong className="font-bold text-primary-darker">{badge.title}</strong>{' '}
                <span className="text-text-muted">· {badge.subtitle}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {highlightTabs.length > 0 ? (
        <section className="border-b border-[#e8dfcf] bg-background-secondary pb-6 pt-5">
          <span id="produtos-destaque" className={highlightAnchorClassName} />
          <span
            id="produtores-destaque"
            className={highlightAnchorClassName}
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <TabbedSection
              title="Destaques"
              eyebrow="Escolhidos pela curadoria AMCG"
              tabs={highlightTabs}
              activeTabId={activeHighlightTab}
              onTabChange={handleHighlightTabChange}
            />
          </div>
        </section>
      ) : null}

      <CatalogFilterBar
        filters={filters}
        categories={categories}
        cities={cities}
        certifications={certifications}
        onChange={handleFiltersChange}
      />

      <main
        ref={productsSectionRef}
        id="produtos"
        className="scroll-mt-24 px-4 pb-12 pt-6 sm:px-6 lg:scroll-mt-48 lg:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-extrabold text-foreground sm:text-[22px]">
              Produtos disponíveis
            </h2>
            {!isLoading && !error ? (
              <span className="text-sm text-text-muted">
                {products.length}{' '}
                {products.length === 1 ? 'produto' : 'produtos'}
                {hasNext || cursorStack.length > 1 ? ' nesta página' : ''}
              </span>
            ) : null}
          </div>

          {activeFilterChips.length > 0 ? (
            <div className="-mt-1 mb-4 flex flex-wrap items-center gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  aria-label={`Remover filtro ${chip.label}`}
                  onClick={() => removeFilter(chip.key)}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-muted bg-secondary-background pl-3 pr-1.5 text-[13px] font-semibold text-primary-darker transition hover:border-primary"
                >
                  {chip.label}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleFiltersChange(initialFilters)}
                className="min-h-8 px-2 text-[13px] font-bold text-primary-darker underline underline-offset-2 hover:text-primary-dark"
              >
                Limpar filtros
              </button>
            </div>
          ) : null}

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
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-[18px]">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <CatalogPagination
                hasPrevious={cursorStack.length > 1}
                hasNext={hasNext}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
              />
            </>
          ) : null}
        </div>
      </main>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
              Por que comprar no Catálogo AMCG
            </h2>
            <p className="mt-1 text-sm font-semibold text-primary-darker">
              Valorizamos quem produz nos Campos Gerais
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyBuyItems.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-base font-bold text-foreground">
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
