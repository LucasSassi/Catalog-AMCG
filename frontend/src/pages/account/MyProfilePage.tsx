import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../shared/api/client'
import { isAuthTokenValid, removeAuthToken } from '../../shared/api/auth-token'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { ImageDropzone } from '../../features/produtor/components/ImageDropzone'
import type { Producer } from '../../features/produtor/types'
import { MyProducts } from './MyProductsPage'
import { PreRegistrationStep } from './PreRegistrationStep'
interface ProfileResponse {
  vinculado: boolean
  produtor: Producer | null
}
export function MyProfilePage() {
  if (!isAuthTokenValid()) return <Navigate to="/minha-conta/login" replace />
  return <MyProfile />
}
function MyProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [error, setError] = useState(''),
    [key, setKey] = useState(0),
    [editing, setEditing] = useState(false)
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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu perfil</h1>
        <button
          onClick={() => {
            removeAuthToken()
            navigate('/minha-conta/login')
          }}
        >
          Sair
        </button>
      </header>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <Button onClick={reload}>Tentar novamente</Button>
        </div>
      ) : !profile ? (
        <p role="status">Carregando perfil...</p>
      ) : !profile.vinculado ? (
        <PreRegistrationStep onLinked={reload} />
      ) : !producer ? (
        <p>
          Não foi possível encontrar o produtor vinculado. Procure a
          administração.
        </p>
      ) : (
        <>
          <section className="space-y-4 rounded-xl border bg-white p-6">
            <div className="flex flex-wrap items-center gap-5">
              {producer.logo && (
                <img
                  className="h-24 w-24 object-contain"
                  src={producer.logo.url}
                  alt={producer.nomeEmpresa}
                />
              )}
              <div>
                <h2 className="text-xl font-bold">{producer.nomeEmpresa}</h2>
                <p
                  role="status"
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    producer.status === 'PENDENTE'
                      ? 'bg-amber-100 text-amber-900'
                      : producer.status === 'REJEITADO'
                        ? 'bg-red-100 text-red-900'
                        : producer.ativo
                          ? 'bg-green-100 text-green-900'
                          : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {producer.status === 'PENDENTE'
                    ? 'Aguardando validação · fora do catálogo'
                    : producer.status === 'REJEITADO'
                      ? 'Rejeitado · fora do catálogo'
                      : producer.ativo
                        ? 'Aprovado · publicado no catálogo'
                        : 'Aprovado · inativo no catálogo'}
                </p>
              </div>
            </div>
            {producer.motivoRejeicao && (
              <p>Motivo da rejeição: {producer.motivoRejeicao}</p>
            )}
            <p className="whitespace-pre-wrap">{producer.historia}</p>
            <p>WhatsApp: {producer.contato.telefone}</p>
            <p>E-mail: {producer.contato.email}</p>
            <p>
              {producer.documento.tipo}: {producer.documento.numero}
            </p>
            <Button onClick={() => setEditing(true)}>
              Editar perfil do produtor
            </Button>
            <p className="text-sm text-text-muted">
              As alterações do perfil precisam de aprovação. Enquanto estiver
              pendente, o perfil e seus produtos ficam fora do catálogo.
            </p>
          </section>
          <MyProducts />
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
    </main>
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
  const [nomeEmpresa, setNome] = useState(producer.nomeEmpresa),
    [historia, setHistoria] = useState(producer.historia)
  const [logo, setLogo] = useState(producer.logo ? [producer.logo] : []),
    [fotos, setFotos] = useState(producer.fotos)
  const [telefone, setTelefone] = useState(producer.contato.telefone),
    [email, setEmail] = useState(producer.contato.email)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function save(e: FormEvent) {
    e.preventDefault()
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
      <form onSubmit={save}>
        <fieldset disabled={busy} className="space-y-4">
          <label className="block">
            Nome do produtor / empresa
            <input
              required
              className="block w-full rounded border p-3"
              value={nomeEmpresa}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
          <label className="block">
            Descrição / história
            <textarea
              required
              rows={6}
              maxLength={2000}
              className="block w-full rounded border p-3"
              value={historia}
              onChange={(e) => setHistoria(e.target.value)}
            />
            <span className="text-sm">{historia.length}/2000 caracteres</span>
          </label>
          <ImageDropzone
            label="Logo (opcional)"
            files={logo}
            max={1}
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            onChange={setLogo}
          />
          <ImageDropzone
            label="Fotos do produtor (opcionais)"
            files={fotos}
            max={8}
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            onChange={setFotos}
          />
          <label className="block">
            WhatsApp (com código do país, ex.: +5542999999999)
            <input
              required
              type="tel"
              className="block w-full rounded border p-3"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </label>
          <label className="block">
            E-mail
            <input
              required
              type="email"
              className="block w-full rounded border p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <p>
            Ao alterar seus dados, o perfil ficará aguardando aprovação da
            administração.
          </p>
          {error && <p role="alert">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit">
              {busy ? 'Salvando...' : 'Salvar para aprovação'}
            </Button>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
