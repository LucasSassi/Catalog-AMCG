import { useEffect, useState } from 'react'
import { listFeaturedProducts } from '../api/products'
import type { CatalogProduct } from '../types'

export function useFeaturedProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    listFeaturedProducts()
      .then((response) => {
        if (isCurrent) {
          setProducts(response.produtos)
          setError('')
        }
      })
      .catch((requestError) => {
        if (!isCurrent) {
          return
        }

        if (requestError instanceof Error) {
          setError(requestError.message)
        } else {
          setError('Não foi possível carregar os destaques.')
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
  }, [])

  return { products, isLoading, error }
}
