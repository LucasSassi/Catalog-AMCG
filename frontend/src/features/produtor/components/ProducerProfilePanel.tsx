import { useState } from 'react'
import {
  AlertChips,
  ReviewChecklist,
} from '../../../shared/components/ReviewChecklist'
import {
  PanelPager,
  PanelTabs,
  SidePanel,
} from '../../../shared/components/SidePanel'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { formatDate } from '../../../shared/lib/formatDate'
import {
  countByStatus,
  formatWaitingDays,
  getWaitingDays,
} from '../../../shared/lib/review-status'
import { PRODUCT_CATEGORY_LABELS } from '../../produto/constants'
import type { Product } from '../../produto/types'
import { SOCIAL_NETWORK_LABELS } from '../constants'
import { getProducerAlerts, getProducerChecklist } from '../lib/producer-review'
import { formatSocialHandle } from '../lib/social-url'
import type { Producer, ProducerFile } from '../types'
import { ProducerAvatar } from './ProducerAvatar'
import {
  ProducerDecisionActions,
  type ProducerDecisionHandlers,
} from './ProducerDecisionActions'

type ProfileTab = 'visao' | 'produtos' | 'fotos' | 'historico'

interface ProducerProfilePanelProps extends ProducerDecisionHandlers {
  producer: Producer
  products: Product[]
  productsLoading: boolean
  disabled: boolean
  destaqueCount: number
  position: number
  total: number
  hasNext: boolean
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
  onEdit: () => void
  onOpenProduct: (product: Product) => void
}

interface GalleryImage {
  file: ProducerFile
  label: string
}

