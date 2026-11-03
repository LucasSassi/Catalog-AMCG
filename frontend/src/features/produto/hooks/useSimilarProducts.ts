import { useCallback } from 'react'
import { listSimilarProducts } from '../api/products'
import { useCatalogProductCursor } from './useCatalogProductCursor'

const SIMILAR_PAGE_SIZE = 10

export function useSimilarProducts(
  categoria: string | undefined,
  excludeId: string | undefined,
) {
  const enabled = Boolean(categoria && excludeId)
  const resetKey = `${categoria ?? ''}:${excludeId ?? ''}`

  const fetchPage = useCallback(
    ({
      pageSize,
      lastItemId,
    }: {
      pageSize: number
      lastItemId: string | null
    }) => {
      if (!categoria || !excludeId) {
        return Promise.resolve({ produtos: [], hasNext: false })
      }

      return listSimilarProducts({
        categoria,
        excludeId,
        pageSize,
        ...(lastItemId ? { lastItemId } : {}),
      })
    },
    [categoria, excludeId],
  )

  return useCatalogProductCursor({
    enabled,
    pageSize: SIMILAR_PAGE_SIZE,
    resetKey,
    fetchPage,
    errorMessage: 'Não foi possível carregar produtos similares.',
  })
}
