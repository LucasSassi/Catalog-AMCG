import { useId, type ReactNode } from 'react'

export interface SectionTab {
  id: string
  label: string
  content: ReactNode
}

interface TabbedSectionProps {
  title: string
  eyebrow?: string
  tabs: SectionTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
}

function getTabClassName(isActive: boolean): string {
  const stateClassName = isActive
    ? 'bg-primary-dark font-bold text-white shadow-sm'
    : 'font-semibold text-text-muted hover:text-primary-darker'

  return `min-h-9 rounded-full px-4 text-sm transition ${stateClassName}`
}

export function TabbedSection({
  title,
  eyebrow,
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
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8a5a00]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
            {title}
          </h2>
        </div>

        {hasMultipleTabs ? (
          <div
            role="tablist"
            aria-label={title}
            className="inline-flex rounded-full border border-[#e8dfcf] bg-white p-1"
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
