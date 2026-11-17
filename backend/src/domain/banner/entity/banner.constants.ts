export const BANNER_COLLECTION = "banners";

/** Quantidade máxima de banners ativos ao mesmo tempo no carrossel. */
export const MAX_BANNERS_ATIVOS = 6;

/** Tamanho máximo de cada imagem já decodificada (1,5 MB). */
export const MAX_BANNER_IMAGEM_BYTES = 1.5 * 1024 * 1024;

export const MAX_TITULO_LENGTH = 80;
export const MAX_TEXTO_ALTERNATIVO_LENGTH = 200;

export const BANNER_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type BannerContentType = (typeof BANNER_CONTENT_TYPES)[number];

export const BANNER_VARIANTES = ["desktop", "mobile"] as const;
export type BannerVariante = (typeof BANNER_VARIANTES)[number];

/** Dimensões recomendadas (mesma proporção dos banners atuais, 1920×706). */
export const BANNER_DIMENSOES_RECOMENDADAS = {
  desktop: { largura: 1920, altura: 706 },
  mobile: { largura: 1080, altura: 540 },
} as const;
