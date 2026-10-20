import { useState } from 'react'
import { updateProducer } from '../api/producers'
import type { CreateProducerInput, Producer, ProducerStatus } from '../types'

export function useUpdateProducer() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(
    id: string,
    input: CreateProducerInput,
    status?: ProducerStatus,
  ): Promise<Producer | null> {
    setIsLoading(true)
    setError('')

    try {
      const producer = await updateProducer(id, {
        ...input,
        ...(status !== undefined ? { status } : {}),
      })
      return producer
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível salvar as alterações.')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { submit, error, isLoading }
}
