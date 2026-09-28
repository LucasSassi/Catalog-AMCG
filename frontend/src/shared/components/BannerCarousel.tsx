import { useEffect, useState } from 'react'

interface BannerCarouselProps {
  images: string[]
  intervalMs?: number
}

interface BannerLoadingProps {
  loading: 'eager' | 'lazy'
  fetchPriority: 'high' | 'low'
}

function getBannerLoadingProps(index: number): BannerLoadingProps {
  const isFirstBanner = index === 0

  return {
    loading: isFirstBanner ? 'eager' : 'lazy',
    fetchPriority: isFirstBanner ? 'high' : 'low',
  }
}

export function BannerCarousel({
  images,
  intervalMs = 6000,
}: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const hasMultiple = images.length > 1

  useEffect(() => {
    if (!hasMultiple || isPaused) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [hasMultiple, images.length, intervalMs, isPaused])

  if (images.length === 0) {
    return null
  }

  function goToPrevious(): void {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    )
  }

  function goToNext(): void {
    setActiveIndex((current) => (current + 1) % images.length)
  }

  return (
    <section
      className="relative overflow-hidden bg-brand-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Banners de divulgação"
    >
      <div className="relative aspect-[16/8] w-full sm:aspect-[16/5]">
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Banner ${index + 1}`}
            decoding="async"
            {...getBannerLoadingProps(index)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent" />
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl font-bold text-brand-900 shadow transition hover:bg-white"
            aria-label="Banner anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl font-bold text-brand-900 shadow transition hover:bg-white"
            aria-label="Próximo banner"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex
                    ? 'bg-accent-400'
                    : 'bg-white/60 hover:bg-white'
                }`}
                aria-label={`Ir para o banner ${index + 1}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
