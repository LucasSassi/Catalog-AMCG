import { useEffect, useState } from 'react'
import { AuthStep } from '../../auth/components/AuthStep'
import { hasAuthToken } from '../../../shared/api/auth-token'
import { Button } from '../../../shared/components/Button'
import { Drawer } from '../../../shared/components/Drawer'
import { ProducerRegistrationForm } from './ProducerRegistrationForm'

type DrawerStep = 'auth' | 'form' | 'success'

interface ProducerRegistrationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ProducerRegistrationDrawer({
  isOpen,
  onClose,
}: ProducerRegistrationDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('auth')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (hasAuthToken()) {
      setStep('form')
      return
    }

    setStep('auth')
  }, [isOpen])

  function handleClose() {
    setStep('auth')
    onClose()
  }

  function handleAuthSuccess() {
    setStep('form')
  }

  function handleRegistrationSuccess() {
    setStep('success')
  }

  if (!isOpen) {
    return null
  }

  let title = 'Cadastro de produtor'

  if (step === 'auth') {
    title = 'Acesso'
  }

  if (step === 'success') {
    title = 'Cadastro enviado'
  }

  return (
    <Drawer title={title} onClose={handleClose}>
      {step === 'auth' ? <AuthStep onSuccess={handleAuthSuccess} /> : null}

      {step === 'form' ? (
        <div>
          <p className="mb-5 text-sm leading-6 text-slate-600">
            Preencha os dados do seu perfil. Após o envio, a AMCG fará a
            curadoria antes da publicação.
          </p>
          <ProducerRegistrationForm onSuccess={handleRegistrationSuccess} />
        </div>
      ) : null}

      {step === 'success' ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-700">
            Cadastro enviado! A AMCG vai analisar seu perfil. Você receberá
            retorno em breve.
          </p>
          <Button fullWidth onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : null}
    </Drawer>
  )
}
