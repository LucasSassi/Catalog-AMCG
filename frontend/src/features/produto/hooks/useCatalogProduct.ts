import { useEffect, useState } from 'react'
import { getCatalogProduct } from '../api/products'
import type { CatalogProductDetail } from '../types'

export function useCatalogProduct(id: string | undefined) {
  const [product, setProduct] = useState<CatalogProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setProduct(null)
      setIsLoading(false)
      setError('Produto não encontrado')
      return
    }

    let isCurrent = true
    setIsLoading(true)

    getCatalogProduct(id)
      .then((response) => {
        if (isCurrent) {
          setProduct(response)
          setError('')
        }
      })
      .catch((requestError) => {
        if (!isCurrent) {
          return
        }

        setProduct(null)
        if (requestError instanceof Error) {
          setError(requestError.message)
        } else {
          setError('Não foi possível carregar o produto.')
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  return { product, isLoading, error }
}
