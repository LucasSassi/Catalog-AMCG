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
          className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:underline"
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
        <p className="mb-6 text-center text-sm font-bold uppercase tracking-[0.25em] text-brand-700">
          Campos Gerais
        </p>

        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex gap-3">
              {photos.length > 1 ? (
                <div className="flex w-16 shrink-0 flex-col gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo.url}-${index}`}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`overflow-hidden rounded-lg border-2 ${
                        index === selectedPhotoIndex
                          ? 'border-brand-600'
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
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-slate-100">
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
                  <div className="group absolute right-3 top-3">
                    <img
                      src={premiadoBadge}
                      alt="Produto premiado"
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 object-contain drop-shadow"
                    />
                    <span className="pointer-events-none absolute right-0 top-16 z-10 hidden w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white group-hover:block">
                      Ver produtos premiados. O produtor deve informar e
                      comprovar prêmios.
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
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
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-700 sm:w-auto"
              >
                WhatsApp
              </a>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
                <span
                  className="group relative inline-flex rounded-md bg-stone-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-800"
                  title={
                    product.produtor.temRegistroSim
                      ? 'SIM – Inspeção Municipal: comercialização somente dentro dos respectivos municípios'
                      : product.produtor.municipio
                  }
                >
                  {product.produtor.municipio}
                  {product.produtor.temRegistroSim ? (
                    <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-normal normal-case tracking-normal text-white group-hover:block">
                      SIM – Inspeção Municipal: comercialização somente dentro
                      dos respectivos municípios.
                    </span>
                  ) : null}
                </span>

                <button
                  type="button"
                  onClick={() => setIsProducerOpen(true)}
                  className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-brand-500"
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
                    <span className="block text-sm font-bold text-brand-900">
                      {product.produtor.nome}
                    </span>
                  </span>
                </button>
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
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
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
            className="text-sm font-semibold text-brand-700 hover:underline"
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
