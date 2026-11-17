import { useOutletContext } from 'react-router-dom'
import type { ReviewProductsState } from '../features/produto/hooks/useReviewProducts'
import type { ReviewProducersState } from '../features/produtor/hooks/useReviewProducers'
import type { BackofficeActions } from './useBackofficeActions'

export interface BackofficeData {
  producers: ReviewProducersState
  products: ReviewProductsState
  actions: BackofficeActions
}

/** Dados de curadoria carregados uma vez pelo layout e compartilhados. */
export function useBackofficeData(): BackofficeData {
  return useOutletContext<BackofficeData>()
}
