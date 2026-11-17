import { useCallback } from 'react'
import { listProducerProducts } from '../api/products'
import { useCatalogProductCursor } from './useCatalogProductCursor'

const PRODUCER_PAGE_SIZE = 10

export function useProducerProducts(
  produtorId: string | undefined,
  excludeId?: string,
) {
  const enabled = Boolean(produtorId)
  const resetKey = `${produtorId ?? ''}:${excludeId ?? ''}`

  const fetchPage = useCallback(
    ({
      pageSize,
      lastItemId,
    }: {
      pageSize: number
      lastItemId: string | null
    }) => {
      if (!produtorId) {
        return Promise.resolve({ produtos: [], hasNext: false })
      }

      return listProducerProducts({
        produtorId,
        ...(excludeId ? { excludeId } : {}),
        pageSize,
        ...(lastItemId ? { lastItemId } : {}),
      })
    },
    [excludeId, produtorId],
  )

  return useCatalogProductCursor({
    enabled,
    pageSize: PRODUCER_PAGE_SIZE,
    resetKey,
    fetchPage,
    errorMessage: 'Não foi possível carregar produtos do produtor.',
  })
}
