import { useState } from 'react'
import { AuthStep } from '../../features/auth/components/AuthStep'
import { hasAuthToken } from '../../shared/api/auth-token'
import { MyProfilePage } from '../account/MyProfilePage'
import { PreRegistrationStep } from '../account/PreRegistrationStep'
export function InscriptionPage() {
  const [authenticated, setAuthenticated] = useState(hasAuthToken)
  const [accountStep, setAccountStep] = useState(false)
  if (authenticated) return <MyProfilePage />
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Inscrição para o catálogo</h1>
      {accountStep ? (
        <AuthStep onSuccess={() => setAuthenticated(true)} />
      ) : (
        <PreRegistrationStep
          createAccountMode
          onLinked={() => setAuthenticated(true)}
          onNeedAuth={() => setAccountStep(true)}
        />
      )}
    </main>
  )
}
