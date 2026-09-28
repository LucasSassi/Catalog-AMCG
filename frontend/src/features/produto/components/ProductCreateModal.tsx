import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { ProductRegistrationForm } from './ProductRegistrationForm'

interface ProductCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ProductCreateModal({
  onClose,
  onSuccess,
}: ProductCreateModalProps) {
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
    <Modal title="Novo produto" onClose={handleClose}>
      {didSucceed ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-700">
            Produto cadastrado e aprovado com sucesso. Ele já aparece na lista
            de aprovados e no catálogo público.
          </p>
          <Button fullWidth onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-5 text-sm leading-6 text-slate-600">
            Cadastro administrativo: o produto será aprovado automaticamente
            após o envio.
          </p>
          <ProductRegistrationForm
            approveAfterCreate
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </Modal>
  )
}
