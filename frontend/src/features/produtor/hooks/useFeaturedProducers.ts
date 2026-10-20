import { useEffect, useState } from 'react'
import { listFeaturedProducers } from '../api/producers'
import type { CatalogProducer } from '../types'

export function useFeaturedProducers() {
  const [producers, setProducers] = useState<CatalogProducer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    listFeaturedProducers()
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
          setError('Não foi possível carregar os destaques.')
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
