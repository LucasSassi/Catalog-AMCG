import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AwardSeal } from '../../features/produto/components/AwardSeal'
import { ProducerInfoModal } from '../../features/produto/components/ProducerInfoModal'
import { SealBadge } from '../../features/produto/components/SealBadge'
import { SimilarProductsCarousel } from '../../features/produto/components/SimilarProductsCarousel'
import {
  SEAL_INFO_TYPES,
  type SealInfoType,
} from '../../features/produto/constants'
import { useCatalogProduct } from '../../features/produto/hooks/useCatalogProduct'
import { useSimilarProducts } from '../../features/produto/hooks/useSimilarProducts'
import { buildProductWhatsAppUrl } from '../../features/produto/lib/whatsapp'
import logoPlaceholder from '../../shared/assets/logo-catalogo-campos-gerais.png'
import { Feedback } from '../../shared/components/Feedback'
import { WhatsAppIcon } from '../../shared/components/WhatsAppIcon'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../shared/lib/formatCurrency'

function isSealInfoType(tipo: string): tipo is SealInfoType {
  return (SEAL_INFO_TYPES as readonly string[]).includes(tipo)
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { product, isLoading, error } = useCatalogProduct(id)
  const similares = useSimilarProducts(product?.categoria, product?.id)
  const [isProducerOpen, setIsProducerOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  useEffect(() => {
    setSelectedPhotoIndex(0)
  }, [product?.id])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Feedback title="Carregando produto..." />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Feedback
          tone="error"
          title="Produto não encontrado"
          description={error || 'Este produto não está disponível no catálogo.'}
        />
        <Link
          to="/"
          className="mt-4 inline-flex text-sm font-semibold text-primary-darker hover:underline"
        >
          Voltar ao catálogo
        </Link>
      </main>
    )
  }

  const photos =
    product.fotosDivulgacao.length > 0
      ? product.fotosDivulgacao
      : [product.fotoDivulgacao]
  const mainPhoto = photos[selectedPhotoIndex] ?? photos[0]
  const whatsappUrl = buildProductWhatsAppUrl(product)
  const producerLogoUrl = product.produtor.logo?.url
  const sealTypes = [
    ...new Set<SealInfoType>([
      ...(product.produtor.temRegistroSim ? (['SIM'] as const) : []),
      ...product.registros
        .map((registro) => registro.tipo)
        .filter(isSealInfoType),
    ]),
  ]
  const otherRegistros = product.registros.filter(
    (registro) => !isSealInfoType(registro.tipo),
  )

  return (
    <main className="bg-background-secondary py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-visible rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-8 overflow-visible lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="relative flex flex-col gap-3 overflow-visible sm:flex-row">
              <div className="flex shrink-0 flex-row gap-2 overflow-x-auto sm:w-[4.5rem] sm:flex-col sm:overflow-y-auto sm:overflow-x-visible">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border-2 ${
                      index === selectedPhotoIndex
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={buildThumbnailUrl(
                        photo.url,
                        THUMBNAIL_WIDTH.gallery,
                      )}
                      alt=""
                      width={72}
                      height={72}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="relative min-w-0 flex-1 overflow-visible">
                <div className="relative overflow-visible rounded-2xl bg-slate-100">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={buildThumbnailUrl(
                        mainPhoto.url,
                        THUMBNAIL_WIDTH.detail,
                      )}
                      alt={product.nome}
                      width={1200}
                      height={900}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover lg:aspect-square"
                    />
                  </div>
                  {product.premiado ? (
                    <div className="absolute -right-10 -top-10 z-10">
                      <AwardSeal premiacoes={product.premiacoes} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {product.nome}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {product.descricao}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(product.valorCentavos)}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-darker"
                >
                  <WhatsAppIcon size={16} />
                  WhatsApp
                </a>
              </div>

              <div className="mt-auto border-t border-slate-200 pt-8 lg:mt-16">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex min-h-9 items-center rounded-lg bg-[#d4c4a8] px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white">
                        {product.produtor.municipio}
                      </span>
                      {sealTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {sealTypes.map((tipo) => (
                            <SealBadge key={tipo} tipo={tipo} />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      aria-label={`Ver informações do produtor ${product.produtor.nome}`}
                      onClick={() => setIsProducerOpen(true)}
                      className="ml-auto inline-flex h-36 w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 px-2 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <img
                        src={
                          producerLogoUrl
                            ? buildThumbnailUrl(
                                producerLogoUrl,
                                THUMBNAIL_WIDTH.card,
                              )
                            : logoPlaceholder
                        }
                        alt=""
                        width={176}
                        height={144}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </button>
                  </div>
                </div>

                {otherRegistros.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {otherRegistros.map((registro) => (
                      <span
                        key={registro.tipo}
                        className="rounded-full bg-secondary-background px-3 py-1 text-xs font-semibold text-primary-dark"
                      >
                        {registro.tipo}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <SimilarProductsCarousel
          products={similares.products}
          hasPrevious={similares.hasPrevious}
          hasNext={similares.hasNext}
          onPrevious={similares.goToPreviousPage}
          onNext={similares.goToNextPage}
          isLoading={similares.isLoading}
        />

        <div className="mt-6 text-center">
          <Link
            to="/#produtos"
            className="text-sm font-semibold text-primary-darker hover:underline"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </div>

      {isProducerOpen ? (
        <ProducerInfoModal
          producerId={product.produtor.id}
          onClose={() => setIsProducerOpen(false)}
        />
      ) : null}
    </main>
  )
}
