import { FormModal } from '../../../shared/components/FormModal'
import { ProductRegistrationForm } from './ProductRegistrationForm'

interface ProductCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ProductCreateModal({
  onClose,
  onSuccess,
}: ProductCreateModalProps) {
  return (
    <FormModal
      title="Novo produto"
      subtitle="Cadastro administrativo: o produto é aprovado automaticamente após o envio."
      successTitle="Produto cadastrado"
      successMessage="Ele já aparece na lista de aprovados e no catálogo público."
      onClose={onClose}
      onSuccess={onSuccess}
    >
      {(props) => (
        <ProductRegistrationForm
          approveAfterCreate
          onSuccess={props.onSuccess}
          onCancel={props.onCancel}
          onDirtyChange={props.onDirtyChange}
        />
      )}
    </FormModal>
  )
}
