import { useState } from 'react'
import { approveProducer, createProducer } from '../api/producers'
import type { CreateProducerInput, Producer } from '../types'

interface UseRegisterProducerOptions {
  approveAfterCreate?: boolean
}

export function useRegisterProducer(
  options: UseRegisterProducerOptions = {},
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdProducer, setCreatedProducer] = useState<Producer | null>(null)

  async function submit(input: CreateProducerInput): Promise<boolean> {
    setIsLoading(true)
    setError('')

    try {
      let producer = await createProducer(input)

      if (options.approveAfterCreate) {
        try {
          producer = await approveProducer(producer.id)
        } catch {
          setCreatedProducer(producer)
          setError(
            'Produtor criado, mas não foi possível aprovar automaticamente. Aprove na lista de pendentes.',
          )
          return false
        }
      }

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
