import { Link } from 'react-router-dom'
import camposGerais from '../../shared/assets/campos-gerais.png'
import idrLogo from '../../shared/assets/IDR-Logo.png'
import sebraeLogo from '../../shared/assets/SEBRAE-logo.png'
import uepgLogo from '../../shared/assets/UEPG-logo.png'
import amcgLogo from '../../shared/assets/LOGO_AMCG.png'

export function AboutPage() {
  return (
    <main className="bg-secondary-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
            Quem somos
          </h1>
          <p className="mt-1 text-sm font-semibold text-primary-darker">
            Associação dos Municípios dos Campos Gerais
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-surface bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
              O que é AMCG?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
              A AMCG é um órgão de representação municipal e microrregional,
              constituída sob a forma de sociedade civil sem fins lucrativos. É
              composta por 19 municípios:{' '}
              <strong>Arapoti</strong>, <strong>Carambeí</strong>,{' '}
              <strong>Castro</strong>, <strong>Curiúva</strong>,{' '}
              <strong>Imbaú</strong>, <strong>Ipiranga</strong>,{' '}
              <strong>Ivaí</strong>, <strong>Jaguariaíva</strong>,{' '}
              <strong>Ortigueira</strong>, <strong>Palmeira</strong>,{' '}
              <strong>Piraí do Sul</strong>, <strong>Porto Amazonas</strong>,{' '}
              <strong>Ponta Grossa</strong>, <strong>Reserva</strong>,{' '}
              <strong>São João do Triunfo</strong>, <strong>Sengés</strong>,{' '}
              <strong>Telêmaco Borba</strong>, <strong>Tibagi</strong> e{' '}
              <strong>Ventania</strong>.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
              Seu principal objetivo é a integração regional, econômica e
              administrativa, buscando o fortalecimento dos municípios e o
              desenvolvimento econômico e social. Este catálogo — 1ª edição
              lançada na ExpoIpiranga, em parceria com o Sebrae e com apoio dos
              Comitês Territoriais Avança Campos Gerais e Vale do Tibagi —
              amplia a visibilidade dos empreendedores rurais e fortalece a
              identidade produtiva da região.
            </p>

            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary-darker">
                Entidades Parceiras
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-6 sm:gap-8">
                <img
                  src={uepgLogo}
                  alt="Logo da Universidade Estadual de Ponta Grossa (UEPG)"
                  className="h-14 w-auto object-contain"
                />
                <img
                  src={sebraeLogo}
                  alt="Logo do Sebrae"
                  className="h-12 w-auto object-contain"
                />
                <img
                  src={idrLogo}
                  alt="Logo do IDR-Paraná"
                  className="h-14 w-auto object-contain"
                />
                <img
                  src={amcgLogo}
                  alt="Logo da Associação dos Municípios dos Campos Gerais (AMCG)"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <img
              src={camposGerais}
              alt="Mapa dos municípios dos Campos Gerais"
              className="w-full max-w-md h-auto object-contain lg:max-w-none"
            />
          </div>
        </div>

        <section
          id="contato"
          className="mt-10 scroll-mt-28 rounded-2xl border border-surface bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-foreground">
            Dúvidas e Contato
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li>
              Av. Visconde de Taunay, 1855, sala 25, 2º andar, Ronda — Ponta
              Grossa/PR, CEP 84051-000
            </li>
            <li>
              <a
                href="tel:+554232251398"
                className="font-semibold text-primary-darker hover:underline"
              >
                (42) 3225-1398
              </a>
            </li>
            <li>
              <a
                href="mailto:secretaria@amcg.com.br"
                className="font-semibold text-primary-darker hover:underline"
              >
                secretaria@amcg.com.br
              </a>
            </li>
          </ul>
          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-semibold text-primary-darker hover:underline"
          >
            Voltar ao catálogo
          </Link>
        </section>
      </div>
    </main>
  )
}
