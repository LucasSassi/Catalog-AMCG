import { useEffect, useState } from 'react'
import type { CatalogProduct } from '../types'

interface CursorPage {
  produtos: CatalogProduct[]
  hasNext: boolean
}

interface UseCatalogProductCursorOptions {
  enabled: boolean
  pageSize: number
  resetKey: string
  fetchPage: (params: {
    pageSize: number
    lastItemId: string | null
  }) => Promise<CursorPage>
  errorMessage: string
}

export function useCatalogProductCursor({
  enabled,
  pageSize,
  resetKey,
  fetchPage,
  errorMessage,
}: UseCatalogProductCursorOptions) {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null])
  const [hasNext, setHasNext] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const currentIndex = cursorStack.length - 1
  const lastItemId = cursorStack[currentIndex] ?? null

  useEffect(() => {
    setCursorStack([null])
  }, [resetKey])

  useEffect(() => {
    if (!enabled) {
      setProducts([])
      setHasNext(false)
      setIsLoading(false)
      setError('')
      return
    }

    let isCurrent = true
    setIsLoading(true)

    fetchPage({ pageSize, lastItemId })
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
          setError(errorMessage)
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
  }, [enabled, errorMessage, fetchPage, lastItemId, pageSize])

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
