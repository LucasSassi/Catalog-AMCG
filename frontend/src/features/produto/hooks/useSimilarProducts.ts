import { useEffect, useState } from 'react'
import { listSimilarProducts } from '../api/products'
import type { CatalogProduct } from '../types'

/**
 * Até 3 produtos sorteados pelo backend: mesma categoria do produto, de
 * produtores diferentes do dono dele (um por produtor).
 */
export function useSimilarProducts(produtoId: string | undefined) {
  const [result, setResult] = useState<{
    produtoId: string
    products: CatalogProduct[]
  } | null>(null)

  useEffect(() => {
    if (!produtoId) {
      return
    }

    let isCurrent = true

    listSimilarProducts(produtoId)
      .then((response) => {
        if (isCurrent) {
          setResult({ produtoId, products: response.produtos })
        }
      })
      .catch(() => {
        // Seção complementar: em caso de erro ela simplesmente não aparece.
        if (isCurrent) {
          setResult({ produtoId, products: [] })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [produtoId])

  const isCurrentResult = Boolean(produtoId) && result?.produtoId === produtoId

  return {
    products: isCurrentResult && result ? result.products : [],
    isLoading: Boolean(produtoId) && !isCurrentResult,
  }
}
