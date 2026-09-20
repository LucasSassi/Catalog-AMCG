import { Link } from 'react-router-dom'
import logoPlaceholder from '../../../shared/assets/logo-catalogo-campos-gerais.png'
import type { CatalogProducer } from '../types'

interface FeaturedProducersRowProps {
  producers: CatalogProducer[]
}

export function FeaturedProducersRow({ producers }: FeaturedProducersRowProps) {
  if (producers.length === 0) {
    return null
  }

  return (
    <section
      id="produtores-destaque"
      className="scroll-mt-28 border-b border-slate-200 bg-brand-900/5 py-10"
    >
      <div className="mx-auto flex max-w-7xl items-stretch gap-4 px-4 sm:px-6 lg:px-8">
        <p className="hidden w-8 shrink-0 items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-brand-800 [writing-mode:vertical-rl] rotate-180 sm:flex">
          Produtores
        </p>

        <div className="min-w-0 flex-1 rounded-3xl border border-white/70 bg-white/40 p-4 backdrop-blur sm:p-6">
          <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wide text-brand-900 sm:hidden">
            Produtores de Destaque
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {producers.slice(0, 3).map((producer, index) => {
              const isCenter = index === 1 || producers.length === 1

              return (
                <Link
                  key={producer.id}
                  to="/produtores"
                  className={`flex flex-col items-center rounded-3xl border p-5 text-center transition hover:-translate-y-0.5 ${
                    isCenter
                      ? 'border-transparent bg-white shadow-md'
                      : 'border-white/80 bg-white/55'
                  }`}
                >
                  <img
                    src={logoPlaceholder}
                    alt=""
                    className="h-20 w-20 rounded-full border border-slate-200 bg-white object-contain p-2"
                  />
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {producer.nome}
                  </h3>
                  <span
                    className={`mt-4 inline-flex rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                      isCenter
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-700'
                    }`}
                  >
                    {producer.municipio}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
