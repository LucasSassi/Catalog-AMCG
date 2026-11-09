import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface CarouselBanner {
  id: string
  src: string
  /** Imagem específica para telas pequenas (opcional). */
  srcMobile?: string
  alt: string
  /** Caminho interno (`/produtores`) ou URL externa. */
  link?: string
}

interface BannerCarouselProps {
  banners: CarouselBanner[]
  intervalMs?: number
  isLoading?: boolean
  /** Força o recorte de celular ou de computador (prévia no backoffice). */
  forceVariant?: 'desktop' | 'mobile'
}

const MOBILE_MEDIA = '(max-width: 639px)'

const ASPECT_CLASS = {
  responsive: 'aspect-[16/8] sm:aspect-[16/5]',
  desktop: 'aspect-[16/5]',
  mobile: 'aspect-[16/8]',
} as const

function BannerLinkWrapper({
  link,
  children,
}: {
  link?: string
  children: ReactNode
}) {
  if (!link) {
    return <>{children}</>
  }

  if (link.startsWith('/')) {
    return (
      <Link to={link} className="absolute inset-0 block">
        {children}
      </Link>
    )
  }

  return (
    <a href={link} target="_blank" rel="noreferrer" className="absolute inset-0 block">
      {children}
    </a>
  )
}

export function BannerCarousel({
  banners,
  intervalMs = 6000,
  isLoading = false,
  forceVariant,
}: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const hasMultiple = banners.length > 1
  const safeIndex = activeIndex < banners.length ? activeIndex : 0
  const aspectClass = ASPECT_CLASS[forceVariant ?? 'responsive']

  useEffect(() => {
    if (!hasMultiple || isPaused) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [hasMultiple, banners.length, intervalMs, isPaused])

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className={`w-full bg-foreground/90 motion-safe:animate-pulse ${aspectClass}`}
      />
    )
  }

  if (banners.length === 0) {
    return null
  }

  function goToPrevious(): void {
    setActiveIndex(safeIndex === 0 ? banners.length - 1 : safeIndex - 1)
  }

  function goToNext(): void {
    setActiveIndex((safeIndex + 1) % banners.length)
  }

  return (
    <section
      className="relative overflow-hidden bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Banners de divulgação"
    >
      <div className={`relative w-full ${aspectClass}`}>
        {banners.map((banner, index) => {
          const isActive = index === safeIndex
          const mobileSrc =
            forceVariant === 'desktop' ? undefined : banner.srcMobile
          const mainSrc =
            forceVariant === 'mobile' && banner.srcMobile
              ? banner.srcMobile
              : banner.src

          return (
            <div
              key={banner.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <BannerLinkWrapper link={banner.link}>
                <picture>
                  {mobileSrc && !forceVariant ? (
                    <source media={MOBILE_MEDIA} srcSet={mobileSrc} />
                  ) : null}
                  <img
                    src={mainSrc}
                    alt={banner.alt}
                    decoding="async"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </picture>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              </BannerLinkWrapper>
            </div>
          )
        })}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl font-bold text-foreground shadow transition hover:bg-white"
            aria-label="Banner anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl font-bold text-foreground shadow transition hover:bg-white"
            aria-label="Próximo banner"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="grid min-h-11 min-w-11 place-items-center"
                aria-label={`Ir para o banner ${index + 1}`}
                aria-current={index === safeIndex}
              >
                <span
                  className={`block h-2.5 w-2.5 rounded-full transition ${
                    index === safeIndex
                      ? 'bg-accent-yellow'
                      : 'bg-white/60 hover:bg-white'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
