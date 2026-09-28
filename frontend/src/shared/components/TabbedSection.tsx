import { useId, type ReactNode } from 'react'

export interface SectionTab {
  id: string
  label: string
  content: ReactNode
}

interface TabbedSectionProps {
  title: string
  tabs: SectionTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
}

function getTabClassName(isActive: boolean): string {
  const stateClassName = isActive
    ? 'bg-brand-600 text-white shadow-sm'
    : 'text-slate-600 hover:text-brand-700'

  return `rounded-full px-4 py-1.5 text-sm font-semibold transition ${stateClassName}`
}

export function TabbedSection({
  title,
  tabs,
  activeTabId,
  onTabChange,
}: TabbedSectionProps) {
  const baseId = useId()

  if (tabs.length === 0) {
    return null
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  const hasMultipleTabs = tabs.length > 1
  const getTabId = (tabId: string) => `${baseId}-tab-${tabId}`
  const panelId = `${baseId}-panel`

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold uppercase tracking-wide text-brand-900">
          {title}
        </h2>

        {hasMultipleTabs ? (
          <div
            role="tablist"
            aria-label={title}
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id

              return (
                <button
                  key={tab.id}
                  id={getTabId(tab.id)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  className={getTabClassName(isActive)}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={hasMultipleTabs ? getTabId(activeTab.id) : undefined}
      >
        {activeTab.content}
      </div>
    </div>
  )
}
