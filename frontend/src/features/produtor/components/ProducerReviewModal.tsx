import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { ReviewActions } from '../../../shared/components/ReviewActions'
import type { Producer } from '../types'

interface ProducerReviewModalProps {
  producer: Producer
  disabled: boolean
  onClose: () => void
  onApprove: (id: string) => Promise<boolean>
  onReject: (id: string, reason: string) => Promise<boolean>
}

export function ProducerReviewModal({
  producer,
  disabled,
  onClose,
  onApprove,
  onReject,
}: ProducerReviewModalProps) {
  const isRejected = producer.status === 'REJEITADO'

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
      ) : (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
          Pendente
        </span>
      )}

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

      {!isRejected ? (
        <ReviewActions
          disabled={disabled}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <Button disabled={disabled} onClick={handleApprove}>
            Reconsiderar e aprovar
          </Button>
        </div>
      )}
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
