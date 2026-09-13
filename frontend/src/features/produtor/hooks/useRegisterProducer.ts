import { useState } from 'react'
import { createProducer } from '../api/producers'
import type { CreateProducerInput, Producer } from '../types'

export function useRegisterProducer() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdProducer, setCreatedProducer] = useState<Producer | null>(null)

  async function submit(input: CreateProducerInput): Promise<boolean> {
    setIsLoading(true)
    setError('')

    try {
      const producer = await createProducer(input)
      setCreatedProducer(producer)
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível enviar o cadastro.')
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  function reset() {
    setError('')
    setCreatedProducer(null)
  }

  return { submit, error, isLoading, createdProducer, reset }
}
