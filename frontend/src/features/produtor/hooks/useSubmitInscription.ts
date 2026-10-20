import { useState } from 'react'
import { submitInscription } from '../api/inscription'
import type { CreateInscriptionInput, InscriptionResponse } from '../types'

export function useSubmitInscription() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<InscriptionResponse | null>(null)

  async function submit(input: CreateInscriptionInput): Promise<boolean> {
    setIsLoading(true)
    setError('')

    try {
      const response = await submitInscription(input)
      setResult(response)
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível enviar a inscrição.')
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  function reset() {
    setError('')
    setResult(null)
  }

  return { submit, error, isLoading, result, reset }
}
