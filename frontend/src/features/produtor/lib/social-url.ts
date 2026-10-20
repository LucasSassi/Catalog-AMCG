import type { ProducerSocialNetwork, SocialNetworkType } from '../types'

export function stripSocialHandle(handle: string): string {
  return handle.trim().replace(/^@+/, '')
}

export function buildSocialProfileUrl(
  tipo: SocialNetworkType,
  handle: string,
): string {
  const slug = stripSocialHandle(handle)
  if (tipo === 'INSTAGRAM') {
    return `https://instagram.com/${slug}`
  }
  return `https://facebook.com/${slug}`
}

export function formatSocialHandle(rede: ProducerSocialNetwork): string {
  const slug = stripSocialHandle(rede.handle)
  return rede.tipo === 'INSTAGRAM' ? `@${slug}` : slug
}
