import { useState } from 'react'
import { apiRequest } from '../../shared/api/client'
import { useManagementPage } from '../../shared/lib/useManagementPage'
import { CatalogPagination } from '../../features/produto/components/CatalogPagination'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
interface User {
  _id: string
  nome: string
  email: string
  produtorId?: string
  produtorVinculado?: Producer | null
  historicoVinculos?: {
    administradorId?: string
    usuarioId?: string
    origem?: string
    anterior?: string
    novo?: string
    data: string
  }[]
}
interface Producer {
  _id: string
  nomeEmpresa: string
  documento: { tipo: string; numero: string }
  contato: { telefone: string }
  contasVinculadas?: { id: string; nome: string; email: string }[]
}
export function UserLinksPage() {
  const page = useManagementPage<User>('/api/gestao/usuarios')
  const [user, setUser] = useState<User | null>(null),
    [producer, setProducer] = useState<Producer | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  async function save(produtorId: string | null) {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      await apiRequest(`/api/gestao/usuarios/${user._id}/vinculo`, {
        method: 'PUT',
        body: { produtorId },
        authenticated: true,
      })
      setUser(null)
      setProducer(null)
      page.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao vincular')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Vincular usuários</h1>
      <p>
        Use esta área para corrigir problemas no vínculo automático ou atender
        solicitações de suporte.
      </p>
      <p>
        Busque e selecione o produtor pelo nome, WhatsApp ou número do
        documento.
      </p>
      <input
        aria-label="Buscar conta por nome ou e-mail"
        placeholder="Nome ou e-mail"
        className="w-full rounded-lg border p-3"
        value={page.search}
        onChange={(e) => page.setSearch(e.target.value)}
      />
      {page.error && <p role="alert">{page.error}</p>}
      {page.loading ? (
        <p role="status">Carregando...</p>
      ) : !page.data.items.length ? (
        <p>Nenhuma conta encontrada.</p>
      ) : (
        <ul className="space-y-3">
          {page.data.items.map((u) => (
            <li
              key={u._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5"
            >
              <div>
                <h2 className="font-bold">{u.nome}</h2>
                <p>{u.email}</p>
                <CurrentLink user={u} />
              </div>
              <Button
                onClick={() => {
                  setUser(u)
                  setProducer(null)
                  setError('')
                }}
              >
                Gerenciar vínculo
              </Button>
            </li>
          ))}
        </ul>
      )}
      <CatalogPagination {...page.pagination} />
      {user && (
        <Modal
          title={`Vincular ${user.nome}`}
          size="small"
          onClose={() => {
            if (!busy) setUser(null)
          }}
        >
          <div className="space-y-4">
            <p>{user.email}</p>
            <CurrentLink user={user} />
            <ProducerPicker
              key={user._id}
              disabled={busy}
              onSelect={(selected) => {
                setProducer(selected)
                setError('')
              }}
              onSearchChange={() => setProducer(null)}
            />
            {producer && (
              <div className="space-y-3 rounded border p-4">
                <p className="font-bold">{producer.nomeEmpresa}</p>
                <p>
                  {producer.documento.tipo}: {producer.documento.numero}
                </p>
                <p>WhatsApp: {producer.contato.telefone}</p>
                <Button disabled={busy} onClick={() => void save(producer._id)}>
                  Confirmar vínculo
                </Button>
              </div>
            )}
            {error && <p role="alert">{error}</p>}
            <div className="flex flex-wrap gap-3">
              {user.produtorId && (
                <Button disabled={busy} onClick={() => void save(null)}>
                  Remover vínculo
                </Button>
              )}
              <Button disabled={busy} onClick={() => setUser(null)}>
                Fechar
              </Button>
            </div>
            <details>
              <summary>Histórico de vínculos</summary>
              {user.historicoVinculos?.map((h, i) => (
                <p key={i} className="mt-2 text-sm">
                  {new Date(h.data).toLocaleString('pt-BR')} ·{' '}
                  {h.anterior ?? 'Sem vínculo'} → {h.novo ?? 'Sem vínculo'} ·
                  {h.origem === 'PRE_CADASTRO'
                    ? 'Vínculo automático após confirmação do pré-cadastro'
                    : h.origem === 'INSCRICAO'
                      ? 'Vínculo automático pela nova inscrição'
                      : `Correção manual pelo administrador ${h.administradorId ?? ''}`}
                </p>
              ))}
            </details>
          </div>
        </Modal>
      )}
    </main>
  )
}

function ProducerPicker({
  disabled,
  onSelect,
  onSearchChange,
}: {
  disabled: boolean
  onSelect: (producer: Producer) => void
  onSearchChange: () => void
}) {
  const page = useManagementPage<Producer>('/api/gestao/produtores')
  return (
    <div className="space-y-3">
      <label className="block">
        Nome, WhatsApp ou número do documento
        <input
          disabled={disabled}
          className="block w-full rounded border p-3"
          placeholder="Digite o nome, telefone ou documento"
          value={page.search}
          onChange={(e) => {
            onSearchChange()
            page.setSearch(e.target.value)
          }}
        />
      </label>
      {page.loading ? (
        <p role="status">Buscando produtores...</p>
      ) : page.error ? (
        <div role="alert">
          <p>{page.error}</p>
          <Button onClick={page.reload}>Tentar novamente</Button>
        </div>
      ) : !page.data.items.length ? (
        <p>Nenhum produtor encontrado.</p>
      ) : (
        <ul aria-label="Produtores encontrados" className="space-y-2">
          {page.data.items.map((producer) => (
            <li key={producer._id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(producer)}
                className="w-full rounded-lg border p-3 text-left transition hover:border-primary focus-visible:outline-primary disabled:opacity-50"
              >
                <span className="block font-bold">{producer.nomeEmpresa}</span>
                <span className="block text-sm">
                  WhatsApp: {producer.contato.telefone}
                </span>
                <span className="block text-sm">
                  {producer.documento.tipo}: {producer.documento.numero}
                </span>
                <span className="mt-2 block text-sm">
                  {producer.contasVinculadas?.length ? (
                    <>
                      Contas vinculadas:
                      {producer.contasVinculadas.map((account) => (
                        <span key={account.id} className="block">
                          {account.nome} — {account.email}
                        </span>
                      ))}
                    </>
                  ) : (
                    'Nenhuma conta vinculada'
                  )}
                </span>
                <span className="mt-2 block text-sm font-semibold text-primary">
                  Selecionar produtor
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <CatalogPagination {...page.pagination} />
    </div>
  )
}

function CurrentLink({ user }: { user: User }) {
  if (!user.produtorId)
    return <p className="text-sm text-text-muted">Sem vínculo</p>
  const producer = user.produtorVinculado
  if (!producer)
    return <p className="text-sm">O produtor vinculado não foi encontrado.</p>
  return (
    <div className="mt-2 rounded-lg bg-background p-3 text-sm">
      <p className="font-semibold">
        Produtor vinculado: {producer.nomeEmpresa}
      </p>
      <p>WhatsApp: {producer.contato.telefone}</p>
      <p>
        {producer.documento.tipo}: {producer.documento.numero}
      </p>
    </div>
  )
}
