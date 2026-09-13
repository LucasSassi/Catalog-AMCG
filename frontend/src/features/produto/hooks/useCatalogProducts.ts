import { useEffect, useState } from 'react'
import { listCatalogProducts } from '../api/products'
import type { CatalogFilters, ProductCatalog } from '../types'

const emptyCatalog: ProductCatalog = {
  produtos: [],
  categorias: [],
  municipios: [],
}

export function useCatalogProducts(filters: CatalogFilters) {
  const [catalog, setCatalog] = useState<ProductCatalog>(emptyCatalog)
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState('')
  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let isCurrent = true

    listCatalogProducts(filters)
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
  }, [filterKey, filters])

  return {
    products: catalog.produtos,
    categories: catalog.categorias,
    cities: catalog.municipios,
    isLoading: loadedKey !== filterKey,
    error,
  }
}
