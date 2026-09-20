import { useEffect, useState } from 'react'
import {
  approveProducer,
  listProducers,
  rejectProducer,
  setProducerDestaque,
  type ProducerListFilter,
} from '../api/producers'
import type { Producer } from '../types'

export function useReviewProducers(status: ProducerListFilter) {
  const [producers, setProducers] = useState<Producer[]>([])
  const [loadedStatus, setLoadedStatus] = useState<ProducerListFilter | null>(
    null,
  )
  const [reloadKey, setReloadKey] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    listProducers(status)
      .then((response) => {
        if (isCurrent) {
          setProducers(response)
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
          setLoadedStatus(status)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [reloadKey, status])

  async function approve(id: string): Promise<boolean> {
    return updateProducer(() => approveProducer(id), id)
  }

  async function reject(id: string, reason: string): Promise<boolean> {
    return updateProducer(() => rejectProducer(id, reason), id)
  }

  async function toggleDestaque(
    id: string,
    destaque: boolean,
  ): Promise<boolean> {
    setIsUpdating(true)
    setError('')

    try {
      const updated = await setProducerDestaque(id, destaque)
      setProducers((currentProducers) =>
        currentProducers.map((producer) =>
          producer.id === id ? updated : producer,
        ),
      )
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível atualizar o destaque.')
      }
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  async function updateProducer(
    request: () => Promise<Producer>,
    id: string,
  ): Promise<boolean> {
    setIsUpdating(true)
    setError('')

    try {
      await request()
      setProducers((currentProducers) =>
        currentProducers.filter((producer) => producer.id !== id),
      )
      return true
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      } else {
        setError('Não foi possível atualizar o produtor.')
      }
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  function reload() {
    setLoadedStatus(null)
    setReloadKey((currentKey) => currentKey + 1)
  }

  return {
    producers,
    isLoading: loadedStatus !== status,
    isUpdating,
    error,
    approve,
    reject,
    toggleDestaque,
    reload,
  }
}
