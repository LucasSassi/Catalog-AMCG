import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
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
  const [didSucceed, setDidSucceed] = useState(false)

  function handleSuccess() {
    setDidSucceed(true)
    onSuccess()
  }

  function handleClose() {
    setDidSucceed(false)
    onClose()
  }

  return (
    <Modal title="Editar produtor" onClose={handleClose}>
      {didSucceed ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-700">
            Produtor atualizado com sucesso.
          </p>
          <Button fullWidth onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <ProducerRegistrationForm
          producer={producer}
          onSuccess={handleSuccess}
        />
      )}
    </Modal>
  )
}
