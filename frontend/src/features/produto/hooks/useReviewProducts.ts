import { useEffect, useState } from 'react'
import {
  approveProduct,
  listProductsByStatus,
  rejectProduct,
} from '../api/products'
import type { Product, ProductStatus } from '../types'

export type ProductReviewStatus = Extract<
  ProductStatus,
  'PENDENTE' | 'REJEITADO'
>

export function useReviewProducts(status: ProductReviewStatus) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadedStatus, setLoadedStatus] =
    useState<ProductReviewStatus | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    listProductsByStatus(status)
      .then((response) => {
        if (isCurrent) {
          setProducts(response)
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
          setError('Não foi possível carregar os produtos.')
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoadedStatus(status)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [reloadKey, status])

  async function approve(id: string): Promise<boolean> {
    return updateProduct(() => approveProduct(id), id)
  }

  async function reject(id: string, reason: string): Promise<boolean> {
    return updateProduct(() => rejectProduct(id, reason), id)
  }

  async function updateProduct(
    request: () => Promise<Product>,
    id: string,
  ): Promise<boolean> {
    setIsUpdating(true)
    setError('')

    try {
      await request()
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id),
      )
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível atualizar o produto.')
      }
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  function reload() {
    setLoadedStatus(null)
    setReloadKey((currentKey) => currentKey + 1)
  }

  return {
    products,
    isLoading: loadedStatus !== status,
    isUpdating,
    error,
    approve,
    reject,
    reload,
  }
}
