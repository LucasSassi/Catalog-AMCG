import { useState } from 'react'
import { ProducerApprovals } from './ProducerApprovals'
import { useBackofficeData } from '../../app/backoffice-data'
import { ProductDetailsPanel } from '../../features/produto/components/ProductDetailsPanel'
import { CatalogPagination } from '../../features/produto/components/CatalogPagination'
import {
  approveProduct,
  rejectProduct,
} from '../../features/produto/api/products'
import { PRODUCT_REJECTION_REASONS } from '../../features/produto/constants'
import type { Product } from '../../features/produto/types'
import { RejectionDialog } from '../../shared/components/RejectionDialog'
import { Button } from '../../shared/components/Button'
import { useManagementPage } from '../../shared/lib/useManagementPage'
export function PendingApprovalPage() {
  const [tab, setTab] = useState<'produtos' | 'produtores'>('produtos')
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Aguardando aprovação</h1>
      <aside
        aria-label="Ordem de aprovação"
        className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
      >
        <p className="font-semibold">
          Aprove primeiro os produtores e depois os produtos.
        </p>
        <p className="mt-1">
          Os produtos só podem ser aprovados quando o produtor estiver aprovado
          e ativo.
        </p>
      </aside>
      <nav aria-label="Tipo de cadastro em revisão" className="flex gap-3">
        {(['produtos', 'produtores'] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={tab === item}
            className={`rounded-lg border px-5 py-3 ${tab === item ? 'bg-primary text-white' : 'bg-white'}`}
            onClick={() => setTab(item)}
          >
            {item === 'produtos' ? 'Produtos' : 'Produtores'}
          </button>
        ))}
      </nav>
      {tab === 'produtos' ? <ProductApprovals /> : <ProducerApprovals />}
    </main>
  )
}
function ProductApprovals() {
  const page = useManagementPage<Product & { produtorNome?: string }>(
    '/api/gestao/aprovacoes',
  )
  const { products, producers } = useBackofficeData()
  const [selected, setSelected] = useState<Product | null>(null),
    [rejecting, setRejecting] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function decide(reason?: string) {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      if (reason)
        await rejectProduct(selected.id, reason, selected.revisao ?? 0)
      else await approveProduct(selected.id, selected.revisao ?? 0)
      setSelected(null)
      setRejecting(false)
      page.reload()
      products.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao decidir')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Produtos aguardando aprovação</h2>
      <p>{page.data.total ?? 0} produtos pendentes</p>
      <input
        aria-label="Buscar produtos pendentes"
        placeholder="Buscar por nome"
        value={page.search}
        onChange={(e) => page.setSearch(e.target.value)}
        className="w-full rounded-lg border p-3"
      />
      {(page.error || error) && <p role="alert">{page.error || error}</p>}
      {page.loading ? (
        <p role="status">Carregando...</p>
      ) : !page.data.items.length ? (
        <p>Nenhum produto aguardando aprovação.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {page.data.items.map((p) => (
            <article
              key={p.id}
              className="space-y-3 rounded-xl border bg-white p-5"
            >
              {p.fotosDivulgacao[0] && (
                <img
                  src={p.fotosDivulgacao[0].url}
                  alt={p.nome}
                  className="h-40 w-full rounded object-cover"
                />
              )}
              <span className="rounded bg-yellow-100 px-2 py-1 text-sm">
                Aguardando aprovação
              </span>
              <h2 className="text-lg font-bold">{p.nome}</h2>
              <p>{p.produtorNome ?? p.produtorId}</p>
              <p>
                {p.origemPendencia === 'ALTERACAO' ? 'Alteração' : 'Cadastro'}
              </p>
              {p.camposAlterados?.length ? (
                <p>Campos: {p.camposAlterados.join(', ')}</p>
              ) : null}
              <Button
                onClick={() => {
                  setSelected(p)
                  setError('')
                }}
              >
                Revisar produto
              </Button>
            </article>
          ))}
        </div>
      )}
      <CatalogPagination {...page.pagination} />
      {selected && (
        <ProductDetailsPanel
          product={selected}
          producer={producers.producers.find(
            (p) => p.id === selected.produtorId,
          )}
          disabled={busy}
          destaqueCount={0}
          onClose={() => {
            if (!busy) setSelected(null)
          }}
          onEdit={() => {}}
          onApprove={() => void decide()}
          onReject={() => setRejecting(true)}
          onToggleAtivo={() => {}}
          onToggleDestaque={() => {}}
          readOnlyEdit
        />
      )}
      {selected && error && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-[70] max-w-lg rounded bg-red-100 p-4 text-red-900"
        >
          {error}
        </div>
      )}
      {selected && rejecting && (
        <RejectionDialog
          itemName={selected.nome}
          description="Informe o motivo para que o produtor possa corrigir."
          reasons={PRODUCT_REJECTION_REASONS}
          confirmLabel="Rejeitar"
          disabled={busy}
          onCancel={() => setRejecting(false)}
          onConfirm={(reason) => decide(reason)}
        />
      )}
    </section>
  )
}
