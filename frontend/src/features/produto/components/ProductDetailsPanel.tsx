import { useState } from 'react'
import { Kbd } from '../../../shared/components/Kbd'
import { ReviewChecklist } from '../../../shared/components/ReviewChecklist'
import { PanelPager, SidePanel } from '../../../shared/components/SidePanel'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { formatDate } from '../../../shared/lib/formatDate'
import {
  formatWaitingDays,
  getWaitingDays,
} from '../../../shared/lib/review-status'
import type { Producer } from '../../produtor/types'
import { MAX_PRODUCT_DESTAQUES, PRODUCT_CATEGORY_LABELS } from '../constants'
import { getProductChecklist } from '../lib/product-review'
import type { Product, ProductFile } from '../types'

interface ProductDetailsPanelProps {
  product: Product
  producer?: Producer
  disabled: boolean
  destaqueCount: number
  position?: number
  total?: number
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
  readOnlyEdit?: boolean
  onEdit: () => void
  onOpenProducer?: () => void
  onApprove: () => void
  onReject: () => void
  onToggleAtivo: () => void
  onToggleDestaque: () => void
}

type GalleryKind = 'divulgacao' | 'avaliacao'

export function ProductDetailsPanel({
  product,
  producer,
  disabled,
  destaqueCount,
  position = 1,
  total = 1,
  onPrevious,
  onNext,
  onClose,
  onEdit,
  readOnlyEdit = false,
  onOpenProducer,
  onApprove,
  onReject,
  onToggleAtivo,
  onToggleDestaque,
}: ProductDetailsPanelProps) {
  const isPending = (product.status === 'PENDENTE' || product.status === 'ALTERADO')
  const isApproved = product.status === 'APROVADO'
  const isHidden = isApproved && !product.ativo
  const destaqueLimitReached =
    !product.destaque && destaqueCount >= MAX_PRODUCT_DESTAQUES
  const categoria =
    PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria

  return (
    <SidePanel
      width="wide"
      label={`Detalhes de ${product.nome}`}
      onClose={onClose}
      toolbar={
        <>
          <nav aria-label="Caminho" className="flex min-w-0 items-center gap-1.5 text-sm">
            {producer && onOpenProducer ? (
              <button
                type="button"
                onClick={onOpenProducer}
                className="truncate font-semibold text-primary-darker hover:underline"
              >
                {producer.nomeEmpresa}
              </button>
            ) : (
              <span className="truncate font-semibold text-text-muted">
                {producer?.nomeEmpresa ?? 'Produtos'}
              </span>
            )}
            <span aria-hidden="true" className="text-text-muted">
              ›
            </span>
            <span className="truncate font-semibold text-foreground">
              {product.nome}
            </span>
          </nav>
          <span className="flex-1" />
          <PanelPager
            position={position}
            total={total}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </>
      }
      header={
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} hidden={isHidden} />
            {product.destaque ? (
              <span className="rounded-full bg-pending-soft px-2.5 py-1 text-xs font-bold text-pending">
                ★ Destaque
              </span>
            ) : null}
            <span className="text-xs font-semibold text-text-muted">
              {isPending
                ? `na fila ${formatWaitingDays(getWaitingDays(product.createdAt))}`
                : `inscrito em ${formatDate(product.createdAt)}`}
            </span>
          </div>
          {(product.status === 'PENDENTE' || product.status === 'ALTERADO') && <p className="text-sm font-bold">Aguardando aprovação · {product.origemPendencia === 'ALTERACAO' ? 'Alteração' : 'Cadastro'}</p>}
          {product.camposAlterados?.length ? <p className="text-sm">Campos alterados: {product.camposAlterados.join(', ')}</p> : null}
          <h2 className="mt-1.5 text-2xl font-extrabold leading-tight text-foreground">
            {product.nome}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            {categoria} · {formatCurrency(product.valorCentavos)} /{' '}
            {product.unidadeMedida}
          </p>
        </div>
      }
      footer={
        <>
          {!readOnlyEdit && <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="inline-flex min-h-11 items-center rounded-[10px] border border-slate-300 bg-white px-4 text-sm font-bold text-foreground transition hover:border-primary disabled:opacity-60"
          >
            Editar
          </button>}
          <span className="flex-1" />
          {isPending ? (
            <>
              <button
                type="button"
                disabled={disabled}
                onClick={onReject}
                className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-danger-border bg-white px-4 text-sm font-bold text-danger transition hover:bg-danger-soft disabled:opacity-60"
              >
                Rejeitar
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={onApprove}
                className="inline-flex min-h-11 items-center rounded-[10px] bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-darker disabled:opacity-60"
              >
                {onNext ? 'Aprovar e ir para o próximo' : 'Aprovar'}
              </button>
            </>
          ) : null}
          {product.status === 'REJEITADO' ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onApprove}
              className="inline-flex min-h-11 items-center rounded-[10px] bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-darker disabled:opacity-60"
            >
              Reconsiderar e aprovar
            </button>
          ) : null}
          {isApproved ? (
            <>
              <VitrineSwitch
                checked={product.ativo}
                disabled={disabled}
                onChange={onToggleAtivo}
              />
              <button
                type="button"
                aria-pressed={product.destaque}
                disabled={disabled || !product.ativo || destaqueLimitReached}
                title={
                  !product.ativo
                    ? 'Mostre o produto na vitrine para destacá-lo'
                    : destaqueLimitReached
                      ? 'Limite de destaques atingido'
                      : undefined
                }
                onClick={onToggleDestaque}
                className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  product.destaque
                    ? 'border-warning bg-pending-soft text-pending'
                    : 'border-primary bg-white text-primary-darker hover:bg-secondary-background'
                }`}
              >
                <span aria-hidden="true">★</span>
                {product.destaque
                  ? 'Remover destaque'
                  : `Destacar (${destaqueCount}/${MAX_PRODUCT_DESTAQUES})`}
              </button>
            </>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {product.motivoRejeicao ? (
          <div className="rounded-lg border border-danger-border bg-danger-soft p-4">
            <p className="text-xs font-bold uppercase text-danger">
              Motivo da rejeição
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-danger">
              {product.motivoRejeicao}
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <ProductGallery key={product.id} product={product} />
          <CatalogPreview product={product} producer={producer} />
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <section aria-labelledby="product-info-title">
            <h3 id="product-info-title" className="text-sm font-bold text-foreground">
              Informações
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
              {product.descricaoBreve}
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {product.descricao}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
              <Detail label="Categoria" value={categoria} />
              <Detail label="Unidade" value={product.unidadeMedida} />
              <Detail label="Valor" value={formatCurrency(product.valorCentavos)} />
              {producer ? (
                <Detail
                  label="Produtor"
                  value={`${producer.nomeEmpresa} · ${producer.endereco.cidade}`}
                />
              ) : null}
              <Detail
                label="Registros"
                value={
                  product.registros
                    .map((item) =>
                      [
                        item.tipo === 'Outro' && item.tipoOutros
                          ? item.tipoOutros
                          : item.tipo,
                        item.numero,
                        item.dataValidade
                          ? `até ${formatDate(item.dataValidade)}`
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' · '),
                    )
                    .join('\n') || '—'
                }
              />
              <Detail
                label="Premiações"
                value={
                  product.premiacoes.length > 0
                    ? product.premiacoes
                        .map((item) => `${item.nome} (${item.ano})`)
                        .join('\n')
                    : 'Nenhuma'
                }
              />
            </dl>
            {product.observacoes ? (
              <div className="mt-4 rounded-lg bg-background p-3.5">
                <p className="text-xs font-bold uppercase text-text-muted">
                  Observações
                </p>
                <p className="mt-1 text-sm text-slate-700">{product.observacoes}</p>
              </div>
            ) : null}
          </section>

          <div className="h-fit rounded-xl border border-border-soft p-4">
            <ReviewChecklist items={getProductChecklist(product)} />
          </div>
        </div>

        {isPending ? (
          <p className="hidden items-center gap-2 text-xs text-text-muted lg:flex">
            <Kbd>Esc</Kbd> fecha o painel
          </p>
        ) : null}
      </div>
    </SidePanel>
  )
}

function ProductGallery({ product }: { product: Product }) {
  const [kind, setKind] = useState<GalleryKind>(
    product.fotosDivulgacao.length > 0 ? 'divulgacao' : 'avaliacao',
  )
  const [index, setIndex] = useState(0)
  const images: ProductFile[] =
    kind === 'divulgacao' ? product.fotosDivulgacao : product.fotosAvaliacao
  const selected = images[index] ?? images[0]

  function changeKind(next: GalleryKind) {
    setKind(next)
    setIndex(0)
  }

  return (
    <section aria-label="Fotos do produto">
      <div
        role="group"
        aria-label="Tipo de foto"
        className="inline-flex rounded-[10px] bg-background p-1"
      >
        {(
          [
            ['divulgacao', `Divulgação (${product.fotosDivulgacao.length})`],
            ['avaliacao', `Avaliação (${product.fotosAvaliacao.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={kind === id}
            onClick={() => changeKind(id)}
            className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
              kind === id
                ? 'bg-white text-foreground shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-text-muted">
        {kind === 'divulgacao'
          ? 'Aparecem no catálogo depois da aprovação.'
          : 'Uso interno da equipe para análise.'}
      </p>

      {selected ? (
        <>
          <a
            href={selected.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block overflow-hidden rounded-xl border border-border-soft bg-background"
          >
            <img
              src={buildThumbnailUrl(selected.url, THUMBNAIL_WIDTH.detail)}
              alt={`${product.nome}: ${selected.nomeOriginal}`}
              className="aspect-[4/3] w-full object-contain"
            />
          </a>
          {images.length > 1 ? (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {images.map((image, imageIndex) => (
                <button
                  key={`${image.url}-${imageIndex}`}
                  type="button"
                  onClick={() => setIndex(imageIndex)}
                  aria-label={`Ver foto ${imageIndex + 1}`}
                  aria-pressed={imageIndex === index}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    imageIndex === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted'
                  }`}
                >
                  <img
                    src={buildThumbnailUrl(image.url, THUMBNAIL_WIDTH.gallery)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-text-muted">
          Nenhuma foto deste tipo.
        </p>
      )}
    </section>
  )
}

function CatalogPreview({
  product,
  producer,
}: {
  product: Product
  producer?: Producer
}) {
  const image = product.fotosDivulgacao[0]

  return (
    <section aria-labelledby="catalog-preview-title">
      <h3 id="catalog-preview-title" className="text-sm font-bold text-foreground">
        Como aparece no catálogo
      </h3>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <div className="relative aspect-[4/3] bg-background">
          {image ? (
            <img
              src={buildThumbnailUrl(image.url, THUMBNAIL_WIDTH.card)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-sm text-text-muted">
              Sem foto de divulgação
            </span>
          )}
          {product.destaque ? (
            <span className="absolute left-3 top-3 rounded-full bg-accent-yellow px-2.5 py-1 text-xs font-bold text-foreground">
              Destaque
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-darker">
            {PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria}
          </p>
          <p className="font-bold text-foreground">{product.nome}</p>
          {producer ? (
            <p className="text-sm text-text-muted">
              {producer.nomeEmpresa} · {producer.endereco.cidade}
            </p>
          ) : null}
          <p className="mt-1 text-lg font-extrabold text-foreground">
            {formatCurrency(product.valorCentavos)}{' '}
            <span className="text-sm font-medium text-text-muted">
              / {product.unidadeMedida}
            </span>
          </p>
          <span className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#25d366] text-sm font-bold text-white">
            Comprar pelo WhatsApp
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Prévia ilustrativa do cartão público.
      </p>
    </section>
  )
}

function VitrineSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="flex min-h-11 items-center gap-2.5 rounded-[10px] px-2 text-sm font-semibold text-text disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`relative inline-block h-6 w-10 rounded-full transition ${
          checked ? 'bg-primary' : 'bg-slate-400'
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
            checked ? 'left-[19px]' : 'left-[3px]'
          }`}
        />
      </span>
      {checked ? 'Na vitrine' : 'Oculto'}
    </button>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line break-words font-semibold text-text">
        {value}
      </dd>
    </div>
  )
}
