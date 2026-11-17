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
      subtitle="Alterações em nome, descrições, preço ou fotos deixam o produto inativo até nova aprovação."
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
