import { apiRequest } from '../../../shared/api/client'
import type { AuthUser, RegisterCredentials } from '../types'

export function register(
  credentials: RegisterCredentials,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/usuarios/cadastrar', {
    method: 'POST',
    body: credentials,
  })
}
