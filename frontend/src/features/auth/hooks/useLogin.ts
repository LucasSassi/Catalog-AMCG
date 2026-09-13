import { useState } from 'react'
import { setAuthToken } from '../../../shared/api/auth-token'
import { login } from '../api/login'
import type { LoginCredentials } from '../types'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function authenticate(credentials: LoginCredentials): Promise<boolean> {
    setIsLoading(true)
    setError('')

    try {
      const response = await login(credentials)
      setAuthToken(response.token)
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível entrar no painel.')
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { authenticate, error, isLoading }
}
