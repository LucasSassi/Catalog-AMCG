import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { ReviewActions } from '../../../shared/components/ReviewActions'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { SOCIAL_NETWORK_LABELS } from '../constants'
import { formatSocialHandle } from '../lib/social-url'
import type { Producer } from '../types'

interface ProducerReviewModalProps {
  producer: Producer
  disabled: boolean
  onClose: () => void
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string, reason: string) => Promise<boolean>
  onToggleDestaque: (id: string, destaque: boolean) => Promise<boolean>
  onEdit: () => void
}

export function ProducerReviewModal({
  producer,
  disabled,
  onClose,
  onApprove,
  onReject,
  onToggleDestaque,
  onEdit,
}: ProducerReviewModalProps) {
  const isRejected = producer.status === 'REJEITADO'
  const isApproved = producer.status === 'APROVADO'
  const fotos = producer.fotos ?? []

  async function handleApprove() {
    const didApprove = await onApprove(producer.id)

    if (didApprove) {
      onClose()
    }
  }

  async function handleReject(reason: string) {
    const didReject = await onReject(producer.id, reason)

    if (didReject) {
      onClose()
    }
  }

  return (
    <Modal title={producer.nomeEmpresa} onClose={onClose}>
      {isRejected ? (
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
          Rejeitado
        </span>
      ) : null}

      {isApproved ? (
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
          Aprovado
        </span>
      ) : null}

      {!isRejected && !isApproved ? (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
          Pendente
        </span>
      ) : null}

      {producer.motivoRejeicao ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-bold uppercase text-red-700">
            Motivo da rejeição
          </p>
          <p className="mt-1 text-sm text-red-900">
            {producer.motivoRejeicao}
          </p>
        </div>
      ) : null}

      {producer.historia ? (
        <div className="mt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            História
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {producer.historia}
          </p>
        </div>
      ) : null}

      {producer.logo ? (
        <div className="mt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Logo
          </h3>
          <img
            src={buildThumbnailUrl(producer.logo.url, THUMBNAIL_WIDTH.avatar)}
            alt={`Logo de ${producer.nomeEmpresa}`}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover"
          />
        </div>
      ) : null}

      {fotos.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Fotos
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {fotos.map((foto, index) => (
              <img
                key={`${foto.url}-${index}`}
                src={buildThumbnailUrl(foto.url, THUMBNAIL_WIDTH.gallery)}
                alt={`Foto ${index + 1} de ${producer.nomeEmpresa}`}
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}

      <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
        <Detail
          label="Documento"
          value={`${producer.documento.tipo}: ${producer.documento.numero}`}
        />
        <Detail label="Município" value={producer.endereco.cidade} />
        <Detail label="Telefone" value={producer.contato.telefone} />
        <Detail label="E-mail" value={producer.contato.email} />
        <Detail
          label="Endereço"
          value={`${producer.endereco.rua}, ${producer.endereco.bairro} · ${producer.endereco.cidade}/${producer.endereco.estado}`}
        />
        <Detail label="Código do município" value={producer.municipioId} />
        {(producer.redesSociais ?? []).map((rede) => (
          <Detail
            key={rede.tipo}
            label={SOCIAL_NETWORK_LABELS[rede.tipo]}
            value={formatSocialHandle(rede)}
          />
        ))}
        {producer.site ? <Detail label="Site" value={producer.site} /> : null}
      </dl>

      <div className="mt-6">
        <h3 className="font-bold text-slate-900">Registros apresentados</h3>
        <div className="mt-3 space-y-2">
          {producer.registros.map((registration) => (
            <div
              key={registration.numero}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
            >
              <span className="font-semibold">{registration.tipo}</span>
              <span className="text-slate-500"> · {registration.numero}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <Button variant="secondary" disabled={disabled} onClick={onEdit}>
          Editar
        </Button>
      </div>

      {!isRejected && !isApproved ? (
        <ReviewActions
          disabled={disabled}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : null}

      {isApproved ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => onToggleDestaque(producer.id, !producer.destaque)}
          >
            {producer.destaque ? 'Remover destaque' : 'Destacar no catálogo'}
          </Button>
        </div>
      ) : null}

      {isRejected ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <Button disabled={disabled} onClick={handleApprove}>
            Reconsiderar e aprovar
          </Button>
        </div>
      ) : null}
    </Modal>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
