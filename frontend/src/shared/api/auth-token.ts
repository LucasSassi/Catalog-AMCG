import type { AuthUserRole } from '../../features/auth/types'

const AUTH_TOKEN_KEY = 'catalog-amcg:auth-token'

interface JwtPayload {
  exp?: number
  role?: AuthUserRole
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function hasAuthToken(): boolean {
  return isAuthTokenValid()
}

export function isAuthTokenValid(): boolean {
  const token = getAuthToken()

  if (!token) {
    return false
  }

  const payload = parseJwtPayload(token)

  if (!payload?.exp) {
    return false
  }

  return payload.exp * 1000 > Date.now()
}

export function getAuthTokenRole(): AuthUserRole | null {
  const token = getAuthToken()

  if (!token || !isAuthTokenValid()) {
    return null
  }

  const payload = parseJwtPayload(token)
  return payload?.role ?? null
}

export function isAdminAuthToken(): boolean {
  return getAuthTokenRole() === 'admin'
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')

    if (parts.length !== 3) {
      return null
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
    const decoded = atob(normalized + padding)

    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}
