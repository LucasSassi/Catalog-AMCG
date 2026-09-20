import { useEffect, useState } from 'react'
import { listCatalogProducers } from '../api/producers'
import type { CatalogProducer } from '../types'

export function useCatalogProducers() {
  const [producers, setProducers] = useState<CatalogProducer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    listCatalogProducers()
      .then((response) => {
        if (isCurrent) {
          setProducers(response.produtores)
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
          setError('Não foi possível carregar os produtores.')
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

  return { producers, isLoading, error }
}
