import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '../../features/auth/components/LoginForm'
import { RegisterForm } from '../../features/auth/components/RegisterForm'
import { ImageDropzone } from '../../features/produtor/components/ImageDropzone'
import { CatalogPagination } from '../../features/produto/components/CatalogPagination'
import type { Product } from '../../features/produto/types'
import { MAX_DESCRICAO_BREVE_LENGTH } from '../../features/produto/constants'
import { apiRequest } from '../../shared/api/client'
import { isAuthTokenValid } from '../../shared/api/auth-token'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
import { useManagementPage } from '../../shared/lib/useManagementPage'
import { formatCurrency } from '../../shared/lib/formatCurrency'

export function AccountLoginPage() {
  const [register, setRegister] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const loginNotice = (location.state as { loginNotice?: string } | null)?.loginNotice
  if (isAuthTokenValid()) return <Navigate to="/minha-conta/perfil" replace />
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">
        {register ? 'Criar conta' : 'Acessar meu perfil'}
      </h1>
      {loginNotice && !register && (
        <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-900">
          {loginNotice}
        </p>
      )}
      {register ? (
        <RegisterForm onSuccess={() => navigate('/minha-conta/perfil')} />
      ) : (
        <LoginForm
          showRemember
          onSuccess={() => navigate('/minha-conta/perfil')}
        />
      )}
      <button className="mt-6 underline" onClick={() => setRegister(!register)}>
        {register ? 'Já tenho uma conta' : 'Criar uma conta'}
      </button>
    </main>
  )
}
export function MyProducts() {
  const page = useManagementPage<Product>('/api/minha-conta/produtos')
  const [editing, setEditing] = useState<Product | null>(null)
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">Produtos</h2>
      <p>
        Alterações de nome, descrições, preço ou fotos retiram o produto do
        catálogo até a aprovação.
      </p>
      <input
        aria-label="Buscar produtos"
        placeholder="Buscar produtos"
        className="w-full rounded-lg border p-3"
        value={page.search}
        onChange={(e) => page.setSearch(e.target.value)}
      />
      {page.error && <p role="alert">{page.error}</p>}
      {page.loading ? (
        <p role="status">Carregando...</p>
      ) : page.data.vinculado === false ? (
        <p>
          Sua conta ainda não está vinculada a um produtor. Procure a
          administração.
        </p>
      ) : !page.data.items.length ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {page.data.items.map((product) => (
            <article
              key={product.id}
              className="space-y-3 rounded-xl border bg-white p-5"
            >
              {product.fotosDivulgacao[0] && (
                <img
                  src={product.fotosDivulgacao[0].url}
                  alt={product.nome}
                  className="h-40 w-full rounded-lg object-cover"
                />
              )}
              <h2 className="text-xl font-bold">{product.nome}</h2>
              <p>{formatCurrency(product.valorCentavos)}</p>
              <p>
                {product.status === 'PENDENTE'
                  ? 'Aguardando aprovação'
                  : product.status === 'REJEITADO'
                    ? 'Rejeitado'
                    : product.ativo
                      ? 'Publicado'
                      : 'Inativo'}
              </p>
              {product.motivoRejeicao && (
                <p>Motivo: {product.motivoRejeicao}</p>
              )}
              <Button onClick={() => setEditing(product)}>Editar</Button>
            </article>
          ))}
        </div>
      )}
      <CatalogPagination {...page.pagination} />
      {editing && (
        <ProductOwnerEdit
          key={editing.id}
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            page.reload()
          }}
        />
      )}
    </section>
  )
}
function ProductOwnerEdit({
  product,
  onClose,
  onSaved,
}: {
  product: Product
  onClose: () => void
  onSaved: () => void
}) {
  const [nome, setNome] = useState(product.nome),
    [price, setPrice] = useState((product.valorCentavos / 100).toFixed(2))
  const [descricaoBreve, setDescricaoBreve] = useState(product.descricaoBreve)
  const [descricao, setDescricao] = useState(product.descricao)
  const [avaliacao, setAvaliacao] = useState(product.fotosAvaliacao),
    [divulgacao, setDivulgacao] = useState(product.fotosDivulgacao)
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiRequest(`/api/minha-conta/produtos/${product.id}`, {
        method: 'PATCH',
        authenticated: true,
        body: {
          nome,
          descricaoBreve,
          descricao,
          valorCentavos: Math.round(Number(price.replace(',', '.')) * 100),
          fotosAvaliacao: avaliacao,
          fotosDivulgacao: divulgacao,
          revisao: product.revisao ?? 0,
        },
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      title={`Editar ${product.nome}`}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form onSubmit={save} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <label className="block">
            Nome
            <input
              className="block w-full rounded border p-3"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
          <label className="block">
            Descrição breve
            <textarea
              className="block w-full rounded border p-3"
              required
              rows={3}
              maxLength={MAX_DESCRICAO_BREVE_LENGTH}
              value={descricaoBreve}
              onChange={(e) => setDescricaoBreve(e.target.value)}
            />
            <span className="text-sm text-text-muted">
              {descricaoBreve.length}/{MAX_DESCRICAO_BREVE_LENGTH} caracteres
            </span>
          </label>
          <label className="block">
            Descrição completa
            <textarea
              className="block w-full rounded border p-3"
              required
              rows={6}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </label>
          <label className="block">
            Preço (R$)
            <input
              className="block w-full rounded border p-3"
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <ImageDropzone
            label="Fotos de avaliação"
            files={avaliacao}
            max={5}
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            onChange={setAvaliacao}
          />
          <ImageDropzone
            label="Fotos de divulgação"
            files={divulgacao}
            max={5}
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            onChange={setDivulgacao}
          />
          <p>O produto ficará inativo até a aprovação das alterações.</p>
          {error && <p role="alert">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit">{busy ? 'Salvando...' : 'Salvar'}</Button>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
