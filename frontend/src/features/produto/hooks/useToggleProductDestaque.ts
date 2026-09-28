import { useState } from 'react'
import { setProductDestaque } from '../api/products'
import type { Product } from '../types'

export function useToggleProductDestaque(onSuccess: (product: Product) => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function toggle(id: string, destaque: boolean) {
    setIsLoading(true)
    setError('')

    try {
      const updated = await setProductDestaque(id, destaque)
      onSuccess(updated)
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível atualizar o destaque.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { toggle, isLoading, error, clearError: () => setError('') }
}
