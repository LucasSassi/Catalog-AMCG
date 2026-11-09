import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AwardSeal } from '../../features/produto/components/AwardSeal'
import { SealBadge } from '../../features/produto/components/SealBadge'
import { SimilarProductsCarousel } from '../../features/produto/components/SimilarProductsCarousel'
import {
  SEAL_INFO_TYPES,
  type SealInfoType,
} from '../../features/produto/constants'
import { useCatalogProduct } from '../../features/produto/hooks/useCatalogProduct'
import { useProducerProducts } from '../../features/produto/hooks/useProducerProducts'
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
  const doProdutor = useProducerProducts(product?.produtor.id, product?.id)
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
  const price = formatCurrency(product.valorCentavos)
  // Registros "Outro" mostram o nome informado (ex.: "SIM", "SESA-PR").
  const registroLabels = [
    ...new Set(
      product.registros.map((registro) =>
        registro.tipo === 'Outro' && registro.tipoOutros
          ? registro.tipoOutros.trim()
          : registro.tipo,
      ),
    ),
  ]
  const sealTypes = [
    ...new Set<SealInfoType>([
      ...(product.produtor.temRegistroSim ? (['SIM'] as const) : []),
      ...registroLabels.filter(isSealInfoType),
    ]),
  ]
  const otherRegistros = registroLabels.filter(
    (label) => !isSealInfoType(label),
  )
  const hasSeals = sealTypes.length > 0 || otherRegistros.length > 0

  return (
    <main className="bg-background-secondary pt-6 sm:pt-8 lg:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:gap-7 sm:px-6 lg:px-8">
        <nav aria-label="Navegação">
          <Link
            to="/#produtos"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-darker transition hover:text-primary-dark"
          >
            <ChevronLeftIcon />
            Voltar ao catálogo
          </Link>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm sm:rounded-[1.75rem]">
              <img
                src={buildThumbnailUrl(mainPhoto.url, THUMBNAIL_WIDTH.detail)}
                alt={product.nome}
                width={1200}
                height={1200}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
              {product.premiado ? (
                <div className="absolute left-3.5 top-3.5 sm:left-5 sm:top-5">
                  <AwardSeal premiacoes={product.premiacoes} />
                </div>
              ) : null}
              {photos.length > 1 ? (
                <span className="absolute bottom-3.5 right-3.5 rounded-full bg-foreground/80 px-3 py-1.5 text-xs font-semibold text-white sm:bottom-5 sm:right-5">
                  {selectedPhotoIndex + 1} / {photos.length}
                </span>
              ) : null}
            </div>

            {photos.length > 1 ? (
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo.url}-${index}`}
                    type="button"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={index === selectedPhotoIndex}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-[2.5px] bg-slate-100 transition hover:-translate-y-0.5 sm:h-21 sm:w-21 ${
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
                      width={84}
                      height={84}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
            <div className="flex flex-col gap-3 sm:gap-3.5">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#eadfca] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4a2c] sm:text-[13px]">
                <PinIcon />
                {product.produtor.municipio}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.08]">
                {product.nome}
              </h1>
              <p className="text-3xl font-extrabold tracking-tight text-primary lg:hidden">
                {price}
              </p>
              <p className="text-base leading-relaxed text-[#3d4b41] sm:text-[17px] sm:leading-[1.65]">
                {product.descricao}
              </p>
            </div>

            <div className="hidden flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(10,59,37,.06),0_8px_24px_rgba(10,59,37,.05)] lg:flex">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Preço
                </span>
                <span className="text-[2.5rem] font-extrabold tracking-tight text-foreground">
                  {price}
                </span>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-primary text-base font-bold text-white transition hover:bg-primary-darker"
              >
                <WhatsAppIcon size={20} />
                Comprar pelo WhatsApp
              </a>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:gap-5 sm:p-5">
              <Link
                to={`/produtores/${product.produtor.id}`}
                aria-label={`Ver informações do produtor ${product.produtor.nome}`}
                className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-border-soft p-2.5 transition hover:border-primary sm:gap-4 sm:p-3"
              >
                <span className="flex h-19 w-23 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-foreground px-1.5 sm:h-24 sm:w-30">
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
                    width={120}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted sm:text-xs">
                    Produtor
                  </span>
                  <span className="text-[15px] font-bold text-foreground sm:text-base">
                    Conheça quem produz
                  </span>
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-background text-primary">
                  <ChevronRightIcon />
                </span>
              </Link>

              {hasSeals ? (
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted sm:text-xs">
                    Selos e registros
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {sealTypes.map((tipo) => (
                      <SealBadge key={tipo} tipo={tipo} />
                    ))}
                    {sealTypes.length > 0 && otherRegistros.length > 0 ? (
                      <span
                        className="hidden h-8 w-px bg-border-soft sm:block"
                        aria-hidden="true"
                      />
                    ) : null}
                    {otherRegistros.map((label) => (
                      <span
                        key={label}
                        className="inline-flex min-h-8 items-center rounded-full bg-secondary-background px-3 text-xs font-bold text-primary-dark"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <SimilarProductsCarousel
          title="Produtos similares"
          previousLabel="Página anterior de produtos similares"
          nextLabel="Próxima página de produtos similares"
          loadingLabel="Carregando produtos similares..."
          products={similares.products}
          hasPrevious={similares.hasPrevious}
          hasNext={similares.hasNext}
          onPrevious={similares.goToPreviousPage}
          onNext={similares.goToNextPage}
          isLoading={similares.isLoading}
        />

        <SimilarProductsCarousel
          title="Outros produtos do produtor"
          previousLabel="Página anterior de produtos do produtor"
          nextLabel="Próxima página de produtos do produtor"
          loadingLabel="Carregando produtos do produtor..."
          products={doProdutor.products}
          hasPrevious={doProdutor.hasPrevious}
          hasNext={doProdutor.hasNext}
          onPrevious={doProdutor.goToPreviousPage}
          onNext={doProdutor.goToNextPage}
          isLoading={doProdutor.isLoading}
        />
      </div>

      <div className="sticky bottom-0 z-30 mt-8 flex items-center gap-3.5 border-t border-border-soft bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(10,59,37,.08)] lg:hidden">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
            Preço
          </span>
          <span className="text-xl font-extrabold text-foreground">
            {price}
          </span>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-white transition hover:bg-primary-darker"
        >
          <WhatsAppIcon size={18} />
          Comprar pelo WhatsApp
        </a>
      </div>
    </main>
  )
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 6 9 12l6 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
