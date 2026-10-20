import { apiRequest } from '../../../shared/api/client'
import type { CreateInscriptionInput, InscriptionResponse } from '../types'

export function submitInscription(
  input: CreateInscriptionInput,
): Promise<InscriptionResponse> {
  return apiRequest<InscriptionResponse>('/api/inscricoes', {
    method: 'POST',
    authenticated: true,
    body: input,
  })
}
