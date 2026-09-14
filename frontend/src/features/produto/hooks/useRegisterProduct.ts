import { useState } from 'react'
import { approveProduct, createProduct } from '../api/products'
import type { CreateProductInput, Product } from '../types'

interface UseRegisterProductOptions {
  approveAfterCreate?: boolean
}

export function useRegisterProduct(
  options: UseRegisterProductOptions = {},
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null)

  async function submit(input: CreateProductInput): Promise<boolean> {
    setIsLoading(true)
    setError('')

    try {
      let product = await createProduct(input)

      if (options.approveAfterCreate) {
        try {
          product = await approveProduct(product.id)
        } catch {
          setCreatedProduct(product)
          setError(
            'Produto criado, mas não foi possível aprovar automaticamente. Aprove na lista de pendentes.',
          )
          return false
        }
      }

      setCreatedProduct(product)
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
    setCreatedProduct(null)
  }

  return { submit, error, isLoading, createdProduct, reset }
}
