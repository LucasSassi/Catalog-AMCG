import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface NavDropdownItem {
  label: string
  to?: string
  href?: string
  onClick?: () => void
}

interface NavDropdownProps {
  label: string
  items: NavDropdownItem[]
  align?: 'left' | 'right'
}

export function NavDropdown({
  label,
  items,
  align = 'left',
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-white transition hover:text-accent-300"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
        <span className="text-accent-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute top-full z-50 min-w-52 rounded-b-xl bg-brand-800 py-2 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => {
            const className =
              'block w-full px-4 py-2 text-left text-sm text-white transition hover:bg-brand-700 hover:text-accent-300'

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={className}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                >
                  {item.label}
                </button>
              )
            }

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className={className}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    item.href.startsWith('http') ? 'noreferrer' : undefined
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.to ?? '/'}
                role="menuitem"
                className={className}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

interface MobileNavGroupProps {
  label: string
  children: ReactNode
}

export function MobileNavGroup({ label, children }: MobileNavGroupProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-brand-600">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {label}
        <span className="text-accent-400" aria-hidden="true">
          {isOpen ? '▴' : '▾'}
        </span>
      </button>
      {isOpen ? <div className="space-y-1 pb-3 pl-4">{children}</div> : null}
    </div>
  )
}
