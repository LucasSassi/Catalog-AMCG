/** Espelha as regras do backend (domain/banner/entity/banner.constants.ts). */
export const MAX_ACTIVE_BANNERS = 6
export const MAX_BANNER_BYTES = 1.5 * 1024 * 1024
export const MAX_BANNER_TITLE_LENGTH = 80
export const MAX_BANNER_ALT_LENGTH = 200

export const BANNER_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/**
 * Mesma proporção dos banners atuais (1920×706 ≈ 2,72:1).
 * O carrossel corta a imagem: no computador mostra 16:5 (corta um pouco em
 * cima e embaixo) e no celular 2:1 (corta as laterais). Por isso existe uma
 * "área segura" central onde textos e logos sempre aparecem.
 */
export const BANNER_DIMENSIONS = {
  desktop: { width: 1920, height: 706 },
  mobile: { width: 1080, height: 540 },
  safeArea: { width: 1400, height: 600 },
} as const

export const BANNER_DESKTOP_RATIO =
  BANNER_DIMENSIONS.desktop.width / BANNER_DIMENSIONS.desktop.height
export const BANNER_MOBILE_RATIO =
  BANNER_DIMENSIONS.mobile.width / BANNER_DIMENSIONS.mobile.height

/** Proporções exibidas pelo carrossel (ver BannerCarousel). */
export const CAROUSEL_DESKTOP_RATIO = 16 / 5
export const CAROUSEL_MOBILE_RATIO = 16 / 8

export const BANNER_LINK_SUGGESTIONS = [
  { label: 'Página de produtores', value: '/produtores' },
  { label: 'Inscrição de produtores', value: '/inscricao' },
  { label: 'Quem somos', value: '/quem-somos' },
] as const
