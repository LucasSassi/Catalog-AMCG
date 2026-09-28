import { Link } from 'react-router-dom'
import logoPlaceholder from '../../../shared/assets/logo-catalogo-campos-gerais.png'
import type { CatalogProducer } from '../types'

interface FeaturedProducersStripProps {
  producers: CatalogProducer[]
}

export function FeaturedProducersStrip({
  producers,
}: FeaturedProducersStripProps) {
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {producers.map((producer) => (
        <Link
          key={producer.id}
          to="/produtores"
          className="flex min-w-[80%] snap-start items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-0"
        >
          <img
            src={logoPlaceholder}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="h-16 w-16 shrink-0 rounded-full border border-slate-200 bg-white object-contain p-1.5"
          />
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
              {producer.nome}
            </h3>
            <p className="mt-1 truncate text-xs text-slate-600">
              {producer.municipio}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
