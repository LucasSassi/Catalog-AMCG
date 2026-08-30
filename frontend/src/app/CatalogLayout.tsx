import { Link, Outlet } from 'react-router-dom'

export function CatalogLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-bold text-brand-900">
            Catálogo Regional AMCG
          </Link>
          <Link
            to="/backoffice"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Acessar painel
          </Link>
        </div>
      </header>

      <Outlet />

      <footer className="mt-12 border-t border-brand-800 bg-brand-900 text-brand-100">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm sm:px-6 lg:px-8">
          <p className="font-semibold text-white">Catálogo Regional AMCG</p>
          <p className="mt-1">
            Aproximando consumidores e produtores dos Campos Gerais.
          </p>
        </div>
      </footer>
    </div>
  )
}
