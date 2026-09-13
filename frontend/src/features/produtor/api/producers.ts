import { apiRequest } from '../../../shared/api/client'
import type { CreateProducerInput, Producer, ProducerStatus } from '../types'

export type ProducerListFilter = ProducerStatus | 'TODOS'

export function createProducer(input: CreateProducerInput): Promise<Producer> {
  return apiRequest<Producer>('/api/produtores', {
    method: 'POST',
    authenticated: true,
    body: input,
  })
}

export function listProducers(filter: ProducerListFilter): Promise<Producer[]> {
  if (filter === 'TODOS') {
    return apiRequest<Producer[]>('/api/produtores', {
      authenticated: true,
    })
  }

  return apiRequest<Producer[]>(`/api/produtores?status=${filter}`, {
    authenticated: true,
  })
}

export function approveProducer(id: string): Promise<Producer> {
  return apiRequest<Producer>(`/api/produtores/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: { status: 'APROVADO' },
  })
}

export function rejectProducer(id: string, reason: string): Promise<Producer> {
  return apiRequest<Producer>(`/api/produtores/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: {
      status: 'REJEITADO',
      motivoRejeicao: reason,
    },
  })
}
