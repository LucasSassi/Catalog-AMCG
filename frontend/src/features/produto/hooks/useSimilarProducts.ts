import { useEffect, useState } from 'react'
import { listSimilarProducts } from '../api/products'
import type { CatalogProduct } from '../types'

const SIMILAR_PAGE_SIZE = 10

export function useSimilarProducts(
  categoria: string | undefined,
  excludeId: string | undefined,
) {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null])
  const [hasNext, setHasNext] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const currentIndex = cursorStack.length - 1
  const lastItemId = cursorStack[currentIndex] ?? null

  useEffect(() => {
    setCursorStack([null])
  }, [categoria, excludeId])

  useEffect(() => {
    if (!categoria || !excludeId) {
      setProducts([])
      setHasNext(false)
      setIsLoading(false)
      setError('')
      return
    }

    let isCurrent = true
    setIsLoading(true)

    listSimilarProducts({
      categoria,
      excludeId,
      pageSize: SIMILAR_PAGE_SIZE,
      ...(lastItemId ? { lastItemId } : {}),
    })
      .then((response) => {
        if (isCurrent) {
          setProducts(response.produtos)
          setHasNext(response.hasNext)
          setError('')
        }
      })
      .catch((requestError) => {
        if (!isCurrent) {
          return
        }

        setProducts([])
        setHasNext(false)
        if (requestError instanceof Error) {
          setError(requestError.message)
        } else {
          setError('Não foi possível carregar produtos similares.')
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
  }, [categoria, excludeId, lastItemId])

  function goToPreviousPage(): void {
    if (cursorStack.length <= 1) {
      return
    }
    setCursorStack((current) => current.slice(0, -1))
  }

  function goToNextPage(): void {
    if (!hasNext || products.length === 0) {
      return
    }

    const nextCursor = products[products.length - 1]?.id
    if (!nextCursor) {
      return
    }

    setCursorStack((current) => [...current, nextCursor])
  }

  return {
    products,
    isLoading,
    error,
    goToPreviousPage,
    goToNextPage,
    hasPrevious: cursorStack.length > 1,
    hasNext,
  }
}
