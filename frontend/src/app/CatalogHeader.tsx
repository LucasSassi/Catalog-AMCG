import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoCatalogo from '../shared/assets/logo-catalogo-campos-gerais-branca.png'
import {
  MobileNavGroup,
  NavDropdown,
  type NavDropdownItem,
} from '../shared/components/NavDropdown'
import { BackToCatalogLink } from './BackToCatalogLink'

const CATALOG_HOME_PATH = '/'

const linkClassName =
  'block min-h-11 px-4 py-3 text-sm text-surface transition hover:text-accent-yellow-soft'

export function CatalogHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const showBackLink = pathname !== CATALOG_HOME_PATH

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
    { label: 'Cadastrar', to: '/inscricao' },
    { label: 'Dúvidas e Contato', to: '/quem-somos#contato' },
  ]

  function closeMobile() {
    setIsMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-primary-dark shadow-md">
      <div className="relative mx-auto hidden max-w-7xl items-start gap-2 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center lg:px-8">
        {showBackLink ? (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 lg:left-8">
            <BackToCatalogLink />
          </div>
        ) : null}
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

        <Link
          to="/backoffice"
          className="absolute bottom-1 right-2 text-xs font-semibold uppercase tracking-wide text-muted transition hover:text-accent-yellow-soft lg:right-8"
        >
          Acessar painel
        </Link>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          {showBackLink ? <BackToCatalogLink onClick={closeMobile} /> : null}
          <Link to="/" onClick={closeMobile}>
            <img
              src={logoCatalogo}
              alt="Catálogo de Produtos dos Campos Gerais"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-success px-3 py-2 text-sm font-semibold text-white"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((current) => !current)}
        >
          Menu
        </button>
      </div>

      {isMobileOpen ? (
        <nav className="border-t border-primary-darker bg-foreground md:hidden">
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
            <Link
              to="/inscricao"
              className={linkClassName}
              onClick={closeMobile}
            >
              Cadastrar
            </Link>
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
            className="block px-4 py-3 text-sm font-semibold text-accent-yellow-soft"
            onClick={closeMobile}
          >
            Acessar painel
          </Link>
        </nav>
      ) : null}
    </header>
  )
}
