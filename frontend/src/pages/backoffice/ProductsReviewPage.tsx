import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBackofficeData } from '../../app/backoffice-data'
import { CategoryFilterDropdown } from '../../features/produto/components/CategoryFilterDropdown'
import { ProductCreateModal } from '../../features/produto/components/ProductCreateModal'
import { ProductDetailsPanel } from '../../features/produto/components/ProductDetailsPanel'
import { ProductEditModal } from '../../features/produto/components/ProductEditModal'
import {
  ProductCardSkeleton,
  ProductReviewCard,
} from '../../features/produto/components/ProductReviewCard'
import {
  MAX_PRODUCT_DESTAQUES,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_REJECTION_REASONS,
} from '../../features/produto/constants'
import type { Product, ProductCategory } from '../../features/produto/types'
import type { Producer } from '../../features/produtor/types'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'
import { Feedback } from '../../shared/components/Feedback'
import { RejectionDialog } from '../../shared/components/RejectionDialog'
import { SearchField } from '../../shared/components/SearchField'
import { StatusFilterTabs } from '../../shared/components/StatusFilterTabs'
import {
  countByStatus,
  matchesStatus,
  normalizeSearchText,
  type ReviewStatusFilter,
} from '../../shared/lib/review-status'
import {
  BackofficePageHeader,
  ErrorBanner,
  PlusIcon,
} from './BackofficePageHeader'

const STATUS_VALUES: ReviewStatusFilter[] = [
  'TODOS',
  'ALTERADO',
  'PENDENTE',
  'APROVADO',
  'REJEITADO',
]

function parseStatus(value: string | null): ReviewStatusFilter {
  return STATUS_VALUES.find((status) => status === value) ?? 'TODOS'
}

function parseCategoria(value: string | null): ProductCategory | '' {
  return PRODUCT_CATEGORIES.find((categoria) => categoria === value) ?? ''
}

