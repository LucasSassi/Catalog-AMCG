import { useState } from 'react'
import { useBackofficeData } from '../../app/backoffice-data'
import {
  approveProducer,
  rejectProducer,
} from '../../features/produtor/api/producers'
import type { Producer } from '../../features/produtor/types'
import { CatalogPagination } from '../../features/produto/components/CatalogPagination'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { RejectionDialog } from '../../shared/components/RejectionDialog'
import { useManagementPage } from '../../shared/lib/useManagementPage'
export function ProducerApprovals() {
  const page = useManagementPage<Producer>('/api/gestao/aprovacoes/produtores')
  const { producers } = useBackofficeData()
  const [selected, setSelected] = useState<Producer | null>(null),
    [rejecting, setRejecting] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function decide(reason?: string) {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      if (reason)
        await rejectProducer(selected.id, reason, selected.revisao ?? 0)
      else await approveProducer(selected.id, selected.revisao ?? 0)
      setSelected(null)
      setRejecting(false)
      page.reload()
      producers.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao analisar perfil')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold">Produtores aguardando aprovação</h2>
      <p>{page.data.total ?? 0} perfis pendentes</p>
      <input
        aria-label="Buscar produtores pendentes"
        className="w-full rounded border p-3"
        placeholder="Buscar por nome"
        value={page.search}
        onChange={(e) => page.setSearch(e.target.value)}
      />
      {page.error && <p role="alert">{page.error}</p>}
      {page.loading ? (
        <p role="status">Carregando...</p>
      ) : !page.data.items.length ? (
        <p>Nenhum perfil aguardando aprovação.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {page.data.items.map((producer) => (
            <article
              className="space-y-3 rounded-xl border bg-white p-5"
              key={producer.id}
            >
              {producer.logo && (
                <img
                  className="h-24 w-24 object-contain"
                  src={producer.logo.url}
                  alt={producer.nomeEmpresa}
                />
              )}
              <h3 className="text-lg font-bold">{producer.nomeEmpresa}</h3>
              <p>
                {producer.origemPendencia === 'ALTERACAO'
                  ? 'Alteração de perfil'
                  : 'Novo cadastro'}
              </p>
              <p>{producer.endereco.cidade}</p>
              <Button
                onClick={() => {
                  setSelected(producer)
                  setError('')
                }}
              >
                Revisar perfil
              </Button>
            </article>
          ))}
        </div>
      )}
      <CatalogPagination {...page.pagination} />
      {selected && (
        <Modal
          title={`Revisar ${selected.nomeEmpresa}`}
          onClose={() => {
            if (!busy) setSelected(null)
          }}
        >
          <div className="space-y-4">
            {selected.camposAlterados?.length ? (
              <p>
                Alterações em:{' '}
                {selected.camposAlterados
                  .map(
                    (field) =>
                      ({
                        nomeEmpresa: 'nome',
                        historia: 'história',
                        logo: 'logo',
                        fotos: 'fotos',
                        contato: 'contatos',
                        endereco: 'endereço',
                        documento: 'documento',
                        site: 'site',
                        registros: 'registros',
                        municipioId: 'município',
                        exibirEndereco: 'exibição do endereço',
                        redesSociais: 'redes sociais',
                      })[field] ?? field,
                  )
                  .join(', ')}
              </p>
            ) : null}
            {selected.logo && (
              <img
                src={selected.logo.url}
                alt="Logo do produtor"
                className="h-32 w-32 object-contain"
              />
            )}
            <p className="whitespace-pre-wrap">{selected.historia}</p>
            <p>
              {selected.documento.tipo}: {selected.documento.numero}
            </p>
            <p>WhatsApp: {selected.contato.telefone}</p>
            <p>E-mail: {selected.contato.email}</p>
            <p>
              Endereço: {selected.endereco.rua}, {selected.endereco.bairro},{' '}
              {selected.endereco.cidade}/{selected.endereco.estado} · CEP{' '}
              {selected.endereco.cep}
            </p>
            <p>Exibir endereço: {selected.exibirEndereco ? 'Sim' : 'Não'}</p>
            <p>
              Registros:{' '}
              {selected.registros
                .map(
                  (r) =>
                    `${r.tipo === 'Outro' ? r.tipoOutros : r.tipo}: ${r.numero}`,
                )
                .join('; ')}
            </p>
            {selected.site && <p>Site: {selected.site}</p>}
            {selected.redesSociais.map((r) => (
              <p key={r.tipo}>
                {r.tipo}: {r.handle}
              </p>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {selected.fotos.map((f, i) => (
                <img
                  key={i}
                  src={f.url}
                  alt={f.nomeOriginal}
                  className="w-full rounded object-contain"
                />
              ))}
            </div>
            {error && <p role="alert">{error}</p>}
            <div className="flex gap-3">
              <Button disabled={busy} onClick={() => void decide()}>
                Aprovar perfil
              </Button>
              <Button disabled={busy} onClick={() => setRejecting(true)}>
                Rejeitar
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {selected && rejecting && (
        <RejectionDialog
          itemName={selected.nomeEmpresa}
          description="Explique o que precisa ser corrigido no perfil."
          reasons={[]}
          confirmLabel="Rejeitar perfil"
          disabled={busy}
          onCancel={() => setRejecting(false)}
          onConfirm={(reason) => decide(reason)}
        />
      )}
    </section>
  )
}
