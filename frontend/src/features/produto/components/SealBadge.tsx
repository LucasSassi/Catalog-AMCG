import { useState } from 'react'
import mapaImg from '../../../shared/assets/mapa.png'
import sifImg from '../../../shared/assets/sif.png'
import simImg from '../../../shared/assets/sim.png'
import { Modal } from '../../../shared/components/Modal'
import { SEAL_INFO, type SealInfoType } from '../constants'

interface SealBadgeProps {
  tipo: SealInfoType
}

const SEAL_IMAGES: Record<SealInfoType, string> = {
  SIM: simImg,
  SIF: sifImg,
  MAPA: mapaImg,
}

export function SealBadge({ tipo }: SealBadgeProps) {
  const [isHintVisible, setIsHintVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const info = SEAL_INFO[tipo]

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label={`Selo ${tipo}. ${info.short}`}
          title={info.short}
          onMouseEnter={() => setIsHintVisible(true)}
          onMouseLeave={() => setIsHintVisible(false)}
          onFocus={() => setIsHintVisible(true)}
          onBlur={() => setIsHintVisible(false)}
          onClick={() => setIsModalOpen(true)}
          className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <img
            src={SEAL_IMAGES[tipo]}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="h-16 w-16 object-contain"
          />
        </button>
        {isHintVisible ? (
          <p
            role="tooltip"
            className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-left text-[11px] leading-4 text-white shadow-lg"
          >
            {info.short}
          </p>
        ) : null}
      </div>

      {isModalOpen ? (
        <Modal title={`Selo ${tipo}`} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-3 px-5 py-4 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-900">{info.short}</p>
            <p>{info.detail}</p>
          </div>
        </Modal>
      ) : null}
    </>
  )
}
