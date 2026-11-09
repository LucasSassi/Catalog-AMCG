import { useEffect, useState } from 'react'
import {
  approveProduct,
  listProducts,
  rejectProduct,
  reopenProduct,
  setProductAtivo,
  setProductDestaque,
  type ProductListFilter,
} from '../api/products'
import type { Product, ProductStatus } from '../types'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useReviewProducts(status: ProductListFilter) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadedStatus, setLoadedStatus] = useState<ProductListFilter | null>(
    null,
  )
  const [reloadKey, setReloadKey] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    listProducts(status)
      .then((response) => {
        if (isCurrent) {
          setProducts(response)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            errorMessage(requestError, 'Não foi possível carregar os produtos.'),
          )
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

  function replace(updated: Product[]) {
    const byId = new Map(updated.map((product) => [product.id, product]))
    setProducts((current) =>
      current.map((product) => byId.get(product.id) ?? product),
    )
  }

  /** Executa as requisições e atualiza a lista com o que voltou da API. */
  async function mutate(
    requests: Array<() => Promise<Product>>,
    fallback: string,
  ): Promise<boolean> {
    setIsUpdating(true)
    setError('')

    const results = await Promise.allSettled(requests.map((request) => request()))
    const updated = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    )
    const failure = results.find((result) => result.status === 'rejected')

    replace(updated)
    setIsUpdating(false)

    if (failure && failure.status === 'rejected') {
      setError(errorMessage(failure.reason, fallback))
      return false
    }

    return true
  }

  function approve(id: string) {
    return mutate([() => approveProduct(id)], 'Não foi possível aprovar o produto.')
  }

  function reject(id: string, reason: string) {
    return mutate(
      [() => rejectProduct(id, reason)],
      'Não foi possível rejeitar o produto.',
    )
  }

  function toggleDestaque(id: string, destaque: boolean) {
    return mutate(
      [() => setProductDestaque(id, destaque)],
      'Não foi possível atualizar o destaque.',
    )
  }

  function toggleAtivo(id: string, ativo: boolean) {
    return mutate(
      [() => setProductAtivo(id, ativo)],
      'Não foi possível atualizar a visibilidade no catálogo.',
    )
  }

  function setAtivoMany(ids: string[], ativo: boolean) {
    return mutate(
      ids.map((id) => () => setProductAtivo(id, ativo)),
      'Não foi possível atualizar a visibilidade de todos os produtos.',
    )
  }

  /** Restaura o status anterior de cada produto (desfazer). */
  function restore(
    previous: ReadonlyArray<{
      id: string
      status: ProductStatus
      motivoRejeicao?: string
    }>,
  ) {
    return mutate(
      previous.map((item) => () => {
        if (item.status === 'APROVADO') {
          return approveProduct(item.id)
        }

        if (item.status === 'REJEITADO') {
          return rejectProduct(item.id, item.motivoRejeicao ?? 'Rejeitado')
        }

        return reopenProduct(item.id)
      }),
      'Não foi possível desfazer a decisão.',
    )
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
    toggleDestaque,
    toggleAtivo,
    setAtivoMany,
    restore,
    reload,
  }
}

export type ReviewProductsState = ReturnType<typeof useReviewProducts>
