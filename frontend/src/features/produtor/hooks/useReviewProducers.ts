import { useEffect, useState } from 'react'
import {
  approveProducer,
  listProducers,
  rejectProducer,
  reopenProducer,
  setProducerDestaque,
  type ProducerListFilter,
} from '../api/producers'
import type { Producer, ProducerStatus } from '../types'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

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
        if (isCurrent) {
          setError(
            errorMessage(requestError, 'Não foi possível carregar os produtores.'),
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

  function replace(updated: Producer[]) {
    const byId = new Map(updated.map((producer) => [producer.id, producer]))
    setProducers((current) =>
      current.map((producer) => byId.get(producer.id) ?? producer),
    )
  }

  /** Executa as requisições e atualiza a lista com o que voltou da API. */
  async function mutate(
    requests: Array<() => Promise<Producer>>,
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
    return mutate([() => approveProducer(id)], 'Não foi possível aprovar o produtor.')
  }

  function approveMany(ids: string[]) {
    return mutate(
      ids.map((id) => () => approveProducer(id)),
      'Não foi possível aprovar todos os produtores.',
    )
  }

  function reject(id: string, reason: string) {
    return mutate(
      [() => rejectProducer(id, reason)],
      'Não foi possível rejeitar o produtor.',
    )
  }

  function toggleDestaque(id: string, destaque: boolean) {
    return mutate(
      [() => setProducerDestaque(id, destaque)],
      'Não foi possível atualizar o destaque.',
    )
  }

  /** Restaura o status anterior de cada produtor (desfazer). */
  function restore(
    previous: ReadonlyArray<{
      id: string
      status: ProducerStatus
      motivoRejeicao?: string
    }>,
  ) {
    return mutate(
      previous.map((item) => () => {
        if (item.status === 'APROVADO') {
          return approveProducer(item.id)
        }

        if (item.status === 'REJEITADO') {
          return rejectProducer(item.id, item.motivoRejeicao ?? 'Rejeitado')
        }

        return reopenProducer(item.id)
      }),
      'Não foi possível desfazer a decisão.',
    )
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
    approveMany,
    reject,
    toggleDestaque,
    restore,
    reload,
  }
}

export type ReviewProducersState = ReturnType<typeof useReviewProducers>
