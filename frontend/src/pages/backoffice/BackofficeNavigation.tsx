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
      <aside className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:w-64">
        <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Cadastros
        </p>
        <nav
          className="flex gap-2 overflow-x-auto lg:flex-col"
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
        className="inline-flex self-start overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm lg:hidden"
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
      className="hidden max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm lg:inline-flex"
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
    <>
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
    </>
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
  let classes = 'text-slate-600 hover:bg-slate-50'

  if (active) {
    classes = 'bg-brand-700 text-white'
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${classes}`}
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
  let classes = 'text-slate-700 hover:bg-brand-50 hover:text-brand-800'

  if (active) {
    classes = 'bg-brand-700 text-white'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-left font-semibold transition lg:w-full ${classes}`}
    >
      <span className="h-5 w-5" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
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
