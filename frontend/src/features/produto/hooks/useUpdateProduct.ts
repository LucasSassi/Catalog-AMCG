import { useState } from 'react'
import { updateProduct } from '../api/products'
import type { CreateProductInput, Product } from '../types'

export function useUpdateProduct() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(
    id: string,
    input: CreateProductInput,
    revisao?: number,
  ): Promise<Product | null> {
    setIsLoading(true)
    setError('')

    try {
      const product = await updateProduct(id, {
        ...input,
        revisao,
      })
      return product
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
