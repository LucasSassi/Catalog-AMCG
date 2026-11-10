import { useRef } from 'react'
import type { ReviewProductsState } from '../features/produto/hooks/useReviewProducts'
import type { Product } from '../features/produto/types'
import type { ReviewProducersState } from '../features/produtor/hooks/useReviewProducers'
import type { Producer } from '../features/produtor/types'
import { useToast } from '../shared/hooks/useToast'

type UndoFn = () => Promise<unknown>

function snapshot(item: Producer | Product) {
  return {
    id: item.id,
    status: item.status,
    motivoRejeicao: item.motivoRejeicao,
  }
}

/**
 * Decisões de curadoria com aviso e "Desfazer". A última ação desfazível fica
 * guardada para o atalho Ctrl+Z.
 */
export function useBackofficeActions(
  producers: ReviewProducersState,
  products: ReviewProductsState,
) {
  const { showToast } = useToast()
  const lastUndo = useRef<UndoFn | null>(null)

  async function run(
    action: () => Promise<boolean>,
    success: string,
    undo: UndoFn | null,
    failure: string,
  ): Promise<boolean> {
    const ok = await action()

    if (!ok) {
      showToast({ message: failure, tone: 'error' })
      return false
    }

    lastUndo.current = undo

    showToast({
      message: success,
      ...(undo
        ? {
            actionLabel: 'Desfazer',
            onAction: async () => {
              lastUndo.current = null
              await undo()
            },
          }
        : {}),
    })

    return true
  }

  function undoLast(): boolean {
    const undo = lastUndo.current

    if (!undo) {
      return false
    }

    lastUndo.current = null
    void undo().then(() => showToast({ message: 'Ação desfeita.' }))
    return true
  }

  function approveProducers(list: Producer[]) {
    const previous = list.map(snapshot)
    const message =
      list.length === 1
        ? `${list[0].nomeEmpresa} aprovado`
        : `${list.length} produtores aprovados`

    return run(
      () => producers.approveMany(list),
      message,
      () => producers.restore(previous),
      'Não foi possível aprovar. Tente de novo.',
    )
  }

  function rejectProducer(producer: Producer, motivo: string) {
    const previous = [snapshot(producer)]

    return run(
      () => producers.reject(producer.id, motivo, producer.revisao ?? 0),
      `${producer.nomeEmpresa} rejeitado`,
      () => producers.restore(previous),
      'Não foi possível rejeitar. Tente de novo.',
    )
  }

  function toggleProducerDestaque(producer: Producer) {
    const next = !producer.destaque

    return run(
      () => producers.toggleDestaque(producer.id, next),
      next
        ? `${producer.nomeEmpresa} em destaque`
        : `Destaque removido de ${producer.nomeEmpresa}`,
      () => producers.toggleDestaque(producer.id, !next),
      'Não foi possível atualizar o destaque.',
    )
  }

  function approveProduct(product: Product) {
    const previous = [snapshot(product)]

    return run(
      () => products.approve(product.id, product.revisao ?? 0),
      `${product.nome} aprovado`,
      () => products.restore(previous),
      'Não foi possível aprovar. Tente de novo.',
    )
  }

  function rejectProduct(product: Product, motivo: string) {
    const previous = [snapshot(product)]

    return run(
      () => products.reject(product.id, motivo, product.revisao ?? 0),
      `${product.nome} rejeitado`,
      () => products.restore(previous),
      'Não foi possível rejeitar. Tente de novo.',
    )
  }

  function setProductsAtivo(list: Product[], ativo: boolean) {
    const ids = list.map((product) => product.id)
    const message =
      list.length === 1
        ? `${list[0].nome} ${ativo ? 'voltou para a vitrine' : 'foi ocultado'}`
        : `${list.length} produtos ${ativo ? 'na vitrine' : 'ocultados'}`

    return run(
      () => products.setAtivoMany(ids, ativo),
      message,
      () => products.setAtivoMany(ids, !ativo),
      'Não foi possível atualizar a vitrine.',
    )
  }

  function toggleProductDestaque(product: Product) {
    const next = !product.destaque

    return run(
      () => products.toggleDestaque(product.id, next),
      next
        ? `${product.nome} em destaque`
        : `Destaque removido de ${product.nome}`,
      () => products.toggleDestaque(product.id, !next),
      'Não foi possível atualizar o destaque.',
    )
  }

  return {
    approveProducers,
    rejectProducer,
    toggleProducerDestaque,
    approveProduct,
    rejectProduct,
    setProductsAtivo,
    toggleProductDestaque,
    undoLast,
  }
}

export type BackofficeActions = ReturnType<typeof useBackofficeActions>
