import { Link, useNavigate } from 'react-router-dom'
import { LoginForm } from '../../features/auth/components/LoginForm'
import amcgLogo from '../../shared/assets/LOGO_AMCG_b.png'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen flex-wrap bg-backoffice">
      <section className="relative flex flex-[1_1_26rem] flex-col justify-between gap-10 overflow-hidden bg-foreground p-8 text-white sm:p-12">
        <img
          src={amcgLogo}
          alt="AMCG — Associação dos Municípios dos Campos Gerais"
          width={160}
          height={124}
          className="h-20 w-auto self-start"
        />
        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Curadoria dos produtores dos Campos Gerais.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#c3dccc]">
            Aprove inscrições, escolha destaques e mantenha a vitrine com
            produtos de quem produz na região.
          </p>
          <ul className="mt-7 flex flex-col gap-3 text-[15px] text-[#e8f2ec]">
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-lg bg-accent-yellow/15 text-[13px] font-extrabold text-accent-yellow-soft">
                A
              </span>
              Atalhos de teclado para decidir rápido
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-lg bg-accent-yellow/15 text-[13px] font-extrabold text-accent-yellow-soft">
                ↺
              </span>
              Desfaça qualquer decisão em segundos
            </li>
          </ul>
        </div>
        <svg
          width="560"
          height="200"
          viewBox="0 0 560 200"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 bottom-16 opacity-30"
        >
          <path d="M0 150 C 100 100, 180 130, 280 110 S 460 70, 560 90" stroke="#a9c9b5" strokeWidth="1.5" />
          <path d="M0 172 C 110 132, 190 162, 290 142 S 470 105, 560 120" stroke="#a9c9b5" strokeWidth="1.5" />
          <path d="M0 196 C 120 162, 200 190, 300 175 S 480 140, 560 152" stroke="#a9c9b5" strokeWidth="1.5" />
        </svg>
        <p className="relative z-10 text-sm text-muted">
          Acesso restrito à equipe da associação.
        </p>
      </section>

      <section className="flex flex-[1_1_26rem] items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-foreground">Entrar</h2>
          <p className="mt-1.5 text-sm text-text-muted">
            Use o e-mail e a senha de administrador.
          </p>

          <LoginForm
            requireAdmin
            showRemember
            onSuccess={() => navigate('/backoffice')}
          />

          <Link
            to="/"
            className="mt-4 block py-3 text-center text-sm font-semibold text-primary-darker hover:text-primary-dark"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </section>
    </main>
  )
}
