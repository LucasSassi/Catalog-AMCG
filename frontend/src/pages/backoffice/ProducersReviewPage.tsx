import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBackofficeData } from '../../app/backoffice-data'
import { ProductDetailsPanel } from '../../features/produto/components/ProductDetailsPanel'
import { ProductEditModal } from '../../features/produto/components/ProductEditModal'
import { PRODUCT_REJECTION_REASONS } from '../../features/produto/constants'
import type { Product } from '../../features/produto/types'
import { ProducerCreateModal } from '../../features/produtor/components/ProducerCreateModal'
import { ProducerEditModal } from '../../features/produtor/components/ProducerEditModal'
import { ProducerProfilePanel } from '../../features/produtor/components/ProducerProfilePanel'
import { ProducerReviewPanel } from '../../features/produtor/components/ProducerReviewPanel'
import {
  ProducerReviewTable,
  ProducerTableSkeleton,
  type ProducerProductCount,
} from '../../features/produtor/components/ProducerReviewTable'
import { PRODUCER_REJECTION_REASONS } from '../../features/produtor/constants'
import {
  getProducerAlerts,
  getProducerChecklist,
} from '../../features/produtor/lib/producer-review'
import type { Producer } from '../../features/produtor/types'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'
import { Feedback } from '../../shared/components/Feedback'
import { Kbd } from '../../shared/components/Kbd'
import { RejectionDialog } from '../../shared/components/RejectionDialog'
import { SearchField } from '../../shared/components/SearchField'
import { StatusFilterTabs } from '../../shared/components/StatusFilterTabs'
import { useHotkeys } from '../../shared/hooks/useHotkeys'
import { usePersistentState } from '../../shared/hooks/usePersistentState'
import {
  countByStatus,
  getWaitingDays,
  matchesStatus,
  normalizeSearchText,
  type ReviewAlert,
  type ReviewStatusFilter,
} from '../../shared/lib/review-status'
import {
  BackofficePageHeader,
  ErrorBanner,
  PlusIcon,
} from './BackofficePageHeader'
import { ShortcutsDialog } from './ShortcutsDialog'

const STATUS_VALUES: ReviewStatusFilter[] = [
  'PENDENTE',
  'APROVADO',
  'REJEITADO',
  'TODOS',
]

const EMPTY_MESSAGES: Record<ReviewStatusFilter, string> = {
  PENDENTE: 'Nenhum produtor pendente.',
  APROVADO: 'Nenhum produtor aprovado ainda.',
  REJEITADO: 'Nenhum produtor rejeitado.',
  TODOS: 'Nenhum produtor cadastrado.',
}

type RejectTarget =
  | { kind: 'producer'; producer: Producer }
  | { kind: 'product'; product: Product }

function parseStatus(value: string | null): ReviewStatusFilter {
  return STATUS_VALUES.find((status) => status === value) ?? 'PENDENTE'
}

