import { FormModal } from '../../../shared/components/FormModal'
import type { Product } from '../types'
import { ProductRegistrationForm } from './ProductRegistrationForm'

interface ProductEditModalProps {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

export function ProductEditModal({
  product,
  onClose,
  onSuccess,
}: ProductEditModalProps) {
  return (
    <FormModal
      title={`Editar ${product.nome}`}
      subtitle="As mudanças valem para o catálogo assim que forem salvas."
      successTitle="Produto atualizado"
      successMessage="Os dados foram salvos com sucesso."
      onClose={onClose}
      onSuccess={onSuccess}
    >
      {(props) => (
        <ProductRegistrationForm
          product={product}
          onSuccess={props.onSuccess}
          onCancel={props.onCancel}
          onDirtyChange={props.onDirtyChange}
        />
      )}
    </FormModal>
  )
}
