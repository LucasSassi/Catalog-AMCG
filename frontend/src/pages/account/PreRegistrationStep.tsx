import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../shared/api/client'
import { removeAuthToken, setAuthToken } from '../../shared/api/auth-token'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { InscriptionForm } from '../../features/produtor/components/InscriptionForm'
import { login } from '../../features/auth/api/login'
import { register } from '../../features/auth/api/register'
import { ImageDropzone } from '../../features/produtor/components/ImageDropzone'
import { revealFirstInvalidField } from '../../shared/lib/form-validation'
import type {
  ProducerDocument,
  ProducerFile,
} from '../../features/produtor/types'
/** Resposta de /consultar: se achou, um código foi enviado ao e-mail do pré-cadastro. */
interface LookupResponse {
  encontrado: boolean
  verificacaoId?: string
  emailMascarado?: string
  reenvioEmSegundos?: number
}
interface PendingVerification {
  verificacaoId: string
  emailMascarado: string
  /** Momento (ms) a partir do qual dá para pedir outro código. */
  reenvioLiberadoEm: number
}
/** Dados liberados por /verificar depois do código correto. */
interface Match {
  encontrado: boolean
  confirmacaoToken?: string
  produtor?: {
    nomeEmpresa: string
    historia: string
    municipio: string
    contato?: { telefone: string; email: string }
    revisao?: number
    logo?: ProducerFile
    fotos?: ProducerFile[]
    documento: ProducerDocument
  }
}
export function PreRegistrationStep({
  onLinked,
  createAccountMode = false,
  onNeedAuth,
}: {
  onLinked: () => void
  createAccountMode?: boolean
  onNeedAuth?: () => void
}) {
  const [documento, setDocumento] = useState<ProducerDocument>({
    tipo: 'CPF',
    numero: '',
  })
  const [result, setResult] = useState<Match | null>(null)
  const [verification, setVerification] =
    useState<PendingVerification | null>(null)
  const [code, setCode] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [newRegistration, setNewRegistration] = useState(false),
    [notice, setNotice] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [accountEmail, setAccountEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [profileSaveWarning, setProfileSaveWarning] = useState('')
  const [accountReady, setAccountReady] = useState(false)
  const [accountLoading, setAccountLoading] = useState(false)
  const [producerName, setProducerName] = useState('')
  const [history, setHistory] = useState('')
  const [producerEmail, setProducerEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState<ProducerFile[]>([])
  const [photos, setPhotos] = useState<ProducerFile[]>([])
  const submissionLock = useRef(false)
  const navigate = useNavigate()

  // Contagem regressiva do botão "Reenviar código".
  useEffect(() => {
    if (!verification) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [verification])

  const resendInSeconds = verification
    ? Math.max(0, Math.ceil((verification.reenvioLiberadoEm - now) / 1000))
    : 0

  function resetLookup() {
    setResult(null)
    setVerification(null)
    setCode('')
  }

  async function requestCode() {
    setBusy(true)
    setError('')
    try {
      const response = await apiRequest<LookupResponse>(
        '/api/minha-conta/pre-cadastro/consultar',
        { method: 'POST', body: documento },
      )
      if (response.encontrado && response.verificacaoId) {
        setResult(null)
        setVerification({
          verificacaoId: response.verificacaoId,
          emailMascarado: response.emailMascarado ?? 'seu e-mail',
          reenvioLiberadoEm:
            Date.now() + (response.reenvioEmSegundos ?? 60) * 1000,
        })
        setNow(Date.now())
        setCode('')
      } else {
        setVerification(null)
        setResult({ encontrado: false })
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível consultar o pré-cadastro',
      )
    } finally {
      setBusy(false)
    }
  }

  async function lookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const invalid = revealFirstInvalidField(e.currentTarget)
    if (invalid) {
      setError(invalid)
      return
    }
    resetLookup()
    await requestCode()
  }

  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!verification) return
    const invalid = revealFirstInvalidField(e.currentTarget)
    if (invalid) {
      setError(invalid)
      return
    }
    setBusy(true)
    setError('')
    try {
      const liberado = await apiRequest<Match>(
        '/api/minha-conta/pre-cadastro/verificar',
        {
          method: 'POST',
          body: { verificacaoId: verification.verificacaoId, codigo: code },
        },
      )
      setVerification(null)
      setCode('')
      setResult(liberado)
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Não foi possível verificar o código'
      setError(message)
      // Código expirado ou bloqueado: libera pedir outro na hora.
      if (/novo código/i.test(message)) {
        setVerification((current) =>
          current ? { ...current, reenvioLiberadoEm: 0 } : current,
        )
      }
    } finally {
      setBusy(false)
    }
  }
  async function confirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const invalid = revealFirstInvalidField(e.currentTarget)
    if (invalid) {
      setError(invalid)
      return
    }
    if (submissionLock.current) return
    if (!result?.produtor || !result.confirmacaoToken) return
    if (createAccountMode && password !== passwordConfirmation) {
      setError('As senhas não coincidem.')
      return
    }
    submissionLock.current = true
    setBusy(true)
    setError('')
    let saveWarning = ''
    try {
      if (createAccountMode) {
        setAccountLoading(true)
        if (!accountReady) {
          await register({
            nome: producerName.trim() || result.produtor.nomeEmpresa,
            email: accountEmail,
            senha: password,
          })
          setAccountReady(true)
        }
        const loginResponse = await login({ email: accountEmail, senha: password })
        setAuthToken(loginResponse.token)
      }
      await apiRequest('/api/minha-conta/pre-cadastro/confirmar', {
        method: 'POST',
        authenticated: true,
        body: { confirmacaoToken: result?.confirmacaoToken },
      })
      const changed =
        producerName !== result.produtor.nomeEmpresa ||
        history !== result.produtor.historia ||
        producerEmail !== (result.produtor.contato?.email ?? '') ||
        phone !== (result.produtor.contato?.telefone ?? '') ||
        JSON.stringify(logo[0] ?? null) !== JSON.stringify(result.produtor.logo ?? null) ||
        JSON.stringify(photos) !== JSON.stringify(result.produtor.fotos ?? [])
      if (changed) {
        try {
          await apiRequest('/api/minha-conta/perfil', {
            method: 'PATCH',
            authenticated: true,
            body: {
              nomeEmpresa: producerName.trim(),
              historia: history.trim(),
              contato: { telefone: phone.trim(), email: producerEmail.trim() },
              ...(JSON.stringify(logo[0] ?? null) !== JSON.stringify(result.produtor.logo ?? null) ? { logo: logo[0] ?? null } : {}),
              ...(JSON.stringify(photos) !== JSON.stringify(result.produtor.fotos ?? []) ? { fotos: photos } : {}),
              revisao: result.produtor.revisao ?? 0,
            },
          })
        } catch {
          saveWarning = 'A conta foi criada e vinculada, mas não foi possível salvar as correções agora. Você poderá editá-las em Meu Perfil.'
          setProfileSaveWarning(saveWarning)
        }
      }
      if (createAccountMode) {
        removeAuthToken()
        navigate('/minha-conta/login', {
          replace: true,
          state: {
            loginNotice: saveWarning
              ? `Sua conta foi criada e o perfil vinculado. ${saveWarning}`
              : 'Conta criada e perfil vinculado. Entre com o e-mail e a senha que você cadastrou.',
          },
        })
      } else {
        setNotice(true)
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Não foi possível confirmar o vínculo'
      if (message.includes('pré-cadastro foi atualizado')) {
        setResult(null)
        setReviewing(false)
        setError(
          'Os dados mudaram desde a consulta. Consulte o mesmo documento novamente para revisar os dados atualizados. Sua conta já foi criada e não será cadastrada outra vez.',
        )
      } else {
        setError(message)
      }
    } finally {
      setAccountLoading(false)
      setBusy(false)
      submissionLock.current = false
    }
  }
  if (newRegistration)
    return (
      <section className="space-y-5">
        <h2 className="text-xl font-bold">Nova inscrição</h2>
        <Button
          onClick={() => {
            setNewRegistration(false)
            setResult(null)
          }}
        >
          Consultar outro documento
        </Button>
        <InscriptionForm initialDocument={documento} onSuccess={onLinked} />
      </section>
    )
  return (
    <section className="mx-auto max-w-2xl space-y-5 rounded-xl border bg-white p-6">
      <h2 className="text-xl font-bold">Encontre seu pré-cadastro</h2>
      <p>
        Já participou de uma edição anterior do catálogo? Informe exatamente o
        mesmo tipo e número de documento utilizado naquela edição.
      </p>
      <form noValidate onSubmit={lookup} className="space-y-4">
        <fieldset
          disabled={busy || notice || Boolean(verification)}
          className="space-y-4"
        >
          <label className="block">
            Tipo de documento
            <select
              className="block w-full rounded border p-3"
              value={documento.tipo}
              onChange={(e) => {
                setDocumento({
                  tipo: e.target.value as ProducerDocument['tipo'],
                  numero: '',
                })
                resetLookup()
              }}
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="CAD_PRO">CAD/PRO</option>
            </select>
          </label>
          <label className="block">
            Número do documento
            <div className="flex">
              {documento.tipo === 'CAD_PRO' && (
                <span
                  aria-hidden="true"
                  className="inline-flex items-center rounded-l border border-r-0 bg-slate-100 px-3 font-semibold text-slate-700"
                >
                  CAD-
                </span>
              )}
              <input
                required
                maxLength={100}
                className={`block min-w-0 flex-1 rounded border p-3 ${documento.tipo === 'CAD_PRO' ? 'rounded-l-none' : ''}`}
                value={documento.numero}
                onChange={(e) => {
                  setDocumento((d) => ({ ...d, numero: e.target.value }))
                  resetLookup()
                }}
              />
            </div>
          </label>
          <Button type="submit">
            {busy ? 'Consultando...' : 'Consultar pré-cadastro'}
          </Button>
        </fieldset>
      </form>
      {verification && (
        <form
          noValidate
          onSubmit={(e) => void verifyCode(e)}
          className="space-y-4 rounded-xl border border-primary/30 bg-secondary-background p-5"
        >
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Confirme que o cadastro é seu
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Encontramos um pré-cadastro com esse documento. Para proteger os
              dados, enviamos um código de 6 dígitos para o e-mail cadastrado:{' '}
              <strong>{verification.emailMascarado}</strong>. O código vale por
              10 minutos.
            </p>
          </div>
          <label className="block text-sm font-semibold text-foreground">
            Código de verificação
            <input
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              title="Digite os 6 números enviados por e-mail"
              placeholder="000000"
              className="mt-1.5 block w-full max-w-[12rem] rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] focus:border-primary focus:outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? 'Verificando...' : 'Confirmar código'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy || resendInSeconds > 0}
              onClick={() => void requestCode()}
            >
              {resendInSeconds > 0
                ? `Reenviar código (${resendInSeconds}s)`
                : 'Reenviar código'}
            </Button>
            <button
              type="button"
              disabled={busy}
              className="text-sm font-semibold text-primary-darker underline"
              onClick={() => {
                resetLookup()
                setError('')
              }}
            >
              Usar outro documento
            </button>
          </div>
          <p className="text-xs leading-5 text-text-muted">
            Não recebeu? Confira a caixa de spam. Se você não tem mais acesso a
            esse e-mail, procure a administração da AMCG para atualizar seu
            cadastro.
          </p>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
      {result?.encontrado && result.produtor && !reviewing && (
        <div className="space-y-4 rounded-lg bg-background p-4">
          <p>
            Como você já participou de versões anteriores do catálogo, temos um
            pré-cadastro seu. Confira as informações abaixo e confirme se elas
            pertencem a você.
          </p>
          {result.produtor.logo && (
            <img
              src={result.produtor.logo.url}
              alt="Logo do pré-cadastro"
              className="h-24 w-24 object-contain"
            />
          )}
          <h3 className="font-bold">{result.produtor.nomeEmpresa}</h3>
          <p>{result.produtor.municipio}</p>
          <p>
            {result.produtor.documento.tipo}:{' '}
            {result.produtor.documento.tipo === 'CAD_PRO' &&
            !/^CAD-/i.test(result.produtor.documento.numero)
              ? 'CAD-'
              : ''}
            {result.produtor.documento.numero}
          </p>
          <p className="whitespace-pre-wrap">{result.produtor.historia}</p>
          <Button
            disabled={busy || notice}
            onClick={() => {
              setProducerName(result.produtor!.nomeEmpresa)
              setHistory(result.produtor!.historia)
              setProducerEmail(result.produtor!.contato?.email ?? '')
              setPhone(result.produtor!.contato?.telefone ?? '')
              setLogo(result.produtor!.logo ? [result.produtor!.logo] : [])
              setPhotos(result.produtor!.fotos ?? [])
              setReviewing(true)
            }}
          >
            {createAccountMode ? 'Confirmar minhas informações e continuar' : 'Confirmar minhas informações e vincular'}
          </Button>
          <button
            disabled={busy}
            type="button"
            className="block underline"
            onClick={() => {
              resetLookup()
              setError(
                'Confira o documento informado. Se os dados continuarem incorretos, procure a administração para ajustar seu vínculo.',
              )
            }}
          >
            Essas informações não são minhas
          </button>
        </div>
      )}
      {reviewing && result?.produtor && (
        <form noValidate onSubmit={(e) => void confirm(e)} className="space-y-4 rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Revise seu cadastro e crie sua conta</h3>
          <p>Corrija os dados do pré-cadastro e informe um e-mail e uma senha para acessar seu perfil posteriormente. Alterações no perfil passam pela aprovação da administração.</p>
          <label className="block">Nome do produtor<input required className="mt-1 block w-full rounded border p-3" value={producerName} onChange={(e) => setProducerName(e.target.value)} /></label>
          <label className="block">Descrição / história<textarea required rows={5} maxLength={2000} className="mt-1 block w-full rounded border p-3" value={history} onChange={(e) => setHistory(e.target.value)} /></label>
          <label className="block">
            WhatsApp
            <input
              required
              type="tel"
              inputMode="tel"
              pattern="\+[1-9][0-9]{7,14}"
              title="Use o código do país e somente números após o sinal +. Exemplo: +5542999999999"
              placeholder="+5542999999999"
              className="mt-1 block w-full rounded border p-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span className="mt-1 block text-sm text-text-muted">
              Formato internacional: sinal +, código do país e número, sem espaços, parênteses ou traços. Exemplo: +5542999999999.
            </span>
          </label>
          <label className="block">
            E-mail de contato do produtor
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="nome@exemplo.com"
              className="mt-1 block w-full rounded border p-3"
              value={producerEmail}
              onChange={(e) => setProducerEmail(e.target.value)}
            />
            <span className="mt-1 block text-sm text-text-muted">
              Informe um endereço válido, como nome@exemplo.com.
            </span>
          </label>
          <ImageDropzone label="Logo (opcional)" files={logo} max={1} allowedTypes={['image/jpeg', 'image/png', 'image/webp']} onChange={setLogo} />
          <ImageDropzone label="Fotos do produtor (opcionais)" description="Você pode adicionar fotos ou deixar para depois." files={photos} max={8} allowedTypes={['image/jpeg', 'image/png', 'image/webp']} onChange={setPhotos} />
          {createAccountMode && <>
            <label className="block">E-mail para entrar na conta<input required type="email" autoComplete="email" placeholder="nome@exemplo.com" className="mt-1 block w-full rounded border p-3" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} /><span className="mt-1 block text-sm text-text-muted">Use um e-mail válido, como nome@exemplo.com.</span></label>
            <label className="block">Senha<input required type="password" minLength={6} autoComplete="new-password" className="mt-1 block w-full rounded border p-3" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            <label className="block">Confirme a senha<input required type="password" minLength={6} autoComplete="new-password" className="mt-1 block w-full rounded border p-3" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} /></label>
          </>}
          {error && <p role="alert">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={busy || accountLoading}>{busy || accountLoading ? 'Salvando e vinculando...' : createAccountMode ? 'Criar conta e confirmar vínculo' : 'Salvar correções e vincular'}</Button>
            <Button type="button" disabled={busy || accountLoading} onClick={() => setReviewing(false)}>Voltar</Button>
          </div>
          {onNeedAuth && <button type="button" className="text-sm underline" onClick={onNeedAuth}>Já tenho uma conta; entrar</button>}
        </form>
      )}
      {result && !result.encontrado && (
        <div className="space-y-3">
          <p>
            Não encontramos um pré-cadastro com esse tipo e número de documento.
            Confira os dados ou preencha uma nova inscrição.
          </p>
          <Button onClick={() => onNeedAuth ? onNeedAuth() : setNewRegistration(true)}>
            Preencher nova inscrição
          </Button>
        </div>
      )}
      {notice && (
        <Modal title="Seu perfil foi vinculado" size="small" onClose={onLinked}>
          <p>
            Encontramos seu cadastro anterior, criamos sua conta e vinculamos o
            perfil. {profileSaveWarning || 'As alterações informadas serão analisadas pela administração.'}
          </p>
          <div className="mt-5">
            <Button onClick={onLinked}>Revisar meu perfil</Button>
          </div>
        </Modal>
      )}
    </section>
  )
}
