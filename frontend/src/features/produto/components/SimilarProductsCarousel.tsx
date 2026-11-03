import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { WhatsAppIcon } from '../../../shared/components/WhatsAppIcon'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { buildProductWhatsAppUrl } from '../lib/whatsapp'
import type { CatalogProduct } from '../types'

const VISIBLE_COUNT = 3
const SLIDE_DURATION_MS = 300

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
  const [startIndex, setStartIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [skipTransition, setSkipTransition] = useState(false)
  const pendingEdge = useRef<'start' | 'end' | null>(null)
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSkipTransition(true)
    setIsAnimating(false)

    if (pendingEdge.current === 'end') {
      const lastWindowStart = Math.max(0, products.length - VISIBLE_COUNT)
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
  }, [products])

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

  const maxStartIndex = Math.max(0, products.length - VISIBLE_COUNT)
  const canGoPrevious = startIndex > 0 || hasPrevious
  const canGoNext = startIndex < maxStartIndex || hasNext
  const trackWidthPercent =
    products.length > 0 ? (products.length / VISIBLE_COUNT) * 100 : 100
  const translatePercent =
    products.length > 0 ? (startIndex / products.length) * 100 : 0
  const itemWidthPercent =
    products.length > 0 ? 100 / products.length : 100 / VISIBLE_COUNT

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
      beginSlide(Math.max(0, startIndex - VISIBLE_COUNT))
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
      beginSlide(Math.min(maxStartIndex, startIndex + VISIBLE_COUNT))
      return
    }

    if (!hasNext) {
      return
    }

    pendingEdge.current = 'start'
    onNext()
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-center sm:mb-6">
        <span className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.2em]">
          {title}
        </span>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-3">
        {canGoPrevious ? (
          <button
            type="button"
            aria-label={previousLabel}
            onClick={handlePrevious}
            disabled={isAnimating}
            className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-50 disabled:cursor-wait sm:h-10 sm:w-10"
          >
            <ChevronLeftIcon />
          </button>
        ) : (
          <div className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" aria-hidden="true" />
        )}

        {isLoading ? (
          <p className="flex-1 py-10 text-center text-sm text-slate-500">
            {loadingLabel}
          </p>
        ) : (
          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              className={`flex ${
                skipTransition
                  ? ''
                  : 'transition-transform duration-300 ease-out'
              }`}
              style={{
                width: `${trackWidthPercent}%`,
                transform: `translateX(-${translatePercent}%)`,
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="box-border shrink-0 px-1 sm:px-2"
                  style={{ width: `${itemWidthPercent}%` }}
                >
                  <ProductCarouselCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {canGoNext ? (
          <button
            type="button"
            aria-label={nextLabel}
            onClick={handleNext}
            disabled={isAnimating}
            className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-50 disabled:cursor-wait sm:h-10 sm:w-10"
          >
            <ChevronRightIcon />
          </button>
        ) : (
          <div className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" aria-hidden="true" />
        )}
      </div>
    </section>
  )
}

function ProductCarouselCard({ product }: { product: CatalogProduct }) {
  const whatsappUrl = buildProductWhatsAppUrl(product)

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm sm:rounded-3xl sm:border-slate-400 sm:p-3">
      <Link to={`/produtos/${product.id}`} className="block min-w-0 flex-1">
        <img
          src={buildThumbnailUrl(
            product.fotoDivulgacao.url,
            THUMBNAIL_WIDTH.card,
          )}
          alt={product.nome}
          width={600}
          height={400}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full rounded-lg object-cover sm:rounded-2xl"
        />
        <h3 className="mt-1.5 line-clamp-2 text-center text-[10px] font-bold leading-tight text-slate-900 sm:mt-3 sm:text-base sm:leading-snug">
          {product.nome}
        </h3>
        <p className="mt-1 line-clamp-2 text-center text-[8px] leading-3 text-slate-600 sm:mt-2 sm:line-clamp-3 sm:text-xs sm:leading-5">
          {product.descricao}
        </p>
      </Link>

      <div className="mt-1.5 flex items-center justify-between gap-1 sm:mt-4 sm:gap-3">
        <p className="min-w-0 truncate text-[9px] font-bold text-slate-900 sm:text-sm">
          {formatCurrency(product.valorCentavos)}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-6 shrink-0 items-center justify-center gap-0.5 rounded-md bg-primary px-1.5 text-[7px] font-bold uppercase tracking-wide text-white transition hover:bg-primary-darker sm:min-h-9 sm:gap-1.5 sm:rounded-lg sm:px-3 sm:text-[10px]"
        >
          WhatsApp
          <span className="sm:hidden">
            <WhatsAppIcon size={10} />
          </span>
          <span className="hidden sm:inline-flex">
            <WhatsAppIcon size={14} />
          </span>
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
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="sm:h-5 sm:w-5"
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
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="sm:h-5 sm:w-5"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
