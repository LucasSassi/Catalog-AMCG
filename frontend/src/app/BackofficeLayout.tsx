import { Link, Outlet, useNavigate } from 'react-router-dom'
import { removeAuthToken } from '../shared/api/auth-token'
import { Button } from '../shared/components/Button'

export function BackofficeLayout() {
  const navigate = useNavigate()

  function logout() {
    removeAuthToken()
    navigate('/backoffice/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-bold text-brand-900">Backoffice AMCG</p>
            <p className="text-xs text-slate-500">Curadoria do catálogo</p>
          </div>
          <nav className="flex items-center gap-2" aria-label="Navegação">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Ver catálogo
            </Link>
            <Button variant="ghost" onClick={logout}>
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
