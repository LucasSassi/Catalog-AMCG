import { stripSocialHandle } from './social-url'
import type { ProducerSocialNetwork } from '../types'

export function parseSocialLink(
  link: string,
): ProducerSocialNetwork | undefined {
  const trimmed = link.trim()

  if (!trimmed) {
    return undefined
  }

  const lower = trimmed.toLowerCase()

  if (lower.includes('facebook.com') || lower.includes('fb.com')) {
    return {
      tipo: 'FACEBOOK',
      handle: extractHandleFromUrl(trimmed),
    }
  }

  if (lower.includes('instagram.com')) {
    return {
      tipo: 'INSTAGRAM',
      handle: extractHandleFromUrl(trimmed),
    }
  }

  return {
    tipo: 'INSTAGRAM',
    handle: stripSocialHandle(trimmed),
  }
}

function extractHandleFromUrl(value: string): string {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    const segment = url.pathname.split('/').filter(Boolean)[0] ?? ''
    return stripSocialHandle(segment || value)
  } catch {
    return stripSocialHandle(value)
  }
}