export function ProductsReviewPage() {
  const { producers, products, actions } = useBackofficeData()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = parseStatus(searchParams.get('status'))
  const categoria = parseCategoria(searchParams.get('categoria'))
  const cidade = searchParams.get('cidade') ?? ''
  const search = searchParams.get('q') ?? ''

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  function updateParams(changes: Record<string, string | null>) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)

        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === '') {
            next.delete(key)
          } else {
            next.set(key, value)
          }
        }

        return next
      },
      { replace: true },
    )
    setCheckedIds(new Set())
  }

  const producersById = useMemo(() => {
    const map = new Map<string, Producer>()

    for (const producer of producers.producers) {
      map.set(producer.id, producer)
    }

    return map
  }, [producers.producers])

  const cities = useMemo(() => {
    const set = new Set<string>()

    for (const product of products.products) {
      const city = producersById.get(product.produtorId)?.endereco.cidade

      if (city) {
        set.add(city)
      }
    }

    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [producersById, products.products])

  const filtered = useMemo(() => {
    const term = normalizeSearchText(search)

    return products.products.filter((product) => {
      const producer = producersById.get(product.produtorId)

      if (categoria && product.categoria !== categoria) {
        return false
      }

      if (cidade && producer?.endereco.cidade !== cidade) {
        return false
      }

      if (!term) {
        return true
      }

      return normalizeSearchText(
        `${product.nome} ${producer?.nomeEmpresa ?? ''}`,
      ).includes(term)
    })
  }, [categoria, cidade, producersById, products.products, search])

  const counts = countByStatus(filtered)
  const visible = useMemo(() => {
    const list = filtered.filter((product) =>
      matchesStatus(product.status, status),
    )
    const rank = { PENDENTE: 0, ALTERADO: 1, APROVADO: 2, REJEITADO: 3 } as const

    // Pendentes primeiro (mais antigos no topo); o resto mantém a ordem da API.
    return [...list].sort((a, b) => {
      if (rank[a.status] !== rank[b.status]) {
        return rank[a.status] - rank[b.status]
      }

      return a.status === 'PENDENTE'
        ? a.createdAt.localeCompare(b.createdAt)
        : 0
    })
  }, [filtered, status])

  const destaqueCount = products.products.filter(
    (product) => product.destaque,
  ).length
  const destaqueLimitReached = destaqueCount >= MAX_PRODUCT_DESTAQUES
  const selected =
    products.products.find((product) => product.id === selectedId) ?? null
  const checkedVisible = visible.filter(
    (product) => product.status === 'APROVADO' && checkedIds.has(product.id),
  )
  const hasFilters = Boolean(search || categoria || cidade)

  function producerLabel(produtorId: string): string {
    const producer = producersById.get(produtorId)

    if (!producer) {
      return producers.isLoading
        ? 'Carregando produtor...'
        : 'Produtor não encontrado'
    }

    return `${producer.nomeEmpresa} · ${producer.endereco.cidade}`
  }

  function neighbor(id: string, step: 1 | -1): Product | null {
    const index = visible.findIndex((product) => product.id === id)
    return index < 0 ? null : (visible[index + step] ?? null)
  }

  function toggleChecked(product: Product) {
    setCheckedIds((current) => {
      const next = new Set(current)

      if (next.has(product.id)) {
        next.delete(product.id)
      } else {
        next.add(product.id)
      }

      return next
    })
  }

  async function approve(product: Product) {
    const next = neighbor(product.id, 1)
    const ok = await actions.approveProduct(product)

    if (ok && selectedId === product.id && next) {
      setSelectedId(next.id)
    }
  }

  async function confirmRejection(motivo: string) {
    if (!rejecting) {
      return
    }

    const next = neighbor(rejecting.id, 1)
    const ok = await actions.rejectProduct(rejecting, motivo)

    if (ok) {
      if (selectedId === rejecting.id && next) {
        setSelectedId(next.id)
      }
      setRejecting(null)
    }
  }

  async function setCheckedAtivo(ativo: boolean) {
    const ok = await actions.setProductsAtivo(checkedVisible, ativo)

    if (ok) {
      setCheckedIds(new Set())
    }
  }

  let content = (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5">
      {visible.map((product) => (
        <ProductReviewCard
          key={product.id}
          product={product}
          producerLabel={producerLabel(product.produtorId)}
          isUpdating={products.isUpdating}
          destaqueLimitReached={destaqueLimitReached}
          selected={checkedIds.has(product.id)}
          onToggleSelected={toggleChecked}
          onSelect={(item) => setSelectedId(item.id)}
          onToggleAtivo={(item) =>
            void actions.setProductsAtivo([item], !item.ativo)
          }
          onToggleDestaque={(item) => void actions.toggleProductDestaque(item)}
        />
      ))}
    </div>
  )

  if (products.isLoading) {
    content = (
      <div
        role="status"
        aria-label="Carregando produtos"
        className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  } else if (products.error && products.products.length === 0) {
    content = (
      <Feedback
        tone="error"
        title="Não foi possível carregar os produtos"
        description={products.error}
      />
    )
  } else if (products.products.length === 0) {
    content = (
      <EmptyState
        title="Nenhum produto cadastrado"
        description="Os produtos chegam pela inscrição pública ou pelo botão “Novo produto”."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon />
            Novo produto
          </Button>
        }
      />
    )
  } else if (visible.length === 0) {
    content =
      status === 'PENDENTE' && !hasFilters ? (
        <EmptyState
          tone="success"
          title="Nenhum produto aguardando"
          description="Todos os produtos enviados já foram analisados."
        />
      ) : (
        <EmptyState
          title="Nenhum produto com esses filtros"
          description="Tente outra combinação ou limpe os filtros."
          action={
            <Button
              variant="secondary"
              onClick={() =>
                updateParams({
                  q: null,
                  categoria: null,
                  cidade: null,
                  status: null,
                })
              }
            >
              Limpar filtros
            </Button>
          }
        />
      )
  }

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <BackofficePageHeader
        title="Produtos"
        description="Analise os envios, controle o que aparece na vitrine e escolha os destaques."
        actions={
          <>
            <DestaqueMeter count={destaqueCount} />
            <Button
              variant="secondary"
              onClick={() => {
                products.reload()
                producers.reload()
              }}
            >
              Atualizar
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusIcon />
              Novo produto
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchField
            label="Buscar produto"
            placeholder="Produto ou produtor"
            value={search}
            onChange={(value) => updateParams({ q: value })}
            className="w-full sm:w-64"
          />
          <CategoryFilterDropdown
            value={categoria}
            onChange={(value) => updateParams({ categoria: value })}
          />
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-text focus-within:border-primary">
            <span className="text-text-muted">Cidade</span>
            <select
              value={cidade}
              onChange={(event) => updateParams({ cidade: event.target.value })}
              className="min-h-10 bg-transparent font-semibold outline-none"
            >
              <option value="">Todas</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>
        <StatusFilterTabs
          value={status}
          counts={counts}
          onChange={(next) =>
            updateParams({ status: next === 'TODOS' ? null : next })
          }
        />
      </div>

      <div className="-mt-2 flex flex-wrap items-center gap-2">
        <span className="text-sm text-text-muted" aria-live="polite">
          {products.isLoading
            ? 'Carregando...'
            : `Mostrando ${visible.length} de ${products.products.length} produtos`}
        </span>
        {categoria ? (
          <FilterChip
            label={PRODUCT_CATEGORY_LABELS[categoria]}
            onRemove={() => updateParams({ categoria: null })}
          />
        ) : null}
        {cidade ? (
          <FilterChip
            label={cidade}
            onRemove={() => updateParams({ cidade: null })}
          />
        ) : null}
        {search ? (
          <FilterChip
            label={`“${search}”`}
            onRemove={() => updateParams({ q: null })}
          />
        ) : null}
        {hasFilters ? (
          <button
            type="button"
            onClick={() =>
              updateParams({ q: null, categoria: null, cidade: null })
            }
            className="min-h-9 px-2 text-sm font-semibold text-primary-darker hover:text-primary-dark"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      {products.error && products.products.length > 0 ? (
        <ErrorBanner message={products.error} />
      ) : null}

      {checkedVisible.length > 0 ? (
        <div
          role="region"
          aria-label="Ações em lote"
          className="flex flex-wrap items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-white"
        >
          <span className="text-sm font-semibold">
            {checkedVisible.length}{' '}
            {checkedVisible.length === 1 ? 'selecionado' : 'selecionados'}
          </span>
          <button
            type="button"
            onClick={() => setCheckedIds(new Set())}
            className="min-h-10 rounded-lg px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Limpar seleção
          </button>
          <span className="flex-1" />
          <button
            type="button"
            disabled={products.isUpdating}
            onClick={() => void setCheckedAtivo(false)}
            className="min-h-10 rounded-lg border border-white/30 px-4 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            Ocultar da vitrine
          </button>
          <button
            type="button"
            disabled={products.isUpdating}
            onClick={() => void setCheckedAtivo(true)}
            className="min-h-10 rounded-lg bg-accent-yellow px-4 text-sm font-bold text-foreground transition hover:bg-accent-yellow-soft disabled:opacity-60"
          >
            Mostrar na vitrine
          </button>
        </div>
      ) : null}

      {content}

      {selected ? (
        <ProductDetailsPanel
          key={selected.id}
          product={selected}
          producer={producersById.get(selected.produtorId)}
          disabled={products.isUpdating}
          destaqueCount={destaqueCount}
          position={Math.max(1, visible.findIndex((p) => p.id === selected.id) + 1)}
          total={Math.max(visible.length, 1)}
          onPrevious={
            neighbor(selected.id, -1)
              ? () => setSelectedId(neighbor(selected.id, -1)?.id ?? null)
              : undefined
          }
          onNext={
            neighbor(selected.id, 1)
              ? () => setSelectedId(neighbor(selected.id, 1)?.id ?? null)
              : undefined
          }
          onClose={() => setSelectedId(null)}
          onOpenProducer={() =>
            navigate(
              `/backoffice/produtores?status=TODOS&perfil=${selected.produtorId}`,
            )
          }
          onEdit={() => {
            setEditingProduct(selected)
            setSelectedId(null)
          }}
          onApprove={() => void approve(selected)}
          onReject={() => setRejecting(selected)}
          onToggleAtivo={() =>
            void actions.setProductsAtivo([selected], !selected.ativo)
          }
          onToggleDestaque={() => void actions.toggleProductDestaque(selected)}
        />
      ) : null}

      {rejecting ? (
        <RejectionDialog
          itemName={rejecting.nome}
          description="O produto não entra no catálogo e o produtor verá o motivo. Dá para reconsiderar depois."
          reasons={PRODUCT_REJECTION_REASONS}
          confirmLabel="Rejeitar produto"
          disabled={products.isUpdating}
          onCancel={() => setRejecting(null)}
          onConfirm={confirmRejection}
        />
      ) : null}

      {editingProduct ? (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => products.reload()}
        />
      ) : null}

      {isCreateOpen ? (
        <ProductCreateModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => products.reload()}
        />
      ) : null}
    </main>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remover filtro ${label}`}
      className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-dark px-3 text-sm font-bold text-accent-yellow-soft"
    >
      {label}
      <span aria-hidden="true">×</span>
    </button>
  )
}

function DestaqueMeter({ count }: { count: number }) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-lg border border-accent-yellow-soft bg-[#fff8e1] px-3.5">
      <span className="text-sm font-semibold text-pending">
        ★ Destaques {count}/{MAX_PRODUCT_DESTAQUES}
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: MAX_PRODUCT_DESTAQUES }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 w-[18px] rounded-sm ${
              index < count ? 'bg-warning' : 'bg-accent-yellow-soft'
            }`}
          />
        ))}
      </span>
    </div>
  )
}
