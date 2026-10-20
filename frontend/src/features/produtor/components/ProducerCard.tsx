import logoPlaceholder from '../../../shared/assets/logo-catalogo-campos-gerais.png'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import type { CatalogProducer } from '../types'

interface ProducerCardProps {
  producer: CatalogProducer
  onSelect: (producerId: string) => void
}

export function ProducerCard({ producer, onSelect }: ProducerCardProps) {
  const hasLogo = Boolean(producer.logo)
  const cover = producer.logo ?? producer.fotos[0]
  const imageSrc = cover
    ? buildThumbnailUrl(cover.url, THUMBNAIL_WIDTH.card)
    : logoPlaceholder
  const containsImage = hasLogo || !cover
  const imageAlt = hasLogo ? `Logo de ${producer.nome}` : ''

  return (
    <article className="[contain-intrinsic-size:auto_320px] [content-visibility:auto] sm:[contain-intrinsic-size:auto_420px]">
      <button
        type="button"
        onClick={() => onSelect(producer.id)}
        className="group flex h-full w-full flex-col rounded-2xl border border-slate-300 bg-white p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-success hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:rounded-3xl sm:p-3"
      >
        <div
          className={`relative aspect-square overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl ${
            containsImage ? 'p-6' : ''
          }`}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={600}
            loading="lazy"
            decoding="async"
            className={`h-full w-full transition duration-300 group-hover:scale-105 ${
              containsImage ? 'object-contain' : 'object-cover'
            }`}
          />
          {producer.destaque ? (
            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-primary-darker shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
              Destaque
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-1 pt-3 sm:px-2 sm:pt-4">
          <h2 className="line-clamp-2 text-center text-sm font-bold leading-5 text-slate-900 sm:text-lg sm:leading-7">
            {producer.nome}
          </h2>
          <p className="mt-2 truncate text-center text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-[11px]">
            {producer.municipio}
          </p>
        </div>
      </button>
    </article>
  )
}
