import type { Producer } from '../types'

interface ProducerReviewCardProps {
  producer: Producer
  onSelect: (producer: Producer) => void
}

export function ProducerReviewCard({
  producer,
  onSelect,
}: ProducerReviewCardProps) {
  let statusClasses = 'bg-amber-100 text-amber-800'
  let statusLabel = 'Pendente'

  if (producer.status === 'REJEITADO') {
    statusClasses = 'bg-red-100 text-red-800'
    statusLabel = 'Rejeitado'
  }

  if (producer.status === 'APROVADO') {
    statusClasses = 'bg-green-100 text-green-800'
    statusLabel = 'Aprovado'
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(producer)}
      className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-slate-900">
          {producer.nomeEmpresa}
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
        >
          {statusLabel}
        </span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-slate-500">Documento</dt>
          <dd className="font-medium">
            {producer.documento.tipo} · {producer.documento.numero}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Município</dt>
          <dd className="font-medium">{producer.endereco.cidade}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Contato</dt>
          <dd className="font-medium">{producer.contato.telefone}</dd>
          <dd className="break-all text-slate-600">{producer.contato.email}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Endereço</dt>
          <dd className="font-medium">
            {producer.endereco.rua}, {producer.endereco.bairro} ·{' '}
            {producer.endereco.cidade}/{producer.endereco.estado}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Registros</dt>
          <dd className="font-medium">
            {producer.registros.map((item) => item.tipo).join(', ')}
          </dd>
        </div>
      </dl>

      {producer.motivoRejeicao ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <strong>Motivo:</strong> {producer.motivoRejeicao}
        </p>
      ) : null}

      <p className="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-brand-700">
        Clique para analisar o cadastro
      </p>
    </button>
  )
}
