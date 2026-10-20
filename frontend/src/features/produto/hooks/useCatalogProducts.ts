import { useEffect, useState } from 'react'
import { listCatalogProducts } from '../api/products'
import type { CatalogFilters, ProductCatalog } from '../types'

const emptyCatalog: ProductCatalog = {
  produtos: [],
  categorias: [],
  municipios: [],
  certificacoes: [],
  pageSize: 12,
  nextLastItemId: null,
  hasNext: false,
}

export function useCatalogProducts(filters: CatalogFilters) {
  const [catalog, setCatalog] = useState<ProductCatalog>(emptyCatalog)
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState('')
  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let isCurrent = true
    const currentFilters = JSON.parse(filterKey) as CatalogFilters

    listCatalogProducts(currentFilters)
      .then((response) => {
        if (isCurrent) {
          setCatalog(response)
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
          setError('Não foi possível carregar o catálogo.')
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoadedKey(filterKey)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [filterKey])

  return {
    products: catalog.produtos,
    categories: catalog.categorias,
    cities: catalog.municipios,
    certifications: catalog.certificacoes,
    pageSize: catalog.pageSize,
    nextLastItemId: catalog.nextLastItemId,
    hasNext: catalog.hasNext,
    isLoading: loadedKey !== filterKey,
    error,
  }
}
