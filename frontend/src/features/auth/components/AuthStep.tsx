import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

type AuthTab = 'login' | 'register'

interface AuthStepProps {
  onSuccess: () => void
}

export function AuthStep({ onSuccess }: AuthStepProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('register')

  return (
    <div>
      <p className="text-sm leading-6 text-slate-600">
        Para cadastrar seu perfil de produtor, primeiro crie uma conta ou entre
        com suas credenciais.
      </p>

      <div className="mt-5 flex rounded-lg border border-slate-200 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
            activeTab === 'register'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Criar conta
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
            activeTab === 'login'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Entrar
        </button>
      </div>

      {activeTab === 'register' ? (
        <RegisterForm onSuccess={onSuccess} />
      ) : (
        <LoginForm onSuccess={onSuccess} />
      )}
    </div>
  )
}
