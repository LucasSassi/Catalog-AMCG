import { Link } from 'react-router-dom'
import logoPlaceholder from '../../../shared/assets/logo-catalogo-campos-gerais.png'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import type { CatalogProducer } from '../types'

interface FeaturedProducersStripProps {
  producers: CatalogProducer[]
}

/** Produtores em destaque: capa com foto da propriedade e logo sobreposto. */
export function FeaturedProducersStrip({
  producers,
}: FeaturedProducersStripProps) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {producers.map((producer) => {
        const cover = producer.fotos[0]
        const logo = producer.logo ?? producer.fotos[0]

        return (
          <Link
            key={producer.id}
            to={`/produtores/${producer.id}`}
            className="group flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e8dfcf] bg-white text-text shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
          >
            <span className="relative block h-24 bg-surface">
              {cover ? (
                <img
                  src={buildThumbnailUrl(cover.url, THUMBNAIL_WIDTH.card)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : null}
              <img
                src={
                  logo
                    ? buildThumbnailUrl(logo.url, THUMBNAIL_WIDTH.avatar)
                    : logoPlaceholder
                }
                alt=""
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="absolute -bottom-7 left-3.5 h-14 w-14 rounded-full border-[3px] border-white bg-white object-cover shadow-md"
              />
            </span>
            <span className="flex items-end justify-between gap-2 px-3.5 pb-3.5 pt-8">
              <span className="min-w-0">
                <span className="line-clamp-1 block text-[15px] font-extrabold text-foreground">
                  {producer.nome}
                </span>
                <span className="mt-0.5 block truncate text-xs text-text-muted">
                  {producer.municipio}
                </span>
              </span>
              <span className="shrink-0 text-[13px] font-bold text-primary group-hover:text-primary-darker">
                Ver perfil →
              </span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
