import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/Button'
import { useRegister } from '../hooks/useRegister'

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { createAccount, error, isLoading } = useRegister()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const didRegister = await createAccount({ nome, email, senha: password })

    if (didRegister) {
      onSuccess()
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Nome completo
        </span>
        <input
          required
          type="text"
          autoComplete="name"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
          placeholder="Seu nome"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          E-mail
        </span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
          placeholder="nome@email.com"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Senha
        </span>
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
          placeholder="Mínimo 6 caracteres"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  )
}
