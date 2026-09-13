const AUTH_TOKEN_KEY = 'catalog-amcg:auth-token'

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
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null
}
