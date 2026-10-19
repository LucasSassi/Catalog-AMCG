import { useState } from 'react'
import { removeAuthToken, setAuthToken } from '../../../shared/api/auth-token'
import { login } from '../api/login'
import type { AuthUser, LoginCredentials } from '../types'

interface AuthenticateOptions {
  requireAdmin?: boolean
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function authenticate(
    credentials: LoginCredentials,
    options: AuthenticateOptions = {},
  ): Promise<AuthUser | null> {
    setIsLoading(true)
    setError('')

    try {
      const response = await login(credentials)

      if (options.requireAdmin && response.usuario.role !== 'admin') {
        removeAuthToken()
        setError('Acesso restrito a administradores.')
        return null
      }

      setAuthToken(response.token)
      return response.usuario
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível entrar no painel.')
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { authenticate, error, isLoading }
}
