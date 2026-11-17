import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../shared/api/client'
import { isAuthTokenValid, removeAuthToken } from '../../shared/api/auth-token'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { revealFirstInvalidField } from '../../shared/lib/form-validation'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../shared/lib/buildThumbnailUrl'
import { ImageDropzone } from '../../features/produtor/components/ImageDropzone'
import {
  IMAGE_CONTENT_TYPES,
  MAX_PRODUCER_PHOTOS,
} from '../../features/produtor/constants'
import type { Producer } from '../../features/produtor/types'
import { MyProducts } from './MyProductsPage'
import { PreRegistrationStep } from './PreRegistrationStep'

interface ProfileResponse {
  vinculado: boolean
  produtor: Producer | null
}

const inputClassName =
  'mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function MyProfilePage() {
  if (!isAuthTokenValid()) return <Navigate to="/minha-conta/login" replace />
  return <MyProfile />
}

function MyProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [error, setError] = useState('')
  const [key, setKey] = useState(0)
  const [editing, setEditing] = useState(false)
  const navigate = useNavigate()

  const reload = () => {
    setProfile(null)
    setKey((k) => k + 1)
  }

  useEffect(() => {
    let current = true
    apiRequest<ProfileResponse>('/api/minha-conta/perfil', {
      authenticated: true,
    })
      .then((data) => {
        if (current) {
          setProfile(data)
          setError('')
        }
      })
      .catch((e) => {
        if (current)
          setError(e instanceof Error ? e.message : 'Falha ao carregar perfil')
      })
    return () => {
      current = false
    }
  }, [key])

  const producer = profile?.produtor

  return (
    <main className="bg-background-secondary pb-14 pt-6 sm:pt-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Minha conta
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Meu perfil de produtor
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              removeAuthToken()
              navigate('/minha-conta/login')
            }}
          >
            Sair
          </Button>
        </header>

        {error ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger-border bg-danger-soft p-4 text-sm text-danger"
          >
            <p>{error}</p>
            <Button onClick={reload}>Tentar novamente</Button>
          </div>
        ) : !profile ? (
          <ProfileSkeleton />
        ) : !profile.vinculado ? (
          <PreRegistrationStep onLinked={reload} />
        ) : !producer ? (
          <p className="rounded-2xl bg-white p-6">
            Não foi possível encontrar o produtor vinculado. Procure a
            administração.
          </p>
        ) : (
          <>
            <ProfileHero producer={producer} onEdit={() => setEditing(true)} />
            <StatusCallout producer={producer} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
              <div className="flex min-w-0 flex-col gap-6">
                <Card title="Sobre o produtor">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {producer.historia || 'Conte a história da sua produção.'}
                  </p>
                </Card>

                <Card
                  title="Fotos do produtor"
                  action={`${producer.fotos.length}/${MAX_PRODUCER_PHOTOS}`}
                >
                  {producer.fotos.length > 0 ? (
                    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {producer.fotos.map((foto, index) => (
                        <li key={`${foto.nomeOriginal}-${index}`}>
                          <img
                            src={buildThumbnailUrl(
                              foto.url,
                              THUMBNAIL_WIDTH.avatar,
                            )}
                            alt={`Foto ${index + 1} de ${producer.nomeEmpresa}`}
                            loading="lazy"
                            className="aspect-square w-full rounded-xl object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyHint onClick={() => setEditing(true)}>
                      Adicione fotos da propriedade e da produção.
                    </EmptyHint>
                  )}
                </Card>
              </div>

              <aside className="flex min-w-0 flex-col gap-6">
                <ProfileChecklist
                  producer={producer}
                  onEdit={() => setEditing(true)}
                />

                <Card title="Contato e documento">
                  <dl className="space-y-3 text-sm">
                    <InfoRow label="WhatsApp" value={producer.contato.telefone} />
                    <InfoRow label="E-mail" value={producer.contato.email} />
                    <InfoRow
                      label={
                        producer.documento.tipo === 'CAD_PRO'
                          ? 'CAD/PRO'
                          : producer.documento.tipo
                      }
                      value={producer.documento.numero}
                    />
                    <InfoRow
                      label="Município"
                      value={producer.endereco.cidade}
                    />
                  </dl>
                </Card>
              </aside>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <MyProducts />
            </section>

            {editing && (
              <ProducerOwnerEdit
                producer={producer}
                onClose={() => setEditing(false)}
                onSaved={() => {
                  setEditing(false)
                  reload()
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}

function ProfileHero({
  producer,
  onEdit,
}: {
  producer: Producer
  onEdit: () => void
}) {
  const cover = producer.banner ?? producer.fotos[0]
  const isPublished = producer.status === 'APROVADO' && producer.ativo

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-36 bg-gradient-to-br from-primary to-primary-darker sm:h-52">
        {cover ? (
          <img
            src={buildThumbnailUrl(cover.url, THUMBNAIL_WIDTH.detail)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
        {!producer.banner ? (
          <button
            type="button"
            onClick={onEdit}
            className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-primary-darker shadow-sm transition hover:bg-white"
          >
            + Adicionar banner
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:pb-6">
        <div className="flex min-w-0 items-end gap-4">
          <div className="-mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md sm:-mt-12 sm:h-24 sm:w-24">
            {producer.logo ? (
              <img
                src={buildThumbnailUrl(producer.logo.url, THUMBNAIL_WIDTH.avatar)}
                alt={`Logo de ${producer.nomeEmpresa}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="grid h-full w-full place-items-center bg-secondary-background text-2xl font-extrabold text-primary-darker">
                {producer.nomeEmpresa.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 pt-3">
            <h2 className="truncate text-xl font-extrabold text-foreground sm:text-2xl">
              {producer.nomeEmpresa}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusChip producer={producer} />
              {producer.destaque ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                  ★ Em destaque
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {isPublished ? (
            <Link
              to={`/produtores/${producer.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-primary bg-white px-4 text-sm font-semibold text-primary-darker transition hover:bg-secondary-background"
            >
              Ver no catálogo
            </Link>
          ) : null}
          <Button onClick={onEdit}>Editar perfil</Button>
        </div>
      </div>
    </section>
  )
}

function StatusChip({ producer }: { producer: Producer }) {
  const { label, className } =
    producer.status === 'ALTERADO'
      ? { label: 'Alteração em revisão', className: 'bg-amber-100 text-amber-900' }
      : producer.status === 'PENDENTE'
        ? { label: 'Aguardando validação', className: 'bg-amber-100 text-amber-900' }
        : producer.status === 'REJEITADO'
          ? { label: 'Rejeitado', className: 'bg-red-100 text-red-900' }
          : producer.ativo
            ? { label: 'Publicado no catálogo', className: 'bg-green-100 text-green-900' }
            : { label: 'Inativo no catálogo', className: 'bg-slate-100 text-slate-700' }

  return (
    <span
      role="status"
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  )
}

/** Explica o estado atual e o que o produtor pode fazer a seguir. */
function StatusCallout({ producer }: { producer: Producer }) {
  if (producer.status === 'APROVADO' && producer.ativo) {
    return null
  }

  const content =
    producer.status === 'REJEITADO'
      ? {
          tone: 'border-danger-border bg-danger-soft text-danger',
          title: 'Seu cadastro precisa de ajustes',
          text: producer.motivoRejeicao
            ? `Motivo: ${producer.motivoRejeicao}. Corrija os dados em "Editar perfil" para enviar de novo.`
            : 'Corrija os dados em "Editar perfil" para enviar de novo.',
        }
      : producer.status === 'APROVADO'
        ? {
            tone: 'border-slate-200 bg-white text-slate-700',
            title: 'Perfil aprovado, mas oculto do catálogo',
            text: 'A administração desativou a exibição do seu perfil. Procure a AMCG para mais informações.',
          }
        : {
            tone: 'border-amber-200 bg-amber-50 text-amber-900',
            title:
              producer.status === 'ALTERADO'
                ? 'Suas alterações estão em revisão'
                : 'Seu cadastro está em validação',
            text: 'Enquanto a administração analisa, o perfil e os produtos ficam fora do catálogo.',
          }

  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${content.tone}`}>
      <p className="font-bold">{content.title}</p>
      <p className="mt-1 leading-6">{content.text}</p>
    </div>
  )
}

function ProfileChecklist({
  producer,
  onEdit,
}: {
  producer: Producer
  onEdit: () => void
}) {
  const items = [
    { label: 'Logo', done: Boolean(producer.logo) },
    { label: 'Banner para destaque', done: Boolean(producer.banner) },
    { label: 'Ao menos 3 fotos', done: producer.fotos.length >= 3 },
    { label: 'História do produtor', done: producer.historia.trim().length >= 80 },
    {
      label: 'Rede social ou site',
      done: producer.redesSociais.length > 0 || Boolean(producer.site),
    },
  ]
  const doneCount = items.filter((item) => item.done).length
  const percent = Math.round((doneCount / items.length) * 100)

  return (
    <Card title="Perfil completo" action={`${percent}%`}>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Perfil completo"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                item.done
                  ? 'bg-primary text-white'
                  : 'border-2 border-slate-300 text-transparent'
              }`}
            >
              ✓
            </span>
            <span className={item.done ? 'text-slate-500' : 'font-semibold text-foreground'}>
              {item.label}
              <span className="sr-only">{item.done ? ' (feito)' : ' (pendente)'}</span>
            </span>
          </li>
        ))}
      </ul>
      {doneCount < items.length ? (
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 text-sm font-bold text-primary-darker hover:underline"
        >
          Completar perfil →
        </button>
      ) : null}
    </Card>
  )
}

function Card({
  title,
  action,
  children,
}: {
  title: string
  action?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-extrabold text-foreground">{title}</h3>
        {action ? (
          <span className="text-xs font-bold text-text-muted">{action}</span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  )
}

function EmptyHint({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border-2 border-dashed border-slate-300 px-4 py-8 text-sm font-semibold text-text-muted transition hover:border-primary hover:text-primary-darker"
    >
      {children}
    </button>
  )
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Carregando perfil" className="flex flex-col gap-6">
      <div className="h-64 animate-pulse rounded-3xl bg-white" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-48 animate-pulse rounded-3xl bg-white" />
        <div className="h-48 animate-pulse rounded-3xl bg-white" />
      </div>
    </div>
  )
}

function ProducerOwnerEdit({
  producer,
  onClose,
  onSaved,
}: {
  producer: Producer
  onClose: () => void
  onSaved: () => void
}) {
  const [nomeEmpresa, setNome] = useState(producer.nomeEmpresa)
  const [historia, setHistoria] = useState(producer.historia)
  const [logo, setLogo] = useState(producer.logo ? [producer.logo] : [])
  const [banner, setBanner] = useState(producer.banner ? [producer.banner] : [])
  const [fotos, setFotos] = useState(producer.fotos)
  const [telefone, setTelefone] = useState(producer.contato.telefone)
  const [email, setEmail] = useState(producer.contato.email)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const invalid = revealFirstInvalidField(e.currentTarget)
    if (invalid) {
      setError(invalid)
      return
    }
    setError('')
    setBusy(true)
    try {
      await apiRequest('/api/minha-conta/perfil', {
        method: 'PATCH',
        authenticated: true,
        body: {
          nomeEmpresa,
          historia,
          logo: logo[0] ?? null,
          banner: banner[0] ?? null,
          fotos,
          contato: { telefone, email },
          revisao: producer.revisao ?? 0,
        },
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar perfil')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Editar perfil do produtor"
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form noValidate onSubmit={save}>
        <fieldset disabled={busy} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-text-muted">
              Dados principais
            </h3>
            <label className="block text-sm font-semibold text-foreground">
              Nome do produtor / empresa
              <input
                required
                className={inputClassName}
                value={nomeEmpresa}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Descrição / história
              <textarea
                required
                rows={6}
                maxLength={2000}
                className={inputClassName}
                value={historia}
                onChange={(e) => setHistoria(e.target.value)}
              />
              <span className="mt-1 block text-right text-xs font-normal text-text-muted">
                {historia.length}/2000 caracteres
              </span>
            </label>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-text-muted">
              Imagens
            </h3>
            <ImageDropzone
              label="Logo (opcional)"
              files={logo}
              max={1}
              allowedTypes={IMAGE_CONTENT_TYPES}
              onChange={setLogo}
            />
            <ImageDropzone
              label="Banner para destaque (opcional)"
              description="Imagem horizontal, de preferência 1200 × 400 px. Aparece como capa do seu perfil quando ele estiver em destaque no catálogo."
              files={banner}
              max={1}
              allowedTypes={IMAGE_CONTENT_TYPES}
              onChange={setBanner}
              previewAspect="wide"
            />
            <ImageDropzone
              label="Fotos do produtor (opcionais)"
              files={fotos}
              max={MAX_PRODUCER_PHOTOS}
              allowedTypes={IMAGE_CONTENT_TYPES}
              onChange={setFotos}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-text-muted">
              Contato
            </h3>
            <label className="block text-sm font-semibold text-foreground">
              WhatsApp
              <input
                required
                type="tel"
                className={inputClassName}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-text-muted">
                Com código do país, ex.: +5542999999999
              </span>
            </label>
            <label className="block text-sm font-semibold text-foreground">
              E-mail
              <input
                required
                type="email"
                className={inputClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>

          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Ao salvar, o perfil fica aguardando aprovação da administração.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {busy ? 'Salvando...' : 'Salvar para aprovação'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
