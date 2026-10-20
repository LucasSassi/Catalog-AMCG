import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
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
    <Modal title="Editar produto" onClose={handleClose}>
      {didSucceed ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-700">
            Produto atualizado com sucesso.
          </p>
          <Button fullWidth onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <ProductRegistrationForm product={product} onSuccess={handleSuccess} />
      )}
    </Modal>
  )
}
