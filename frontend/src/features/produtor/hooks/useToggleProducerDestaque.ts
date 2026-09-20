import { useState } from 'react'
import { setProducerDestaque } from '../api/producers'
import type { Producer } from '../types'

export function useToggleProducerDestaque(
  onSuccess: (producer: Producer) => void,
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function toggle(id: string, destaque: boolean) {
    setIsLoading(true)
    setError('')

    try {
      const updated = await setProducerDestaque(id, destaque)
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
