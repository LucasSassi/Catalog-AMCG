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
      window.location.assign(window.location.pathname.startsWith('/backoffice') ? LOGIN_PATH : '/minha-conta/login')
    }

    throw new ApiError(await readErrorMessage(response), response.status)
  }

  return (await response.json()) as T
}

/**
 * Mensagem de erro da API. Quando o backend está fora do ar, o proxy (Vite ou
 * Nginx) responde sem JSON; nesse caso mostra uma mensagem legível em vez de
 * "Unexpected end of JSON input".
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as Partial<ApiErrorResponse>
    if (typeof payload.error === 'string' && payload.error) {
      return payload.error
    }
  } catch {
    // Corpo vazio ou não-JSON.
  }

  return response.status >= 500
    ? 'O servidor está indisponível no momento. Tente novamente em alguns instantes.'
    : 'Não foi possível concluir a solicitação.'
}
