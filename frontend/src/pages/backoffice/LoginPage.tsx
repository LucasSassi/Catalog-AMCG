import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../../features/auth/components/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="grid min-h-screen place-items-center bg-page px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Área restrita
        </p>
        <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
          Painel de curadoria
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Entre com sua conta para avaliar e cadastrar produtores e produtos.
        </p>

        <LoginForm onSuccess={() => navigate('/backoffice')} />
      </section>
    </main>
  )
}
