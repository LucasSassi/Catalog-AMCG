import { useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '../../../shared/components/Button'
import { useLogin } from '../hooks/useLogin'

interface LoginFormProps {
  onSuccess: () => void
  requireAdmin?: boolean
  showRemember?: boolean
}

export function LoginForm({
  onSuccess,
  requireAdmin = false,
  showRemember = false,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [remember, setRemember] = useState(true)
  const { authenticate, error, isLoading } = useLogin()
  const errorId = useId()
  const capsId = useId()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const usuario = await authenticate(
      { email, senha: password },
      { requireAdmin, remember: showRemember ? remember : true },
    )

    if (usuario) {
      onSuccess()
    }
  }

  function updateCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState('CapsLock'))
  }

  const fieldBorder = error ? 'border-[#b42318]' : 'border-slate-300'

  return (
    <form className="mt-7 flex flex-col gap-[18px]" onSubmit={handleSubmit}>
      {error ? (
        <div
          id={errorId}
          role="alert"
          className="flex gap-2.5 rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-danger"
        >
          <svg className="mt-px h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16v.5" />
          </svg>
          <span>{error}</span>
        </div>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-foreground">E-mail</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-12 w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-text focus:border-primary ${fieldBorder}`}
          placeholder="nome@amcg.com.br"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${capsId}-senha`} className="text-sm font-semibold text-foreground">
          Senha
        </label>
        <div
          className={`flex min-h-12 items-center rounded-[10px] border bg-white pl-3.5 focus-within:border-primary ${fieldBorder}`}
        >
          <input
            id={`${capsId}-senha`}
            required
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={updateCapsLock}
            onKeyUp={updateCapsLock}
            onBlur={() => setCapsLock(false)}
            aria-invalid={Boolean(error)}
            aria-describedby={capsLock ? capsId : error ? errorId : undefined}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-text outline-none"
            placeholder="Digite sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={showPassword}
            className="grid h-[46px] w-12 shrink-0 place-items-center text-text-muted transition hover:text-foreground"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword ? <path d="M4 4l16 16" /> : null}
            </svg>
          </button>
        </div>
        {capsLock ? (
          <span id={capsId} className="text-[13px] font-semibold text-[#8a4b00]">
            Caps Lock está ativado.
          </span>
        ) : null}
      </div>

      {showRemember ? (
        <label className="flex min-h-11 items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-[18px] w-[18px] accent-primary"
          />
          Manter conectado neste computador
        </label>
      ) : null}

      <Button type="submit" fullWidth disabled={isLoading} className="min-h-[50px] text-[15px]">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
