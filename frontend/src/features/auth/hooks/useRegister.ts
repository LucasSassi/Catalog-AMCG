import { useState } from 'react'
import { setAuthToken } from '../../../shared/api/auth-token'
import { login } from '../api/login'
import { register } from '../api/register'
import type { RegisterCredentials } from '../types'

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function createAccount(
    credentials: RegisterCredentials,
  ): Promise<boolean> {
    setIsLoading(true)
    setError('')

    try {
      await register(credentials)

      const response = await login({
        email: credentials.email,
        senha: credentials.senha,
      })

      setAuthToken(response.token)
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível criar a conta.')
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { createAccount, error, isLoading }
}
