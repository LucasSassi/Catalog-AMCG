import { useEffect, useState } from 'react'
import { getCatalogProducer } from '../api/producers'
import type { CatalogProducer } from '../types'

export function useCatalogProducer(id: string | undefined) {
  const [producer, setProducer] = useState<CatalogProducer | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setProducer(null)
      setIsLoading(false)
      setError('')
      return
    }

    let isCurrent = true
    setIsLoading(true)

    getCatalogProducer(id)
      .then((response) => {
        if (isCurrent) {
          setProducer(response)
          setError('')
        }
      })
      .catch((requestError) => {
        if (!isCurrent) {
          return
        }

        setProducer(null)
        if (requestError instanceof Error) {
          setError(requestError.message)
        } else {
          setError('Não foi possível carregar o produtor.')
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
  }, [id])

  return { producer, isLoading, error }
}
