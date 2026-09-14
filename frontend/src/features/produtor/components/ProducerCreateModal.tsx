import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { ProducerRegistrationForm } from './ProducerRegistrationForm'

interface ProducerCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ProducerCreateModal({
  onClose,
  onSuccess,
}: ProducerCreateModalProps) {
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
    <Modal title="Novo produtor" onClose={handleClose}>
      {didSucceed ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-700">
            Produtor cadastrado e aprovado com sucesso. Ele já aparece na lista
            de aprovados e pode receber produtos.
          </p>
          <Button fullWidth onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-5 text-sm leading-6 text-slate-600">
            Cadastro administrativo: o produtor será aprovado automaticamente
            após o envio.
          </p>
          <ProducerRegistrationForm
            approveAfterCreate
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </Modal>
  )
}
