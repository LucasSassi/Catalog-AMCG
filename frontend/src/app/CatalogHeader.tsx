import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoCatalogo from '../shared/assets/logo-catalogo-campos-gerais-branca.png'
import {
  MobileNavGroup,
  NavDropdown,
  type NavDropdownItem,
} from '../shared/components/NavDropdown'

interface CatalogHeaderProps {
  onRegisterClick: () => void
}

const linkClassName =
  'block px-2 py-1.5 text-sm text-brand-100 transition hover:text-accent-300'

export function CatalogHeader({ onRegisterClick }: CatalogHeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const catalogItems: NavDropdownItem[] = [
    { label: 'Conheça o Projeto', to: '/quem-somos' },
    {
      label: 'Baixe os Catálogos',
      href: 'https://www.amcg.com.br',
    },
  ]

  const producersItems: NavDropdownItem[] = [
    { label: 'Produtores de Destaque', to: '/#produtores-destaque' },
    { label: 'Produtores', to: '/produtores' },
  ]

  const productsItems: NavDropdownItem[] = [
    { label: 'Produtos de Destaque', to: '/#produtos-destaque' },
    { label: 'Produtos Catálogo', to: '/#produtos' },
  ]

  const joinItems: NavDropdownItem[] = [
    { label: 'Cadastrar', onClick: onRegisterClick },
    { label: 'Dúvidas e Contato', to: '/quem-somos#contato' },
  ]

  function closeMobile() {
    setIsMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-800 shadow-md">
      <div className="mx-auto hidden max-w-7xl items-start gap-2 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center lg:px-8">
        <nav className="flex flex-wrap items-center justify-end gap-1 lg:gap-3">
          <NavDropdown label="Conheça o Catálogo" items={catalogItems} />
          <NavDropdown
            label="Conheça nossos Produtores"
            items={producersItems}
          />
        </nav>

        <Link to="/" className="justify-self-center px-2">
          <img
            src={logoCatalogo}
            alt="Catálogo de Produtos dos Campos Gerais"
            className="h-14 w-auto object-contain lg:h-16"
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-start gap-1 lg:gap-3">
          <NavDropdown
            label="Conheça nossos Produtos"
            items={productsItems}
          />
          <NavDropdown
            label="Faça parte do Catálogo"
            items={joinItems}
            align="right"
          />
        </nav>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:hidden">
        <Link to="/" onClick={closeMobile}>
          <img
            src={logoCatalogo}
            alt="Catálogo de Produtos dos Campos Gerais"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <button
          type="button"
          className="rounded-lg border border-brand-500 px-3 py-2 text-sm font-semibold text-white"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((current) => !current)}
        >
          Menu
        </button>
      </div>

      {isMobileOpen ? (
        <nav className="border-t border-brand-700 bg-brand-900 md:hidden">
          <MobileNavGroup label="Conheça o Catálogo">
            <Link to="/quem-somos" className={linkClassName} onClick={closeMobile}>
              Conheça o Projeto
            </Link>
            <a
              href="https://www.amcg.com.br"
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
              onClick={closeMobile}
            >
              Baixe os Catálogos
            </a>
          </MobileNavGroup>
          <MobileNavGroup label="Conheça nossos Produtores">
            <Link
              to="/#produtores-destaque"
              className={linkClassName}
              onClick={closeMobile}
            >
              Produtores de Destaque
            </Link>
            <Link to="/produtores" className={linkClassName} onClick={closeMobile}>
              Produtores
            </Link>
          </MobileNavGroup>
          <MobileNavGroup label="Conheça nossos Produtos">
            <Link
              to="/#produtos-destaque"
              className={linkClassName}
              onClick={closeMobile}
            >
              Produtos de Destaque
            </Link>
            <Link to="/#produtos" className={linkClassName} onClick={closeMobile}>
              Produtos Catálogo
            </Link>
          </MobileNavGroup>
          <MobileNavGroup label="Faça parte do Catálogo">
            <button
              type="button"
              className={linkClassName}
              onClick={() => {
                onRegisterClick()
                closeMobile()
              }}
            >
              Cadastrar
            </button>
            <Link
              to="/quem-somos#contato"
              className={linkClassName}
              onClick={closeMobile}
            >
              Dúvidas e Contato
            </Link>
          </MobileNavGroup>
          <Link
            to="/backoffice"
            className="block px-4 py-3 text-sm font-semibold text-accent-300"
            onClick={closeMobile}
          >
            Acessar painel
          </Link>
        </nav>
      ) : null}

      <div className="hidden border-t border-brand-700 md:block">
        <div className="mx-auto flex max-w-7xl justify-end px-4 py-1.5 lg:px-8">
          <Link
            to="/backoffice"
            className="text-xs font-semibold uppercase tracking-wide text-brand-200 transition hover:text-accent-300"
          >
            Acessar painel
          </Link>
        </div>
      </div>
    </header>
  )
}
