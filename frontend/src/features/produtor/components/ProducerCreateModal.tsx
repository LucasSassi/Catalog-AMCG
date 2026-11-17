import { FormModal } from '../../../shared/components/FormModal'
import { ProducerRegistrationForm } from './ProducerRegistrationForm'

interface ProducerCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ProducerCreateModal({
  onClose,
  onSuccess,
}: ProducerCreateModalProps) {
  return (
    <FormModal
      title="Novo produtor"
      subtitle="Cadastro administrativo: o produtor é aprovado automaticamente após o envio."
      successTitle="Produtor cadastrado"
      successMessage="Ele já aparece na lista de aprovados e pode receber produtos."
      onClose={onClose}
      onSuccess={onSuccess}
    >
      {(props) => (
        <ProducerRegistrationForm
          approveAfterCreate
          onSuccess={props.onSuccess}
          onCancel={props.onCancel}
          onDirtyChange={props.onDirtyChange}
        />
      )}
    </FormModal>
  )
}
