import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../../features/auth/components/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="grid min-h-screen place-items-center bg-brand-900 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
          Área restrita
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">
          Painel de curadoria
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Entre com sua conta para avaliar os cadastros de produtores e
          produtos.
        </p>

        <LoginForm onSuccess={() => navigate('/backoffice')} />
      </section>
    </main>
  )
}
