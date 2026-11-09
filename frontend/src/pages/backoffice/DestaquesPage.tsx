import { useMemo, useState, type ReactNode } from 'react'
import { useBackofficeData } from '../../app/backoffice-data'
import {
  MAX_PRODUCT_DESTAQUES,
  PRODUCT_CATEGORY_LABELS,
} from '../../features/produto/constants'
import type { Product } from '../../features/produto/types'
import { ProducerAvatar } from '../../features/produtor/components/ProducerAvatar'
import { MAX_PRODUCER_DESTAQUES } from '../../features/produtor/constants'
import type { Producer } from '../../features/produtor/types'
import { SearchField } from '../../shared/components/SearchField'
import { Skeleton } from '../../shared/components/Skeleton'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { normalizeSearchText } from '../../shared/lib/review-status'
import { BackofficePageHeader, ErrorBanner } from './BackofficePageHeader'

type Tab = 'produtos' | 'produtores'

export function DestaquesPage() {
  const { producers, products, actions } = useBackofficeData()
  const [tab, setTab] = useState<Tab>('produtos')
  const [search, setSearch] = useState('')

  const producersById = useMemo(
    () => new Map(producers.producers.map((producer) => [producer.id, producer])),
    [producers.producers],
  )

  const isVisibleProducer = (producer?: Producer) =>
    Boolean(producer && producer.status === 'APROVADO' && producer.ativo)

  const featuredProducts = products.products.filter((product) => product.destaque)
  const featuredProducers = producers.producers.filter(
    (producer) => producer.destaque,
  )
  const term = normalizeSearchText(search)

  const productCandidates = products.products.filter(
    (product) =>
      !product.destaque &&
      product.status === 'APROVADO' &&
      product.ativo &&
      isVisibleProducer(producersById.get(product.produtorId)) &&
      (!term ||
        normalizeSearchText(
          `${product.nome} ${producersById.get(product.produtorId)?.nomeEmpresa ?? ''}`,
        ).includes(term)),
  )
  const producerCandidates = producers.producers.filter(
    (producer) =>
      !producer.destaque &&
      isVisibleProducer(producer) &&
      (!term ||
        normalizeSearchText(
          `${producer.nomeEmpresa} ${producer.endereco.cidade}`,
        ).includes(term)),
  )

  const isLoading = producers.isLoading || products.isLoading
  const productsFull = featuredProducts.length >= MAX_PRODUCT_DESTAQUES
  const producersFull = featuredProducers.length >= MAX_PRODUCER_DESTAQUES
  const error = producers.error || products.error

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <BackofficePageHeader
        title="Destaques"
        description="Escolha o que aparece primeiro na página inicial do catálogo."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg border border-primary bg-white px-4 text-sm font-semibold text-primary-darker transition hover:bg-secondary-background"
          >
            Ver no catálogo ↗
          </a>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <SlotsSection
          title="Produtos em destaque"
          count={featuredProducts.length}
          max={MAX_PRODUCT_DESTAQUES}
          isLoading={isLoading}
          onSelect={() => setTab('produtos')}
          active={tab === 'produtos'}
        >
          {featuredProducts.map((product) => (
            <ProductSlot
              key={product.id}
              product={product}
              producer={producersById.get(product.produtorId)}
              disabled={products.isUpdating}
              onRemove={() => void actions.toggleProductDestaque(product)}
            />
          ))}
        </SlotsSection>
        <SlotsSection
          title="Produtores em destaque"
          count={featuredProducers.length}
          max={MAX_PRODUCER_DESTAQUES}
          isLoading={isLoading}
          onSelect={() => setTab('produtores')}
          active={tab === 'produtores'}
        >
          {featuredProducers.map((producer) => (
            <ProducerSlot
              key={producer.id}
              producer={producer}
              disabled={producers.isUpdating}
              onRemove={() => void actions.toggleProducerDestaque(producer)}
            />
          ))}
        </SlotsSection>
      </div>

      <p className="-mt-2 rounded-xl bg-white px-4 py-3 text-sm text-text-muted">
        <strong className="text-text">Vagas livres</strong> são preenchidas
        automaticamente no catálogo com itens aprovados escolhidos ao acaso.
        Escolha manualmente para controlar exatamente o que aparece.
      </p>

      <section aria-labelledby="candidates-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Tipo de destaque" className="inline-flex rounded-[10px] bg-white p-1 shadow-sm">
            {(
              [
                ['produtos', `Produtos (${productCandidates.length})`],
                ['produtores', `Produtores (${producerCandidates.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition ${
                  tab === id
                    ? 'bg-foreground text-white'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <SearchField
            label="Buscar candidatos"
            placeholder={tab === 'produtos' ? 'Produto ou produtor' : 'Nome ou cidade'}
            value={search}
            onChange={setSearch}
            className="w-full sm:w-72"
          />
        </div>

        <h2 id="candidates-title" className="sr-only">
          Disponíveis para destacar
        </h2>
        <p className="-mt-1 text-sm text-text-muted">
          Só aparecem itens aprovados e visíveis na vitrine.
          {tab === 'produtos' && productsFull
            ? ' Todas as vagas de produtos estão ocupadas: remova um destaque para trocar.'
            : ''}
          {tab === 'produtores' && producersFull
            ? ' Todas as vagas de produtores estão ocupadas: remova um destaque para trocar.'
            : ''}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : null}

        {!isLoading && tab === 'produtos' ? (
          <CandidateGrid empty="Nenhum produto disponível com essa busca.">
            {productCandidates.map((product) => (
              <CandidateCard
                key={product.id}
                image={product.fotosDivulgacao[0]?.url}
                title={product.nome}
                subtitle={`${producersById.get(product.produtorId)?.nomeEmpresa ?? ''} · ${formatCurrency(product.valorCentavos)}`}
                disabled={productsFull || products.isUpdating}
                onFeature={() => void actions.toggleProductDestaque(product)}
              />
            ))}
          </CandidateGrid>
        ) : null}

        {!isLoading && tab === 'produtores' ? (
          <CandidateGrid empty="Nenhum produtor disponível com essa busca.">
            {producerCandidates.map((producer) => (
              <CandidateCard
                key={producer.id}
                avatar={<ProducerAvatar producer={producer} />}
                title={producer.nomeEmpresa}
                subtitle={`${producer.endereco.cidade}/${producer.endereco.estado}`}
                disabled={producersFull || producers.isUpdating}
                onFeature={() => void actions.toggleProducerDestaque(producer)}
              />
            ))}
          </CandidateGrid>
        ) : null}
      </section>
    </main>
  )
}

function SlotsSection({
  title,
  count,
  max,
  isLoading,
  active,
  onSelect,
  children,
}: {
  title: string
  count: number
  max: number
  isLoading: boolean
  active: boolean
  onSelect: () => void
  children: ReactNode
}) {
  const free = Math.max(0, max - count)

  return (
    <section
      aria-label={title}
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 transition ${
        active ? 'border-primary' : 'border-border-soft'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-foreground">{title}</h2>
        <span className="flex items-center gap-2 text-sm font-semibold text-pending">
          ★ {count}/{max}
          <span className="flex gap-1" aria-hidden="true">
            {Array.from({ length: max }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 w-4 rounded-sm ${
                  index < count ? 'bg-warning' : 'bg-accent-yellow-soft'
                }`}
              />
            ))}
          </span>
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {isLoading ? (
          <li>
            <Skeleton className="h-16 rounded-xl" />
          </li>
        ) : (
          <>
            {children}
            {Array.from({ length: free }, (_, index) => (
              <li key={`livre-${index}`}>
                <button
                  type="button"
                  onClick={onSelect}
                  className="flex min-h-16 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-text-muted transition hover:border-primary hover:text-primary-darker"
                >
                  + Vaga livre — escolha abaixo
                </button>
              </li>
            ))}
          </>
        )}
      </ul>
    </section>
  )
}

