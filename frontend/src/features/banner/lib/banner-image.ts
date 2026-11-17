import {
  BANNER_CONTENT_TYPES,
  BANNER_DIMENSIONS,
  MAX_BANNER_BYTES,
} from '../constants'
import type { Banner, BannerImage, BannerSituation } from '../types'

export class BannerImageError extends Error {}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new BannerImageError('Falha ao ler o arquivo.'))
    reader.onerror = () => reject(new BannerImageError('Falha ao ler o arquivo.'))
    reader.readAsDataURL(blob)
  })
}

function readDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () =>
      reject(new BannerImageError('Não foi possível abrir a imagem.'))
    image.src = url
  })
}

/** Converte o arquivo em data URL, validando tipo, tamanho e lendo as dimensões. */
export async function fileToBannerImage(
  file: Blob,
  nomeOriginal: string,
): Promise<BannerImage> {
  const contentType = file.type.toLowerCase()
  const allowed: readonly string[] = BANNER_CONTENT_TYPES

  if (!allowed.includes(contentType)) {
    throw new BannerImageError('Use uma imagem JPG, PNG ou WebP.')
  }

  if (file.size > MAX_BANNER_BYTES) {
    throw new BannerImageError(
      `A imagem tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite é 1,5 MB: exporte em WebP ou JPG com qualidade ~80%.`,
    )
  }

  const url = await readAsDataUrl(file)
  const { width, height } = await readDimensions(url)

  return { url, contentType, nomeOriginal, largura: width, altura: height }
}

export interface DimensionCheck {
  tone: 'ok' | 'warning'
  message: string
}

/** Compara as dimensões com o tamanho recomendado para a variante. */
export function checkBannerDimensions(
  image: BannerImage,
  variant: 'desktop' | 'mobile',
): DimensionCheck | null {
  if (!image.largura || !image.altura) {
    return null
  }

  const target = BANNER_DIMENSIONS[variant]
  const ratio = image.largura / image.altura
  const targetRatio = target.width / target.height
  const ratioDiff = Math.abs(ratio - targetRatio) / targetRatio
  const size = `${image.largura}×${image.altura} px`

  if (image.largura < target.width * 0.75) {
    return {
      tone: 'warning',
      message: `${size}: largura baixa, pode ficar borrada. Ideal: ${target.width}×${target.height} px.`,
    }
  }

  if (ratioDiff > 0.08) {
    return {
      tone: 'warning',
      message: `${size}: proporção diferente da recomendada (${target.width}×${target.height}). A imagem será cortada; confira a prévia.`,
    }
  }

  return { tone: 'ok', message: `${size}: dimensões ideais.` }
}

export function getBannerSituation(
  banner: Pick<Banner, 'ativo' | 'inicioEm' | 'fimEm'>,
  now = Date.now(),
): BannerSituation {
  if (!banner.ativo) {
    return 'inativo'
  }

  if (banner.inicioEm && new Date(banner.inicioEm).getTime() > now) {
    return 'agendado'
  }

  if (banner.fimEm && new Date(banner.fimEm).getTime() < now) {
    return 'expirado'
  }

  return 'no-ar'
}
