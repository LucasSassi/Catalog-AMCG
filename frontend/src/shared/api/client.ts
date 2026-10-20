import { getAuthToken, removeAuthToken } from './auth-token'

const LOGIN_PATH = '/backoffice/login'

interface ApiErrorResponse {
  error: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: object
  authenticated?: boolean
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })

  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.authenticated) {
    const token = getAuthToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    if (options.authenticated && response.status === 401) {
      removeAuthToken()
      window.location.assign(LOGIN_PATH)
    }

    const payload = (await response.json()) as ApiErrorResponse
    throw new ApiError(payload.error, response.status)
  }

  return (await response.json()) as T
}
