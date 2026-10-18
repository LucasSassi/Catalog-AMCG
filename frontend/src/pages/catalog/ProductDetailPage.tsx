import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProducerInfoModal } from '../../features/produto/components/ProducerInfoModal'
import { useCatalogProduct } from '../../features/produto/hooks/useCatalogProduct'
import { useCatalogProducts } from '../../features/produto/hooks/useCatalogProducts'
import { buildProductWhatsAppUrl } from '../../features/produto/lib/whatsapp'
import { PRODUCT_CATEGORY_LABELS } from '../../features/produto/constants'
import type { CatalogFilters } from '../../features/produto/types'
import logoPlaceholder from '../../shared/assets/logo-catalogo-campos-gerais.png'
import premiadoBadge from '../../shared/assets/premiado.png'
import { Feedback } from '../../shared/components/Feedback'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../shared/lib/formatCurrency'

const emptyFilters: CatalogFilters = {
  busca: '',
  categoria: '',
  municipio: '',
  certificacao: '',
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { product, isLoading, error } = useCatalogProduct(id)
  const { products } = useCatalogProducts(emptyFilters)
  const [isProducerOpen, setIsProducerOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isPremiadoHintOpen, setIsPremiadoHintOpen] = useState(false)
  const [isSimHintOpen, setIsSimHintOpen] = useState(false)

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
  const categoryLabel =
    PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria
  const producerProducts = products.filter(
    (item) => item.produtor.id === product.produtor.id,
  )

  return (
    <main className="bg-stone-100 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-bold uppercase tracking-[0.25em] text-primary-darker">
          Campos Gerais
        </p>

        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-slate-100 sm:order-2">
                <img
                  src={buildThumbnailUrl(mainPhoto.url, THUMBNAIL_WIDTH.detail)}
                  alt={product.nome}
                  width={1200}
                  height={900}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                {product.premiado ? (
                  <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-2">
                    <button
                      type="button"
                      aria-expanded={isPremiadoHintOpen}
                      aria-controls="premiado-hint"
                      onClick={() =>
                        setIsPremiadoHintOpen((current) => !current)
                      }
                      className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-yellow"
                    >
                      <img
                        src={premiadoBadge}
                        alt="Produto premiado"
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        className="h-14 w-14 object-contain drop-shadow"
                      />
                    </button>
                    {isPremiadoHintOpen ? (
                      <p
                        id="premiado-hint"
                        className="w-full max-w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white"
                      >
                        Ver produtos premiados. O produtor deve informar e
                        comprovar prêmios.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {photos.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:w-16 sm:shrink-0 sm:flex-col sm:overflow-visible sm:pb-0">
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo.url}-${index}`}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
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
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {categoryLabel}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {product.nome}
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {product.descricao}
              </p>
              <p className="mt-6 text-3xl font-bold text-slate-900">
                {formatCurrency(product.valorCentavos)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                por {product.unidadeMedida}
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-darker sm:w-auto"
              >
                WhatsApp
              </a>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  {product.produtor.temRegistroSim ? (
                    <button
                      type="button"
                      aria-expanded={isSimHintOpen}
                      aria-controls="sim-hint"
                      title="SIM – Inspeção Municipal: comercialização somente dentro dos respectivos municípios"
                      onClick={() => setIsSimHintOpen((current) => !current)}
                      className="inline-flex min-h-11 items-center rounded-md bg-stone-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-800"
                    >
                      {product.produtor.municipio}
                    </button>
                  ) : (
                    <span
                      className="inline-flex min-h-11 items-center rounded-md bg-stone-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-800"
                      title={product.produtor.municipio}
                    >
                      {product.produtor.municipio}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsProducerOpen(true)}
                    className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-success"
                  >
                    <img
                      src={logoPlaceholder}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-md bg-white object-contain"
                    />
                    <span>
                      <span className="block text-xs uppercase tracking-wide text-slate-500">
                        Produtor
                      </span>
                      <span className="block text-sm font-bold text-foreground">
                        {product.produtor.nome}
                      </span>
                    </span>
                  </button>
                </div>

                {product.produtor.temRegistroSim && isSimHintOpen ? (
                  <p
                    id="sim-hint"
                    className="mt-3 w-full max-w-full rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-white"
                  >
                    SIM – Inspeção Municipal: comercialização somente dentro dos
                    respectivos municípios.
                  </p>
                ) : null}
              </div>

              {product.registros.length > 0 ? (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Certificações do produto
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.registros.map((registro) => (
                      <span
                        key={registro.tipo}
                        className="rounded-full bg-secondary-background px-3 py-1 text-xs font-semibold text-primary-dark"
                      >
                        {registro.tipo}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

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
          producer={product.produtor}
          products={producerProducts}
          onClose={() => setIsProducerOpen(false)}
        />
      ) : null}
    </main>
  )
}
