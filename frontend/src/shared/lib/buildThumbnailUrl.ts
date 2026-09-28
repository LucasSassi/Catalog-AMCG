const THUMBNAIL_PROXY_URL = 'https://wsrv.nl/'
const THUMBNAIL_QUALITY = '75'
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

export const THUMBNAIL_WIDTH = {
  card: 600,
  avatar: 192,
  gallery: 150,
  detail: 1200,
} as const

export function buildThumbnailUrl(url: string, width: number): string {
  if (!ABSOLUTE_URL_PATTERN.test(url)) {
    return url
  }

  const params = new URLSearchParams({
    url,
    w: String(width),
    output: 'webp',
    q: THUMBNAIL_QUALITY,
  })

  return `${THUMBNAIL_PROXY_URL}?${params.toString()}`
}
