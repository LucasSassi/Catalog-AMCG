import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthStep } from '../../features/auth/components/AuthStep'
import { InscriptionForm } from '../../features/produtor/components/InscriptionForm'
import { hasAuthToken } from '../../shared/api/auth-token'
import { Button } from '../../shared/components/Button'

type PageStep = 'auth' | 'form' | 'success'

function resolveInitialStep(): PageStep {
  if (hasAuthToken()) {
    return 'form'
  }

  return 'auth'
}

export function InscriptionPage() {
  const [step, setStep] = useState<PageStep>(resolveInitialStep)

  return (
    <main className="bg-background-secondary py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Inscrição para o Catálogo de Produtos dos Campos Gerais.
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Para se inscrever preencha as seguintes informações:
          </p>
        </div>

        {step === 'auth' ? (
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
            <AuthStep onSuccess={() => setStep('form')} />
          </div>
        ) : null}

        {step === 'form' ? (
          <InscriptionForm onSuccess={() => setStep('success')} />
        ) : null}

        {step === 'success' ? (
          <div className="space-y-5 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-primary-darker">
              Cadastro enviado
            </h2>
            <p className="text-sm leading-6 text-slate-700">
              Cadastro enviado! A AMCG vai analisar seu perfil e seus produtos.
              Você receberá retorno em breve.
            </p>
            <Link to="/">
              <Button>Voltar ao catálogo</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  )
}
