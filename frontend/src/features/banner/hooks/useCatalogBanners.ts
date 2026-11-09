import { useEffect, useState } from 'react'
import { bannerImages } from '../../../shared/assets/banners'
import type { CarouselBanner } from '../../../shared/components/BannerCarousel'
import { listCatalogBanners } from '../api/banners'

const FALLBACK_BANNERS: CarouselBanner[] = bannerImages.map((src, index) => ({
  id: `padrao-${index}`,
  src,
  alt: `Banner ${index + 1}`,
}))

/**
 * Banners do carrossel vindos do backoffice. Se a API falhar, usa os banners
 * padrão empacotados no frontend para a vitrine nunca ficar sem destaque.
 */
export function useCatalogBanners() {
  const [banners, setBanners] = useState<CarouselBanner[] | null>(null)

  useEffect(() => {
    let isCurrent = true

    listCatalogBanners()
      .then((response) => {
        if (isCurrent) {
          setBanners(
            response.map((banner) => ({
              id: banner.id,
              src: banner.imagemUrl,
              srcMobile: banner.imagemMobileUrl,
              alt: banner.textoAlternativo,
              link: banner.link,
            })),
          )
        }
      })
      .catch(() => {
        if (isCurrent) {
          setBanners(FALLBACK_BANNERS)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  return { banners: banners ?? [], isLoading: banners === null }
}