export function ProducersReviewPage() {
  const { producers, products, actions } = useBackofficeData()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = parseStatus(searchParams.get('status'))
  const search = searchParams.get('q') ?? ''
  const onlyAlerts = searchParams.get('alertas') === '1'

  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(() =>
    searchParams.get('perfil'),
  )
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null)
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null)
  const [productDetailsId, setProductDetailsId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [autoAdvance, setAutoAdvance] = usePersistentState(
    'catalog-amcg:auto-advance',
    true,
  )
  const searchRef = useRef<HTMLInputElement>(null)

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
    setSelectedIds(new Set())
  }

  const productsByProducer = useMemo(() => {
    const map = new Map<string, Product[]>()

    for (const product of products.products) {
      const list = map.get(product.produtorId) ?? []
      list.push(product)
      map.set(product.produtorId, list)
    }

    return map
  }, [products.products])

  const productCounts = useMemo(() => {
    const map = new Map<string, ProducerProductCount>()

    for (const [produtorId, list] of productsByProducer) {
      map.set(produtorId, {
        total: list.length,
        aprovados: list.filter((product) => product.status === 'APROVADO')
          .length,
      })
    }

    return map
  }, [productsByProducer])

  const alertsById = useMemo(() => {
    const map = new Map<string, ReviewAlert[]>()

    for (const producer of producers.producers) {
      map.set(producer.id, getProducerAlerts(producer))
    }

    return map
  }, [producers.producers])

  const searched = useMemo(() => {
    const term = normalizeSearchText(search)

    if (!term) {
      return producers.producers
    }

    return producers.producers.filter((producer) =>
      normalizeSearchText(
        `${producer.nomeEmpresa} ${producer.endereco.cidade} ${producer.documento.numero}`,
      ).includes(term),
    )
  }, [producers.producers, search])

  const counts = countByStatus(searched)
  const allCounts = countByStatus(producers.producers)
  const visible = useMemo(() => {
    const filtered = searched.filter(
      (producer) =>
        matchesStatus(producer.status, status) &&
        (!onlyAlerts || (alertsById.get(producer.id) ?? []).length > 0),
    )

    if (status !== 'PENDENTE') {
      return filtered
    }

    // Fila: quem espera há mais tempo aparece primeiro.
    return [...filtered].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [alertsById, onlyAlerts, searched, status])

  const pendingAll = producers.producers.filter(
    (producer) => producer.status === 'PENDENTE',
  )
  const pendingWithAlerts = pendingAll.filter(
    (producer) => (alertsById.get(producer.id) ?? []).length > 0,
  ).length
  const oldestWaiting = pendingAll.reduce(
    (max, producer) => Math.max(max, getWaitingDays(producer.createdAt)),
    0,
  )
  const destaqueCount = producers.producers.filter(
    (producer) => producer.destaque,
  ).length
  const productDestaqueCount = products.products.filter(
    (product) => product.destaque,
  ).length

  const byId = (id: string | null) =>
    producers.producers.find((producer) => producer.id === id) ?? null
  const reviewing = byId(reviewingId)
  const details = byId(detailsId)
  const focused = byId(focusedId)
  const productDetails =
    products.products.find((product) => product.id === productDetailsId) ??
    null
  const selectedVisible = visible.filter(
    (producer) =>
      producer.status === 'PENDENTE' && selectedIds.has(producer.id),
  )

  useEffect(() => {
    if (!focusedId) {
      return
    }

    document
      .querySelector(`[data-producer-row="${focusedId}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [focusedId])

  function indexOf(id: string | null) {
    return visible.findIndex((producer) => producer.id === id)
  }

  function neighbor(id: string, step: 1 | -1): Producer | null {
    const index = indexOf(id)

    if (index < 0) {
      return null
    }

    return visible[index + step] ?? null
  }

  /** Depois de decidir, segue para o próximo se combinado ou se o item sumiu do filtro. */
  function advanceAfterDecision(producer: Producer, next: Producer | null) {
    const leavesFilter = status !== 'TODOS'

    if (reviewingId === producer.id && (autoAdvance || leavesFilter)) {
      setReviewingId(next?.id ?? null)
      setFocusedId(next?.id ?? null)
    }

    if (detailsId === producer.id && next) {
      setDetailsId(next.id)
    }
  }

  async function approveProducer(producer: Producer) {
    const next = neighbor(producer.id, 1)
    const ok = await actions.approveProducers([producer])

    if (ok) {
      advanceAfterDecision(producer, next)
    }
  }

  async function confirmRejection(motivo: string) {
    if (!rejectTarget) {
      return
    }

    if (rejectTarget.kind === 'product') {
      const ok = await actions.rejectProduct(rejectTarget.product, motivo)

      if (ok) {
        setRejectTarget(null)
      }
      return
    }

    const producer = rejectTarget.producer
    const next = neighbor(producer.id, 1)
    const ok = await actions.rejectProducer(producer, motivo)

    if (ok) {
      setRejectTarget(null)
      advanceAfterDecision(producer, next)
    }
  }

  async function approveSelected() {
    const ok = await actions.approveProducers(selectedVisible)

    if (ok) {
      setSelectedIds(new Set())
    }
  }

  function toggleSelected(producer: Producer) {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(producer.id)) {
        next.delete(producer.id)
      } else {
        next.add(producer.id)
      }

      return next
    })
  }

  function toggleAllSelected(checked: boolean) {
    setSelectedIds(
      checked
        ? new Set(
            visible
              .filter((producer) => producer.status === 'PENDENTE')
              .map((producer) => producer.id),
          )
        : new Set(),
    )
  }

  function moveFocus(step: 1 | -1) {
    if (visible.length === 0) {
      return
    }

    const current = indexOf(reviewingId ?? focusedId)
    const nextIndex =
      current < 0
        ? step === 1
          ? 0
          : visible.length - 1
        : Math.min(visible.length - 1, Math.max(0, current + step))
    const next = visible[nextIndex]

    setFocusedId(next.id)

    if (reviewingId) {
      setReviewingId(next.id)
    }
  }

  function startEditing(producer: Producer) {
    setDetailsId(null)
    setEditingProducer(producer)
  }

  useHotkeys((event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      if (actions.undoLast()) {
        event.preventDefault()
      }
      return
    }

    if (event.ctrlKey || event.metaKey) {
      return
    }

    const target = reviewing ?? focused
    const key = event.key

    if (key === 'ArrowDown' || key === 'j') {
      event.preventDefault()
      moveFocus(1)
    } else if (key === 'ArrowUp' || key === 'k') {
      event.preventDefault()
      moveFocus(-1)
    } else if (key === 'Enter' && focused && event.target === document.body) {
      event.preventDefault()
      setReviewingId(focused.id)
    } else if (key === 'p' && target) {
      setDetailsId(target.id)
    } else if (key === 'a' && target && target.status !== 'APROVADO') {
      void approveProducer(target)
    } else if (key === 'r' && target && target.status === 'PENDENTE') {
      setRejectTarget({ kind: 'producer', producer: target })
    } else if (key === 'x' && target && target.status === 'PENDENTE') {
      toggleSelected(target)
    } else if (key === '/') {
      event.preventDefault()
      searchRef.current?.focus()
    } else if (key === '?') {
      setShowShortcuts(true)
    } else if (key === 'Escape') {
      if (reviewingId) {
        setReviewingId(null)
      } else if (selectedIds.size > 0) {
        setSelectedIds(new Set())
      }
    }
  })

  const hasFilters = Boolean(search) || onlyAlerts
  let content = (
    <div className="flex flex-wrap items-start gap-5">
      <div className="min-w-0 flex-[999_1_30rem]">
        <ProducerReviewTable
          producers={visible}
          productCounts={productCounts}
          alertsById={alertsById}
          selectedIds={selectedIds}
          focusedId={focusedId}
          reviewingId={reviewingId}
          disabled={producers.isUpdating}
          onToggleSelected={toggleSelected}
          onToggleAllSelected={toggleAllSelected}
          onOpenDetails={(producer) => {
            setFocusedId(producer.id)
            setDetailsId(producer.id)
          }}
          onReview={(producer) => {
            setFocusedId(producer.id)
            setReviewingId(reviewingId === producer.id ? null : producer.id)
          }}
          onApprove={(producer) => void approveProducer(producer)}
          onReject={(producer) =>
            setRejectTarget({ kind: 'producer', producer })
          }
        />
      </div>
      {reviewing ? (
        <div className="min-w-0 flex-[1_1_22rem] max-md:hidden">
          <ProducerReviewPanel
            producer={reviewing}
            alerts={alertsById.get(reviewing.id) ?? []}
            checklist={getProducerChecklist(reviewing)}
            position={indexOf(reviewing.id) + 1}
            total={visible.length}
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={setAutoAdvance}
            disabled={producers.isUpdating}
            destaqueCount={destaqueCount}
            onPrevious={
              neighbor(reviewing.id, -1) ? () => moveFocus(-1) : undefined
            }
            onNext={neighbor(reviewing.id, 1) ? () => moveFocus(1) : undefined}
            onClose={() => setReviewingId(null)}
            onOpenDetails={() => setDetailsId(reviewing.id)}
            onEdit={() => startEditing(reviewing)}
            onApprove={() => void approveProducer(reviewing)}
            onReject={() =>
              setRejectTarget({ kind: 'producer', producer: reviewing })
            }
            onToggleDestaque={() =>
              void actions.toggleProducerDestaque(reviewing)
            }
          />
        </div>
      ) : null}
    </div>
  )

  if (producers.isLoading) {
    content = <ProducerTableSkeleton />
  } else if (producers.error && producers.producers.length === 0) {
    content = (
      <Feedback
        tone="error"
        title="Não foi possível carregar os produtores"
        description={producers.error}
      />
    )
  } else if (visible.length === 0) {
    content =
      status === 'PENDENTE' && !hasFilters ? (
        <EmptyState
          tone="success"
          title="Fila zerada"
          description="Nenhuma inscrição esperando decisão. Bom trabalho!"
        />
      ) : (
        <EmptyState
          title={hasFilters ? 'Nenhum produtor encontrado' : EMPTY_MESSAGES[status]}
          description={
            hasFilters
              ? 'Nenhum resultado com a busca e os filtros atuais.'
              : undefined
          }
          action={
            hasFilters ? (
              <Button
                variant="secondary"
                onClick={() => updateParams({ q: null, alertas: null })}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      )
  }

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <BackofficePageHeader
        title="Produtores"
        description="Confira as inscrições, decida rápido e desfaça se precisar."
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="hidden min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-text-muted transition hover:bg-white lg:inline-flex"
            >
              <Kbd>?</Kbd> Atalhos
            </button>
            <Button
              variant="secondary"
              onClick={() => {
                producers.reload()
                products.reload()
              }}
            >
              Atualizar
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusIcon />
              Novo produtor
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Aguardando decisão"
          value={pendingAll.length}
          hint={
            pendingAll.length > 0
              ? `mais antigo há ${oldestWaiting} ${oldestWaiting === 1 ? 'dia' : 'dias'}`
              : 'fila zerada'
          }
          tone="pending"
          active={status === 'PENDENTE' && !onlyAlerts}
          onClick={() => updateParams({ status: null, alertas: null })}
        />
        <KpiCard
          label="Pendentes com alerta"
          value={pendingWithAlerts}
          hint="registro, logo ou fotos"
          tone="warning"
          active={status === 'PENDENTE' && onlyAlerts}
          onClick={() => updateParams({ status: null, alertas: '1' })}
        />
        <KpiCard
          label="Aprovados"
          value={allCounts.APROVADO}
          hint={`${destaqueCount} em destaque`}
          tone="approved"
          active={status === 'APROVADO'}
          onClick={() => updateParams({ status: 'APROVADO', alertas: null })}
        />
        <KpiCard
          label="Rejeitados"
          value={allCounts.REJEITADO}
          hint="podem ser reconsiderados"
          tone="danger"
          active={status === 'REJEITADO'}
          onClick={() => updateParams({ status: 'REJEITADO', alertas: null })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusFilterTabs
            value={status}
            counts={counts}
            onChange={(next) =>
              updateParams({ status: next === 'PENDENTE' ? null : next })
            }
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
            <button
              type="button"
              aria-pressed={onlyAlerts}
              onClick={() => updateParams({ alertas: onlyAlerts ? null : '1' })}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition ${
                onlyAlerts
                  ? 'border-[#8a4b00] bg-[#fff4e5] text-[#8a4b00]'
                  : 'border-slate-300 bg-white text-text hover:border-primary'
              }`}
            >
              <span aria-hidden="true">⚠</span>
              Só com alertas
            </button>
            <SearchField
              label="Buscar produtor"
              placeholder="Nome, cidade ou documento"
              value={search}
              onChange={(value) => updateParams({ q: value })}
              inputRef={searchRef}
              hint={<Kbd>/</Kbd>}
              className="w-full sm:w-72"
            />
          </div>
        </div>
        {!producers.isLoading ? (
          <p className="text-sm text-text-muted" aria-live="polite">
            Mostrando {visible.length} de {producers.producers.length}{' '}
            produtores
            {status === 'PENDENTE' && visible.length > 1
              ? ' · mais antigos primeiro'
              : ''}
          </p>
        ) : null}
      </div>

      {producers.error && producers.producers.length > 0 ? (
        <ErrorBanner message={producers.error} />
      ) : null}

      {selectedVisible.length > 0 ? (
        <div
          role="region"
          aria-label="Ações em lote"
          className="flex flex-wrap items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-white"
        >
          <span className="text-sm font-semibold">
            {selectedVisible.length}{' '}
            {selectedVisible.length === 1 ? 'selecionado' : 'selecionados'}
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="min-h-10 rounded-lg px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            Limpar seleção
          </button>
          <span className="flex-1" />
          <button
            type="button"
            disabled={producers.isUpdating}
            onClick={() => void approveSelected()}
            className="min-h-10 rounded-lg bg-accent-yellow px-4 text-sm font-bold text-foreground transition hover:bg-accent-yellow-soft disabled:opacity-60"
          >
            Aprovar {selectedVisible.length}
          </button>
        </div>
      ) : null}

      {content}

      {details ? (
        <ProducerProfilePanel
          key={details.id}
          producer={details}
          products={productsByProducer.get(details.id) ?? []}
          productsLoading={products.isLoading}
          disabled={producers.isUpdating}
          destaqueCount={destaqueCount}
          position={Math.max(1, indexOf(details.id) + 1)}
          total={Math.max(visible.length, 1)}
          hasNext={Boolean(neighbor(details.id, 1))}
          onPrevious={
            neighbor(details.id, -1)
              ? () => setDetailsId(neighbor(details.id, -1)?.id ?? null)
              : undefined
          }
          onNext={
            neighbor(details.id, 1)
              ? () => setDetailsId(neighbor(details.id, 1)?.id ?? null)
              : undefined
          }
          onClose={() => {
            setDetailsId(null)

            if (searchParams.has('perfil')) {
              updateParams({ perfil: null })
            }
          }}
          onEdit={() => startEditing(details)}
          onOpenProduct={(product) => setProductDetailsId(product.id)}
          onApprove={() => void approveProducer(details)}
          onReject={() =>
            setRejectTarget({ kind: 'producer', producer: details })
          }
          onToggleDestaque={() => void actions.toggleProducerDestaque(details)}
        />
      ) : null}

      {productDetails ? (
        <ProductDetailsPanel
          key={productDetails.id}
          product={productDetails}
          producer={byId(productDetails.produtorId) ?? undefined}
          disabled={products.isUpdating}
          destaqueCount={productDestaqueCount}
          onClose={() => setProductDetailsId(null)}
          onOpenProducer={() => setProductDetailsId(null)}
          onEdit={() => {
            setEditingProduct(productDetails)
            setProductDetailsId(null)
          }}
          onApprove={() => void actions.approveProduct(productDetails)}
          onReject={() =>
            setRejectTarget({ kind: 'product', product: productDetails })
          }
          onToggleAtivo={() =>
            void actions.setProductsAtivo([productDetails], !productDetails.ativo)
          }
          onToggleDestaque={() =>
            void actions.toggleProductDestaque(productDetails)
          }
        />
      ) : null}

      {rejectTarget ? (
        <RejectionDialog
          itemName={
            rejectTarget.kind === 'producer'
              ? rejectTarget.producer.nomeEmpresa
              : rejectTarget.product.nome
          }
          description={
            rejectTarget.kind === 'producer'
              ? 'O produtor sai da fila e verá o motivo. Dá para reconsiderar depois em “Rejeitados”.'
              : 'O produto não entra no catálogo e o produtor verá o motivo.'
          }
          reasons={
            rejectTarget.kind === 'producer'
              ? PRODUCER_REJECTION_REASONS
              : PRODUCT_REJECTION_REASONS
          }
          confirmLabel={
            rejectTarget.kind === 'producer'
              ? 'Rejeitar inscrição'
              : 'Rejeitar produto'
          }
          disabled={producers.isUpdating || products.isUpdating}
          onCancel={() => setRejectTarget(null)}
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

      {editingProducer ? (
        <ProducerEditModal
          producer={editingProducer}
          onClose={() => setEditingProducer(null)}
          onSuccess={() => producers.reload()}
        />
      ) : null}

      {isCreateOpen ? (
        <ProducerCreateModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => producers.reload()}
        />
      ) : null}

      {showShortcuts ? (
        <ShortcutsDialog onClose={() => setShowShortcuts(false)} />
      ) : null}
    </main>
  )
}

const KPI_TONES = {
  pending: 'text-pending',
  warning: 'text-[#8a4b00]',
  approved: 'text-primary-darker',
  danger: 'text-danger',
} as const

function KpiCard({
  label,
  value,
  hint,
  tone,
  active,
  onClick,
}: {
  label: string
  value: number
  hint: string
  tone: keyof typeof KPI_TONES
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-start rounded-2xl border bg-white px-4 py-3.5 text-left transition hover:border-primary ${
        active
          ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
          : 'border-border-soft'
      }`}
    >
      <span className="text-xs font-semibold text-text-muted sm:text-sm">
        {label}
      </span>
      <span className={`mt-0.5 text-3xl font-extrabold ${KPI_TONES[tone]}`}>
        {value}
      </span>
      <span className="text-xs text-text-muted">{hint}</span>
    </button>
  )
}
