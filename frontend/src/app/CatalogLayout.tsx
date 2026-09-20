import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ProducerRegistrationDrawer } from '../features/produtor/components/ProducerRegistrationDrawer'
import logoFooter from '../shared/assets/logo-catalogo-campos-gerais-branca.png'
import { CatalogHeader } from './CatalogHeader'

export function CatalogLayout() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <CatalogHeader onRegisterClick={() => setIsRegistrationOpen(true)} />

      <Outlet />

      <footer className="mt-12 border-t border-brand-800 bg-brand-900 text-brand-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <img
              src={logoFooter}
              alt="Catálogo de Produtos dos Campos Gerais"
              className="mb-4 h-14 w-auto object-contain"
            />
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
              Quem somos
            </p>
            <p className="mt-3 text-sm leading-6">
              A Associação dos Municípios dos Campos Gerais (AMCG) é um órgão de
              representação municipal e microrregional, sociedade civil sem fins
              lucrativos, composta por 19 municípios. Seu objetivo é a integração
              regional, econômica e administrativa, visando o desenvolvimento
              econômico e social.
            </p>
            <p className="mt-3 text-xs text-brand-100/80">
              CNPJ 00.756.565/0001-01
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
              Links
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Catálogo de produtos
                </Link>
              </li>
              <li>
                <Link to="/quem-somos" className="transition hover:text-white">
                  Quem somos
                </Link>
              </li>
              <li>
                <Link to="/produtores" className="transition hover:text-white">
                  Produtores
                </Link>
              </li>
              <li>
                <a
                  href="https://www.amcg.com.br"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Site oficial AMCG
                </a>
              </li>
            </ul>
          </div>

          <div id="contato">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
              Contato
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>
                Av. Visconde de Taunay, 1855, sala 25, 2º andar, Ronda — Ponta
                Grossa/PR, CEP 84051-000
              </li>
              <li>
                <a
                  href="tel:+554232251398"
                  className="transition hover:text-white"
                >
                  (42) 3225-1398
                </a>
              </li>
              <li>
                <a
                  href="mailto:secretaria@amcg.com.br"
                  className="transition hover:text-white"
                >
                  secretaria@amcg.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-800">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-brand-100/70 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} AMCG — Catálogo de Produtos dos Campos
            Gerais. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <ProducerRegistrationDrawer
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  )
}
