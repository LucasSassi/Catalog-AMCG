import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/Button'
import { useLogin } from '../hooks/useLogin'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { authenticate, error, isLoading } = useLogin()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const didLogin = await authenticate({ email, senha: password })

    if (didLogin) {
      onSuccess()
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
          placeholder="nome@amcg.com.br"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Senha
        </span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
          placeholder="Digite sua senha"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