function ProductSlot({
  product,
  producer,
  disabled,
  onRemove,
}: {
  product: Product
  producer?: Producer
  disabled: boolean
  onRemove: () => void
}) {
  const image = product.fotosDivulgacao[0]
  const hiddenReason = !product.ativo
    ? 'Oculto da vitrine'
    : producer && !(producer.status === 'APROVADO' && producer.ativo)
      ? 'Produtor fora do catálogo'
      : ''

  return (
    <li className="flex items-center gap-3 rounded-xl bg-[#fff8e1] p-2.5">
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
        {image ? (
          <img
            src={buildThumbnailUrl(image.url, THUMBNAIL_WIDTH.gallery)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{product.nome}</p>
        <p className="truncate text-xs text-text-muted">
          {PRODUCT_CATEGORY_LABELS[product.categoria]} · {producer?.nomeEmpresa ?? ''}
        </p>
        {hiddenReason ? (
          <p className="text-xs font-semibold text-danger">
            ⚠ {hiddenReason}: não aparece no catálogo
          </p>
        ) : null}
      </div>
      <RemoveButton label={product.nome} disabled={disabled} onClick={onRemove} />
    </li>
  )
}

function ProducerSlot({
  producer,
  disabled,
  onRemove,
}: {
  producer: Producer
  disabled: boolean
  onRemove: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-[#fff8e1] p-2.5">
      <ProducerAvatar producer={producer} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {producer.nomeEmpresa}
        </p>
        <p className="truncate text-xs text-text-muted">
          {producer.endereco.cidade}/{producer.endereco.estado}
        </p>
        {!producer.ativo ? (
          <p className="text-xs font-semibold text-danger">
            ⚠ Produtor desativado: não aparece no catálogo
          </p>
        ) : null}
      </div>
      <RemoveButton label={producer.nomeEmpresa} disabled={disabled} onClick={onRemove} />
    </li>
  )
}

function RemoveButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`Remover destaque de ${label}`}
      className="min-h-10 shrink-0 rounded-lg px-3 text-sm font-semibold text-danger transition hover:bg-white disabled:opacity-50"
    >
      Remover
    </button>
  )
}

function CandidateGrid({
  empty,
  children,
}: {
  empty: string
  children: ReactNode[]
}) {
  if (children.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-text-muted">
        {empty}
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
      {children}
    </ul>
  )
}

function CandidateCard({
  image,
  avatar,
  title,
  subtitle,
  disabled,
  onFeature,
}: {
  image?: string
  avatar?: ReactNode
  title: string
  subtitle: string
  disabled: boolean
  onFeature: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border-soft bg-white p-2.5">
      {avatar ?? (
        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
          {image ? (
            <img
              src={buildThumbnailUrl(image, THUMBNAIL_WIDTH.gallery)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{title}</p>
        <p className="truncate text-xs text-text-muted">{subtitle}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onFeature}
        aria-label={`Destacar ${title}`}
        className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-warning bg-white px-3 text-sm font-bold text-pending transition hover:bg-pending-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        ★ Destacar
      </button>
    </li>
  )
}
