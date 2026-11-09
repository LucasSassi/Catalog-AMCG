import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useReviewProducts } from '../features/produto/hooks/useReviewProducts'
import { useReviewProducers } from '../features/produtor/hooks/useReviewProducers'
import { getAuthTokenEmail, removeAuthToken } from '../shared/api/auth-token'
import amcgLogo from '../shared/assets/LOGO_AMCG_b.png'
import { ToastProvider } from '../shared/components/Toast'
import type { BackofficeData } from './backoffice-data'
import { useBackofficeActions } from './useBackofficeActions'

export function BackofficeLayout() {
  return (
    <ToastProvider>
      <BackofficeShell />
    </ToastProvider>
  )
}

function BackofficeShell() {
  const navigate = useNavigate()
  const email = getAuthTokenEmail()
  const producers = useReviewProducers('TODOS')
  const products = useReviewProducts('TODOS')
  const actions = useBackofficeActions(producers, products)
  const context: BackofficeData = { producers, products, actions }

  const pendingProducers = producers.producers.filter(
    (producer) => producer.status === 'PENDENTE',
  ).length
  const pendingProducts = products.products.filter(
    (product) => product.status === 'PENDENTE',
  ).length

  function logout() {
    removeAuthToken()
    navigate('/backoffice/login')
  }

  return (
    <div className="min-h-screen bg-backoffice lg:flex">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-foreground"
      >
        Pular para o conteúdo
      </a>

      <aside className="hidden bg-foreground px-4 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:gap-8">
        <Link
          to="/backoffice/produtores"
          className="flex items-center gap-3 rounded-lg px-2"
        >
          <img
            src={amcgLogo}
            alt="AMCG"
            width={56}
            height={43}
            className="h-10 w-auto"
          />
          <span>
            <span className="block text-sm font-bold">Backoffice</span>
            <span className="block text-xs text-muted">Curadoria</span>
          </span>
        </Link>

        <nav aria-label="Seções do backoffice" className="flex flex-col gap-1">
          <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Cadastros
          </p>
          <SidebarLink
            to="/backoffice/produtores"
            icon={<ProducerIcon />}
            badge={pendingProducers}
          >
            Produtores
          </SidebarLink>
          <SidebarLink
            to="/backoffice/produtos"
            icon={<ProductIcon />}
            badge={pendingProducts}
          >
            Produtos
          </SidebarLink>
          <p className="px-3 pb-1.5 pt-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Vitrine
          </p>
          <SidebarLink
            to="/backoffice/destaques"
            icon={<StarIcon />}
            badge={0}
          >
            Destaques
          </SidebarLink>
          <SidebarLink to="/backoffice/banners" icon={<ImageIcon />} badge={0}>
            Banners
          </SidebarLink>
          <p className="px-3 pb-1.5 pt-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Atalhos
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <span className="h-5 w-5 shrink-0" aria-hidden="true">
              <EyeIcon />
            </span>
            Ver catálogo público
          </a>
        </nav>

        <p className="mt-auto px-3 text-xs leading-5 text-muted">
          Dica: tecle <strong className="text-white">?</strong> para ver os
          atalhos.
        </p>

        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-foreground"
            aria-hidden="true"
          >
            AD
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Administrador</p>
            {email ? (
              <p className="truncate text-xs text-muted">{email}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            title="Sair"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white/90 transition hover:bg-white/10"
          >
            <span className="h-[18px] w-[18px]" aria-hidden="true">
              <LogoutIcon />
            </span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-foreground px-4 py-3 text-white lg:hidden">
        <Link to="/backoffice/produtores" className="flex items-center gap-3">
          <img
            src={amcgLogo}
            alt="AMCG"
            width={46}
            height={35}
            className="h-9 w-auto"
          />
          <span>
            <span className="block text-xs text-muted">Curadoria AMCG</span>
            <span className="block text-base font-extrabold">
              {pendingProducers + pendingProducts} aguardando
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          <span className="h-[18px] w-[18px]" aria-hidden="true">
            <LogoutIcon />
          </span>
          Sair
        </button>
      </header>

      <div id="conteudo" className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Outlet context={context} />
      </div>

      <nav
        aria-label="Navegação do backoffice"
        className="fixed inset-x-0 bottom-0 z-30 grid h-[72px] grid-cols-4 border-t border-border-soft bg-white lg:hidden"
      >
        <BottomLink
          to="/backoffice/produtores"
          icon={<ProducerIcon />}
          badge={pendingProducers}
        >
          Produtores
        </BottomLink>
        <BottomLink
          to="/backoffice/produtos"
          icon={<ProductIcon />}
          badge={pendingProducts}
        >
          Produtos
        </BottomLink>
        <BottomLink to="/backoffice/destaques" icon={<StarIcon />} badge={0}>
          Destaques
        </BottomLink>
        <BottomLink to="/backoffice/banners" icon={<ImageIcon />} badge={0}>
          Banners
        </BottomLink>
      </nav>
    </div>
  )
}

function PendingBadge({ count }: { count: number }) {
  if (count === 0) {
    return null
  }

  return (
    <span
      className="ml-auto min-w-6 rounded-full bg-accent-yellow px-1.5 py-0.5 text-center text-xs font-bold text-foreground"
    >
      <span className="sr-only">, </span>
      {count}
      <span className="sr-only"> pendentes</span>
    </span>
  )
}

function SidebarLink({
  to,
  icon,
  badge,
  children,
}: {
  to: string
  icon: ReactNode
  badge: number
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition ${
          isActive
            ? 'bg-primary font-semibold text-white'
            : 'font-medium text-white/90 hover:bg-white/10'
        }`
      }
    >
      <span className="h-5 w-5 shrink-0" aria-hidden="true">
        {icon}
      </span>
      {children}
      <PendingBadge count={badge} />
    </NavLink>
  )
}

function BottomLink({
  to,
  icon,
  badge,
  children,
}: {
  to: string
  icon: ReactNode
  badge: number
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center gap-1 text-xs ${
          isActive ? 'font-bold text-primary' : 'font-semibold text-text-muted'
        }`
      }
    >
      <span className="relative h-[22px] w-[22px]" aria-hidden="true">
        {icon}
        {badge > 0 ? (
          <span className="absolute -right-3 -top-2 min-w-5 rounded-full bg-accent-yellow px-1 text-center text-[10px] font-bold leading-4 text-foreground">
            {badge}
          </span>
        ) : null}
      </span>
      {children}
      {badge > 0 ? <span className="sr-only">, {badge} pendentes</span> : null}
    </NavLink>
  )
}

function ProducerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5z" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 16-5-5-9 8" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}
