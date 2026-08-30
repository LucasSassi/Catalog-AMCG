import { apiRequest } from '../../../shared/api/client'
import type { Producer, ProducerStatus } from '../types'

export function listProducersByStatus(
  status: ProducerStatus,
): Promise<Producer[]> {
  return apiRequest<Producer[]>(`/api/produtores?status=${status}`, {
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
