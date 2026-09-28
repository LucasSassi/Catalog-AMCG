import type { ReactNode } from 'react'

export type ReviewTab = 'producers' | 'products'
export type ReviewStatus = 'PENDENTE' | 'REJEITADO' | 'APROVADO' | 'TODOS'

interface BackofficeNavigationProps {
  activeTab: ReviewTab
  status: ReviewStatus
  producerCount: number
  productCount: number
  onTabChange: (tab: ReviewTab) => void
  onStatusChange: (status: ReviewStatus) => void
}

export function BackofficeNavigation({
  activeTab,
  status,
  producerCount,
  productCount,
  onTabChange,
  onStatusChange,
}: BackofficeNavigationProps) {
  return (
    <>
      <aside className="shrink-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:w-64">
        <p className="pb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Cadastros
        </p>
        <nav
          className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1"
          aria-label="Cadastros para análise"
        >
          <SidebarButton
            label="Produtores"
            count={producerCount}
            active={activeTab === 'producers'}
            icon={<ProducerIcon />}
            onClick={() => onTabChange('producers')}
          />
          <SidebarButton
            label="Produtos"
            count={productCount}
            active={activeTab === 'products'}
            icon={<ProductIcon />}
            onClick={() => onTabChange('products')}
          />
        </nav>
      </aside>

      <div
        className="w-full overflow-x-auto border-b border-slate-200 bg-white lg:hidden"
        role="tablist"
        aria-label="Status dos cadastros"
      >
        <StatusTabs status={status} onChange={onStatusChange} />
      </div>
    </>
  )
}

export function DesktopStatusTabs({
  status,
  onChange,
}: {
  status: ReviewStatus
  onChange: (status: ReviewStatus) => void
}) {
  return (
    <div
      className="hidden w-full overflow-x-auto border-b border-slate-200 bg-white lg:block"
      role="tablist"
      aria-label="Status dos cadastros"
    >
      <StatusTabs status={status} onChange={onChange} />
    </div>
  )
}

function StatusTabs({
  status,
  onChange,
}: {
  status: ReviewStatus
  onChange: (status: ReviewStatus) => void
}) {
  return (
    <div className="flex gap-6 overflow-x-auto px-1 py-3 sm:gap-8">
      <StatusTab
        label="Pendentes"
        active={status === 'PENDENTE'}
        onClick={() => onChange('PENDENTE')}
      />
      <StatusTab
        label="Aprovados"
        active={status === 'APROVADO'}
        onClick={() => onChange('APROVADO')}
      />
      <StatusTab
        label="Rejeitados"
        active={status === 'REJEITADO'}
        onClick={() => onChange('REJEITADO')}
      />
      <StatusTab
        label="Todos"
        active={status === 'TODOS'}
        onClick={() => onChange('TODOS')}
      />
    </div>
  )
}

function StatusTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  let classes =
    'whitespace-nowrap text-sm font-extrabold text-slate-900 transition hover:text-brand-600 sm:text-base'

  if (active) {
    classes =
      'whitespace-nowrap text-sm font-extrabold text-brand-800 underline decoration-2 underline-offset-8 sm:text-base'
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={classes}
    >
      {label}
    </button>
  )
}

function SidebarButton({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  icon: ReactNode
  onClick: () => void
}) {
  let classes = 'text-slate-800 hover:bg-brand-50 hover:text-brand-800'

  if (active) {
    classes = 'bg-brand-50 font-bold text-brand-800'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition lg:w-full ${classes}`}
    >
      <span className="h-5 w-5 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
        {count}
      </span>
    </button>
  )
}

function ProducerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  )
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m7.5 4.3 9 5.2v10l-9-5.2z" />
      <path d="m7.5 4.3 4.5-2.6 9 5.2-4.5 2.6M16.5 19.5l4.5-2.6v-10" />
      <path d="m3 6.9 4.5-2.6M3 6.9v10l9 5.2 4.5-2.6" />
    </svg>
  )
}
