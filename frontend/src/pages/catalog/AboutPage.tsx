import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <main className="bg-brand-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
            Quem somos
          </h1>
          <p className="mt-1 text-sm font-semibold text-brand-700">
            Associação dos Municípios dos Campos Gerais
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm leading-7 text-slate-700 sm:text-base">
              A AMCG é um órgão de representação municipal e microrregional,
              constituída sob a forma de sociedade civil sem fins lucrativos. É
              composta por 19 municípios: Arapoti, Carambeí, Castro, Curiúva,
              Imbaú, Ipiranga, Ivaí, Jaguariaíva, Ortigueira, Palmeira, Piraí do
              Sul, Porto Amazonas, Ponta Grossa, Reserva, São João do Triunfo,
              Sengés, Telêmaco Borba, Tibagi e Ventania.
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
            <a
              href="https://www.amcg.com.br"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Conhecer o site da AMCG
            </a>
          </div>

          <aside className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Sobre o catálogo
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>Mais de 50 produtos da agricultura familiar</li>
              <li>25 produtores de 13 municípios</li>
              <li>Seleção por critérios técnicos de edital</li>
              <li>Parceria AMCG + Sebrae</li>
              <li>
                Destaques: queijos, mel, embutidos, biscoitos, pães, sucos e
                geleias
              </li>
            </ul>
          </aside>
        </div>

        <section
          id="contato"
          className="mt-10 scroll-mt-28 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-brand-900">
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
                className="font-semibold text-brand-700 hover:underline"
              >
                (42) 3225-1398
              </a>
            </li>
            <li>
              <a
                href="mailto:secretaria@amcg.com.br"
                className="font-semibold text-brand-700 hover:underline"
              >
                secretaria@amcg.com.br
              </a>
            </li>
          </ul>
          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-semibold text-brand-700 hover:underline"
          >
            Voltar ao catálogo
          </Link>
        </section>
      </div>
    </main>
  )
}
