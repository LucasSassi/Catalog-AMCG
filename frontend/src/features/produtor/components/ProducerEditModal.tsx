import { FormModal } from '../../../shared/components/FormModal'
import type { Producer } from '../types'
import { ProducerRegistrationForm } from './ProducerRegistrationForm'

interface ProducerEditModalProps {
  producer: Producer
  onClose: () => void
  onSuccess: () => void
}

export function ProducerEditModal({
  producer,
  onClose,
  onSuccess,
}: ProducerEditModalProps) {
  return (
    <FormModal
      title={`Editar ${producer.nomeEmpresa}`}
      subtitle="As mudanças valem para o catálogo assim que forem salvas."
      successTitle="Produtor atualizado"
      successMessage="Os dados foram salvos com sucesso."
      onClose={onClose}
      onSuccess={onSuccess}
    >
      {(props) => (
        <ProducerRegistrationForm
          producer={producer}
          onSuccess={props.onSuccess}
          onCancel={props.onCancel}
          onDirtyChange={props.onDirtyChange}
        />
      )}
    </FormModal>
  )
}
