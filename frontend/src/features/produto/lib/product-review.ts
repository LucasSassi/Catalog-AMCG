import type { ReviewChecklistItem } from '../../../shared/lib/review-status'
import type { Product } from '../types'

const MIN_DESCRICAO_LENGTH = 40

/** Conferência guiada exibida nos detalhes do produto. */
export function getProductChecklist(product: Product): ReviewChecklistItem[] {
  return [
    {
      id: 'divulgacao',
      label: 'Foto de divulgação',
      ok: product.fotosDivulgacao.length > 0,
      detail: `${product.fotosDivulgacao.length} enviada${product.fotosDivulgacao.length === 1 ? '' : 's'}`,
    },
    {
      id: 'avaliacao',
      label: 'Fotos para avaliação',
      ok: product.fotosAvaliacao.length > 0,
      detail: `${product.fotosAvaliacao.length} enviada${product.fotosAvaliacao.length === 1 ? '' : 's'}`,
    },
    {
      id: 'descricao-breve',
      label: 'Descrição breve',
      ok: product.descricaoBreve.trim().length > 0,
    },
    {
      id: 'descricao',
      label: 'Descrição completa',
      ok: product.descricao.trim().length >= MIN_DESCRICAO_LENGTH,
    },
    {
      id: 'registro',
      label: 'Registro informado',
      ok: product.registros.length > 0,
      detail: product.registros.map((registro) => registro.tipo).join(', '),
    },
    {
      id: 'preco',
      label: 'Preço definido',
      ok: product.valorCentavos > 0,
    },
  ]
}
