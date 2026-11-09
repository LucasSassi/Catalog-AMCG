import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { WhatsAppIcon } from '../../../shared/components/WhatsAppIcon'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { buildProductWhatsAppUrl } from '../lib/whatsapp'
import type { CatalogProduct } from '../types'

const VISIBLE_COUNT_DESKTOP = 3
const VISIBLE_COUNT_MOBILE = 2
const MOBILE_MEDIA_QUERY = '(max-width: 639px)'
const SLIDE_DURATION_MS = 300

function subscribeToMobileQuery(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

function getVisibleCount(): number {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
    ? VISIBLE_COUNT_MOBILE
    : VISIBLE_COUNT_DESKTOP
}

function getServerVisibleCount(): number {
  return VISIBLE_COUNT_DESKTOP
}

function useVisibleCount(): number {
  return useSyncExternalStore(
    subscribeToMobileQuery,
    getVisibleCount,
    getServerVisibleCount,
  )
}

interface SimilarProductsCarouselProps {
  title: string
  previousLabel: string
  nextLabel: string
  loadingLabel: string
  products: CatalogProduct[]
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  isLoading: boolean
}

export function SimilarProductsCarousel({
  title,
  previousLabel,
  nextLabel,
  loadingLabel,
  products,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isLoading,
}: SimilarProductsCarouselProps) {
  const visibleCount = useVisibleCount()
  const [startIndex, setStartIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [skipTransition, setSkipTransition] = useState(false)
  const pendingEdge = useRef<'start' | 'end' | null>(null)
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSkipTransition(true)
    setIsAnimating(false)

    if (pendingEdge.current === 'end') {
      const lastWindowStart = Math.max(0, products.length - visibleCount)
      setStartIndex(lastWindowStart)
    } else {
      setStartIndex(0)
    }
    pendingEdge.current = null

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSkipTransition(false)
      })
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [products, visibleCount])

  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [])

  if (!isLoading && products.length === 0) {
    return null
  }

  const maxStartIndex = Math.max(0, products.length - visibleCount)
  const canGoPrevious = startIndex > 0 || hasPrevious
  const canGoNext = startIndex < maxStartIndex || hasNext
  const trackWidthPercent =
    products.length > 0 ? (products.length / visibleCount) * 100 : 100
  const translatePercent =
    products.length > 0 ? (startIndex / products.length) * 100 : 0
  const itemWidthPercent =
    products.length > 0 ? 100 / products.length : 100 / visibleCount

  function beginSlide(nextIndex: number): void {
    setIsAnimating(true)
    setStartIndex(nextIndex)

    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current)
    }

    animationTimeout.current = setTimeout(() => {
      setIsAnimating(false)
      animationTimeout.current = null
    }, SLIDE_DURATION_MS)
  }

  function handlePrevious(): void {
    if (isAnimating) {
      return
    }

    if (startIndex > 0) {
      beginSlide(Math.max(0, startIndex - visibleCount))
      return
    }

    if (!hasPrevious) {
      return
    }

    pendingEdge.current = 'end'
    onPrevious()
  }

  function handleNext(): void {
    if (isAnimating) {
      return
    }

    if (startIndex < maxStartIndex) {
      beginSlide(Math.min(maxStartIndex, startIndex + visibleCount))
      return
    }

    if (!hasNext) {
      return
    }

    pendingEdge.current = 'start'
    onNext()
  }

  const navButtonClass =
    'flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#cfdcd2] bg-white text-foreground transition hover:bg-secondary-background disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <section className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h2>
        {canGoPrevious || canGoNext ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={previousLabel}
              onClick={handlePrevious}
              disabled={!canGoPrevious || isAnimating}
              className={navButtonClass}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={handleNext}
              disabled={!canGoNext || isAnimating}
              className={navButtonClass}
            >
              <ChevronRightIcon />
            </button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-text-muted">
          {loadingLabel}
        </p>
      ) : (
        <div className="-mx-1.5 overflow-hidden sm:-mx-2.5">
          <div
            className={`flex ${
              skipTransition ? '' : 'transition-transform duration-300 ease-out'
            }`}
            style={{
              width: `${trackWidthPercent}%`,
              transform: `translateX(-${translatePercent}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="box-border shrink-0 px-1.5 pb-2 sm:px-2.5"
                style={{ width: `${itemWidthPercent}%` }}
              >
                <ProductCarouselCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ProductCarouselCard({ product }: { product: CatalogProduct }) {
  const whatsappUrl = buildProductWhatsAppUrl(product)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,59,37,.10)] sm:rounded-[1.375rem]">
      <Link
        to={`/produtos/${product.id}`}
        className="flex min-w-0 flex-1 flex-col"
      >
        <img
          src={buildThumbnailUrl(
            product.fotoDivulgacao.url,
            THUMBNAIL_WIDTH.card,
          )}
          alt={product.nome}
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full bg-slate-100 object-cover"
        />
        <span className="flex flex-col gap-1 px-3 pt-3 sm:gap-1.5 sm:px-4.5 sm:pt-4">
          <span className="line-clamp-2 text-sm font-bold leading-snug text-foreground sm:text-[17px]">
            {product.nome}
          </span>
          <span className="line-clamp-2 text-xs leading-normal text-text-muted sm:text-sm">
            {product.descricaoBreve}
          </span>
        </span>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-3 pt-3 sm:gap-3 sm:px-4.5 sm:pb-4.5 sm:pt-4">
        <p className="min-w-0 truncate text-[15px] font-extrabold text-foreground sm:text-lg">
          {formatCurrency(product.valorCentavos)}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Comprar ${product.nome} pelo WhatsApp`}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary-background text-sm font-bold text-primary-darker transition hover:bg-primary hover:text-white sm:px-4"
        >
          <WhatsAppIcon size={16} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </article>
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
      strokeWidth="2.5"
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