export function ProducerProfilePanel({
  producer,
  products,
  productsLoading,
  disabled,
  destaqueCount,
  position,
  total,
  hasNext,
  onPrevious,
  onNext,
  onClose,
  onEdit,
  onOpenProduct,
  ...handlers
}: ProducerProfilePanelProps) {
  const [tab, setTab] = useState<ProfileTab>('visao')
  const counts = countByStatus(products)
  const images: GalleryImage[] = [
    ...(producer.logo ? [{ file: producer.logo, label: 'Logo' }] : []),
    ...(producer.fotos ?? []).map((file, index) => ({
      file,
      label: `Foto ${index + 1}`,
    })),
  ]
  const alerts = getProducerAlerts(producer)
  const isPending = (producer.status === 'PENDENTE' || producer.status === 'ALTERADO')

  return (
    <SidePanel
      label={`Perfil de ${producer.nomeEmpresa}`}
      onClose={onClose}
      toolbar={
        <>
          <span className="text-sm font-semibold text-text-muted">
            Produtores
          </span>
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
        <div className="flex items-start gap-4">
          <ProducerAvatar producer={producer} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={producer.status} />
              {producer.destaque ? (
                <span className="rounded-full bg-pending-soft px-2.5 py-1 text-xs font-bold text-pending">
                  ★ Destaque
                </span>
              ) : null}
              {isPending ? (
                <span className="text-xs font-semibold text-text-muted">
                  na fila{' '}
                  {formatWaitingDays(getWaitingDays(producer.createdAt))}
                </span>
              ) : null}
            </div>
            <h2 className="mt-1.5 text-2xl font-extrabold leading-tight text-foreground">
              {producer.nomeEmpresa}
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {producer.endereco.cidade}/{producer.endereco.estado} ·{' '}
              {producer.documento.tipo} {producer.documento.numero}
            </p>
          </div>
        </div>
      }
      tabs={
        <PanelTabs<ProfileTab>
          label="Seções do perfil"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'visao', label: 'Visão geral' },
            { id: 'produtos', label: 'Produtos', count: products.length },
            { id: 'fotos', label: 'Fotos', count: images.length },
            { id: 'historico', label: 'Histórico' },
          ]}
        />
      }
      footer={
        <>
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="inline-flex min-h-11 items-center rounded-[10px] border border-slate-300 bg-white px-4 text-sm font-bold text-foreground transition hover:border-primary disabled:opacity-60"
          >
            Editar
          </button>
          {producer.status === 'APROVADO' && producer.ativo ? (
            <a
              href={`/produtores/${producer.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-primary-darker transition hover:bg-secondary-background"
            >
              Ver no catálogo ↗
            </a>
          ) : null}
          <span className="flex-1" />
          <ProducerDecisionActions
            producer={producer}
            disabled={disabled}
            destaqueCount={destaqueCount}
            approveLabel={hasNext ? 'Aprovar e ir para o próximo' : 'Aprovar'}
            {...handlers}
          />
        </>
      }
    >
      <div role="tabpanel" aria-label={tab}>
        {tab === 'visao' ? (
          <OverviewTab
            producer={producer}
            counts={counts}
            imagesCount={images.length}
            alerts={alerts}
          />
        ) : null}
        {tab === 'produtos' ? (
          <ProductsTab
            products={products}
            loading={productsLoading}
            onOpenProduct={onOpenProduct}
          />
        ) : null}
        {tab === 'fotos' ? (
          <ProducerGallery
            key={producer.id}
            images={images}
            producerName={producer.nomeEmpresa}
          />
        ) : null}
        {tab === 'historico' ? <HistoryTab producer={producer} /> : null}
      </div>
    </SidePanel>
  )
}

function OverviewTab({
  producer,
  counts,
  imagesCount,
  alerts,
}: {
  producer: Producer
  counts: ReturnType<typeof countByStatus>
  imagesCount: number
  alerts: ReturnType<typeof getProducerAlerts>
}) {
  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-border-soft sm:grid-cols-4">
        <Stat label="Aprovados" value={counts.APROVADO} tone="text-primary-darker" />
        <Stat label="Em análise" value={counts.PENDENTE + counts.ALTERADO} tone="text-pending" />
        <Stat label="Rejeitados" value={counts.REJEITADO} tone="text-danger" />
        <Stat label="Fotos" value={imagesCount} tone="text-foreground" />
      </dl>

      {producer.motivoRejeicao ? (
        <div className="rounded-lg border border-danger-border bg-danger-soft p-4">
          <p className="text-xs font-bold uppercase text-danger">
            Motivo da rejeição
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-danger">
            {producer.motivoRejeicao}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-border-soft p-4">
          <ReviewChecklist items={getProducerChecklist(producer)} />
          <AlertChips alerts={alerts} />
        </div>

        <section aria-labelledby="producer-data-title">
          <h3 id="producer-data-title" className="text-sm font-bold text-foreground">
            Dados e contato
          </h3>
          <dl className="mt-2.5 space-y-3 text-sm">
            <Detail
              label="Registros"
              value={
                producer.registros
                  .map((registro) =>
                    [
                      registro.tipo,
                      registro.numero,
                      registro.dataValidade
                        ? `válido até ${formatDate(registro.dataValidade)}`
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' · '),
                  )
                  .join('\n') || '—'
              }
            />
            <Detail label="WhatsApp" value={producer.contato.telefone} />
            <Detail label="E-mail" value={producer.contato.email} />
            {(producer.redesSociais ?? []).map((rede) => (
              <Detail
                key={rede.tipo}
                label={SOCIAL_NETWORK_LABELS[rede.tipo]}
                value={formatSocialHandle(rede)}
              />
            ))}
            {producer.site ? <Detail label="Site" value={producer.site} /> : null}
            <Detail
              label="Endereço"
              value={`${producer.endereco.rua}, ${producer.endereco.bairro} · ${producer.endereco.cidade}/${producer.endereco.estado}`}
            />
          </dl>
        </section>
      </div>

      {producer.historia ? (
        <section>
          <h3 className="text-sm font-bold text-foreground">História</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
            {producer.historia}
          </p>
        </section>
      ) : null}
    </div>
  )
}

function ProductsTab({
  products,
  loading,
  onOpenProduct,
}: {
  products: Product[]
  loading: boolean
  onOpenProduct: (product: Product) => void
}) {
  if (loading) {
    return <p className="text-sm text-text-muted">Carregando produtos...</p>
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-text-muted">
        Este produtor ainda não cadastrou produtos.
      </p>
    )
  }

  const order = { PENDENTE: 0, ALTERADO: 1, APROVADO: 2, REJEITADO: 3 } as const
  const sorted = [...products].sort((a, b) => order[a.status] - order[b.status])

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3.5">
      {sorted.map((product) => (
        <ProductMiniCard
          key={product.id}
          product={product}
          onOpen={() => onOpenProduct(product)}
        />
      ))}
    </ul>
  )
}

function HistoryTab({ producer }: { producer: Producer }) {
  const events = [
    {
      id: 'inscricao',
      date: producer.createdAt,
      title: 'Inscrição recebida',
      description: `Enviada por ${producer.contato.email || 'produtor'}.`,
    },
  ]

  if (producer.updatedAt && producer.updatedAt !== producer.createdAt) {
    const statusText = {
      PENDENTE: 'Aguardando análise',
      ALTERADO: 'Após modificação · aguardando revisão',
      APROVADO: 'Aprovado para o catálogo',
      REJEITADO: 'Rejeitado',
    }[producer.status]

    events.push({
      id: 'atualizacao',
      date: producer.updatedAt,
      title: 'Última atualização',
      description: `Situação atual: ${statusText}.`,
    })
  }

  return (
    <div>
      <ol className="relative ml-2 border-l-2 border-border-soft">
        {[...events].reverse().map((event) => (
          <li key={event.id} className="relative pb-6 pl-6 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary"
            />
            <p className="text-sm font-bold text-foreground">{event.title}</p>
            <p className="text-xs text-text-muted">
              {new Date(event.date).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
            <p className="mt-1 text-sm text-slate-700">{event.description}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-lg bg-background p-3 text-xs text-text-muted">
        O histórico mostra a data de inscrição e a última alteração registrada.
      </p>
    </div>
  )
}

function ProducerGallery({
  images,
  producerName,
}: {
  images: GalleryImage[]
  producerName: string
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = images[selectedIndex] ?? images[0]

  if (!selected) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-text-muted">
        Nenhuma foto enviada.
      </p>
    )
  }

  return (
    <section aria-label="Fotos do produtor">
      <a
        href={selected.file.url}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-xl border border-border-soft bg-background"
      >
        <img
          src={buildThumbnailUrl(selected.file.url, THUMBNAIL_WIDTH.detail)}
          alt={`${selected.label} de ${producerName}`}
          className="h-80 w-full object-contain"
        />
      </a>
      <p className="mt-2 text-xs text-text-muted">
        {selected.label} · {selectedIndex + 1} de {images.length} · clique para
        abrir em tamanho real
      </p>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image.file.url}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver ${image.label}`}
              aria-pressed={index === selectedIndex}
              className={`overflow-hidden rounded-lg border-2 transition ${
                index === selectedIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted'
              }`}
            >
              <img
                src={buildThumbnailUrl(image.file.url, THUMBNAIL_WIDTH.gallery)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-16 w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ProductMiniCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen: () => void
}) {
  const image = product.fotosDivulgacao[0]
  const isHidden = product.status === 'APROVADO' && !product.ativo

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`Ver detalhes de ${product.nome}`}
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border-soft bg-white text-left transition hover:border-primary hover:shadow-md"
      >
        <div className="relative h-28 w-full bg-background">
          {image ? (
            <img
              src={buildThumbnailUrl(image.url, THUMBNAIL_WIDTH.card)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : null}
          <StatusBadge
            status={product.status}
            hidden={isHidden}
            className="absolute left-2 top-2"
          />
          {product.destaque ? (
            <span
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-sm text-warning"
              role="img"
              aria-label="Em destaque"
            >
              ★
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-0.5 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary-darker">
            {PRODUCT_CATEGORY_LABELS[product.categoria] ?? product.categoria}
          </p>
          <p className="text-sm font-bold text-foreground">{product.nome}</p>
          <p className="mt-0.5 text-sm font-extrabold text-foreground">
            {formatCurrency(product.valorCentavos)}{' '}
            <span className="text-xs font-medium text-text-muted">
              / {product.unidadeMedida}
            </span>
          </p>
        </div>
      </button>
    </li>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="border-border-soft bg-background px-4 py-3 max-sm:odd:border-r sm:border-r sm:last:border-r-0">
      <dt className="text-xs font-semibold text-text-muted">{label}</dt>
      <dd className={`mt-0.5 text-2xl font-extrabold ${tone}`}>{value}</dd>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line break-words font-semibold text-text">
        {value}
      </dd>
    </div>
  )
}
