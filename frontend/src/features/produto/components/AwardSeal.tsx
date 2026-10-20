import { useState } from 'react'
import premiadoBadge from '../../../shared/assets/premiado.png'
import { Modal } from '../../../shared/components/Modal'
import type { CatalogProductDetail } from '../types'

type CatalogAward = CatalogProductDetail['premiacoes'][number]

interface AwardSealProps {
  premiacoes: CatalogAward[]
}

function formatAwardSummary(award: CatalogAward): string {
  return `${award.nome} (${award.ano})`
}

export function AwardSeal({ premiacoes }: AwardSealProps) {
  const [isHintVisible, setIsHintVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (premiacoes.length === 0) {
    return null
  }

  const summary = premiacoes.map(formatAwardSummary).join(', ')

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label={`Produto premiado. ${summary}. Clique para ver detalhes.`}
          title={summary}
          onMouseEnter={() => setIsHintVisible(true)}
          onMouseLeave={() => setIsHintVisible(false)}
          onFocus={() => setIsHintVisible(true)}
          onBlur={() => setIsHintVisible(false)}
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-yellow"
        >
          <img
            src={premiadoBadge}
            alt=""
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            className="h-32 w-32 object-contain drop-shadow"
          />
        </button>
        {isHintVisible ? (
          <p
            role="tooltip"
            className="absolute right-0 top-12 z-20 w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-4 text-slate-800 shadow-md lg:left-full lg:right-auto lg:top-0 lg:ml-2"
          >
            {premiacoes.map((award) => (
              <span key={`${award.nome}-${award.ano}`} className="block">
                {formatAwardSummary(award)}
              </span>
            ))}
          </p>
        ) : null}
      </div>

      {isModalOpen ? (
        <Modal title="Premiações" onClose={() => setIsModalOpen(false)}>
          <ul className="space-y-4 text-sm leading-6 text-slate-700">
            {premiacoes.map((award) => (
              <li
                key={`${award.nome}-${award.ano}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-900">
                  {award.nome}
                  <span className="ml-2 font-medium text-slate-500">
                    {award.ano}
                  </span>
                </p>
                <p className="mt-2">{award.descricao}</p>
              </li>
            ))}
          </ul>
        </Modal>
      ) : null}
    </>
  )
}
