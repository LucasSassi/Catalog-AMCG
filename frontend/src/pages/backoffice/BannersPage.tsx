import { useState, type DragEvent } from 'react'
import { BannerFormModal } from '../../features/banner/components/BannerFormModal'
import {
  BANNER_DIMENSIONS,
  MAX_ACTIVE_BANNERS,
} from '../../features/banner/constants'
import { useManageBanners } from '../../features/banner/hooks/useManageBanners'
import {
  fileToBannerImage,
  getBannerSituation,
} from '../../features/banner/lib/banner-image'
import type { Banner, BannerSituation } from '../../features/banner/types'
import { bannerImages } from '../../shared/assets/banners'
import { BannerCarousel } from '../../shared/components/BannerCarousel'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'
import { Feedback } from '../../shared/components/Feedback'
import { Modal } from '../../shared/components/Modal'
import { ChevronIcon } from '../../shared/components/SidePanel'
import { Skeleton } from '../../shared/components/Skeleton'
import { useToast } from '../../shared/hooks/useToast'
import { formatDate } from '../../shared/lib/formatDate'
import {
  BackofficePageHeader,
  ErrorBanner,
  PlusIcon,
} from './BackofficePageHeader'

const SITUATION_STYLES: Record<BannerSituation, { label: string; classes: string }> = {
  'no-ar': { label: 'No ar', classes: 'bg-approved-soft text-primary-darker' },
  agendado: { label: 'Agendado', classes: 'bg-[#e5effa] text-[#1d4f8a]' },
  expirado: { label: 'Expirado', classes: 'bg-pending-soft text-pending' },
  inativo: { label: 'Desativado', classes: 'bg-slate-200 text-slate-700' },
}

type EditingState = { mode: 'create' } | { mode: 'edit'; banner: Banner } | null

export function BannersPage() {
  const manager = useManageBanners()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<EditingState>(null)
  const [formError, setFormError] = useState('')
  const [removing, setRemoving] = useState<Banner | null>(null)
  const [previewVariant, setPreviewVariant] = useState<'desktop' | 'mobile'>(
    'desktop',
  )
  const [isImporting, setIsImporting] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  const banners = manager.banners
  const activeCount = banners.filter((banner) => banner.ativo).length
  const canActivate = activeCount < MAX_ACTIVE_BANNERS
  const live = banners.filter(
    (banner) => getBannerSituation(banner) === 'no-ar',
  )

  function openForm(state: EditingState) {
    setFormError('')
    setEditing(state)
  }

  async function toggleAtivo(banner: Banner) {
    const next = !banner.ativo
    const outcome = await manager.setAtivo(banner.id, next)

    if (!outcome.ok) {
      showToast({ message: outcome.message, tone: 'error' })
      return
    }

    showToast({
      message: next
        ? `“${banner.titulo}” ativado`
        : `“${banner.titulo}” desativado`,
      actionLabel: 'Desfazer',
      onAction: () => manager.setAtivo(banner.id, !next),
    })
  }

  async function move(index: number, step: -1 | 1) {
    const target = index + step

    if (target < 0 || target >= banners.length) {
      return
    }

    const ids = banners.map((banner) => banner.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    const outcome = await manager.reorder(ids)

    if (!outcome.ok) {
      showToast({ message: outcome.message, tone: 'error' })
    }
  }

  async function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) {
      return
    }

    const ids = banners.map((banner) => banner.id).filter((id) => id !== dragId)
    ids.splice(ids.indexOf(targetId), 0, dragId)
    setDragId(null)
    const outcome = await manager.reorder(ids)

    if (!outcome.ok) {
      showToast({ message: outcome.message, tone: 'error' })
    }
  }

  async function confirmRemove() {
    if (!removing) {
      return
    }

    const banner = removing
    const previousOrder = banners.map((item) => item.id)
    const outcome = await manager.remove(banner.id)
    setRemoving(null)

    if (!outcome.ok) {
      showToast({ message: outcome.message, tone: 'error' })
      return
    }

    showToast({
      message: `“${banner.titulo}” removido`,
      actionLabel: 'Desfazer',
      onAction: async () => {
        const restored = await manager.restore(banner, previousOrder)

        if (!restored.ok) {
          showToast({ message: restored.message, tone: 'error' })
        }
      },
    })
  }

  async function importDefaults() {
    setIsImporting(true)

    try {
      for (const [index, src] of bannerImages.entries()) {
        const response = await fetch(src)
        const blob = await response.blob()
        const name = decodeURIComponent(src.split('/').pop() ?? `banner-${index + 1}`)
          .replace(/-[\w-]{8}(\.\w+)$/, '$1')
        const imagem = await fileToBannerImage(blob, name)
        const titulo = name
          .replace(/\.\w+$/, '')
          .replace(/[_-]+/g, ' ')
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
        const outcome = await manager.create({
          titulo,
          textoAlternativo: `Banner de divulgação: ${titulo}`,
          imagem,
        })

        if (!outcome.ok) {
          throw new Error(outcome.message)
        }
      }

      showToast({ message: 'Banners atuais importados. Revise as descrições.' })
    } catch (importError) {
      showToast({
        message:
          importError instanceof Error
            ? importError.message
            : 'Não foi possível importar os banners.',
        tone: 'error',
      })
    } finally {
      setIsImporting(false)
    }
  }

  let content = (
    <ol className="flex flex-col gap-3" aria-label="Ordem dos banners no carrossel">
      {banners.map((banner, index) => {
        const situation = getBannerSituation(banner)
        const style = SITUATION_STYLES[situation]

        return (
          <li
            key={banner.id}
            draggable
            onDragStart={(event: DragEvent<HTMLLIElement>) => {
              setDragId(banner.id)
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              void dropOn(banner.id)
            }}
            onDragEnd={() => setDragId(null)}
            className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-3 transition sm:flex-nowrap ${
              dragId === banner.id
                ? 'border-primary opacity-60'
                : 'border-border-soft'
            } ${banner.ativo ? '' : 'bg-slate-50'}`}
          >
            <div className="flex items-center gap-1">
              <span
                aria-hidden="true"
                title="Arraste para reordenar"
                className="hidden cursor-grab px-1 text-lg leading-none text-text-muted sm:block"
              >
                ⋮⋮
              </span>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => void move(index, -1)}
                  disabled={index === 0 || manager.isUpdating}
                  aria-label={`Subir ${banner.titulo}`}
                  className="grid h-8 w-8 rotate-90 place-items-center rounded-lg text-foreground transition hover:bg-background disabled:opacity-30"
                >
                  <ChevronIcon direction="left" />
                </button>
                <span className="text-center text-xs font-bold text-text-muted">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => void move(index, 1)}
                  disabled={index === banners.length - 1 || manager.isUpdating}
                  aria-label={`Descer ${banner.titulo}`}
                  className="grid h-8 w-8 rotate-90 place-items-center rounded-lg text-foreground transition hover:bg-background disabled:opacity-30"
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openForm({ mode: 'edit', banner })}
              aria-label={`Editar ${banner.titulo}`}
              className={`relative aspect-[1920/706] w-44 shrink-0 overflow-hidden rounded-lg bg-foreground sm:w-56 ${
                banner.ativo ? '' : 'grayscale'
              }`}
            >
              <img
                src={banner.imagem.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.classes}`}>
                  {style.label}
                </span>
                {banner.imagemMobile ? (
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-text-muted">
                    + versão celular
                  </span>
                ) : null}
              </div>
              <p className="truncate font-bold text-foreground">{banner.titulo}</p>
              <p className="truncate text-xs text-text-muted">
                {banner.imagem.largura && banner.imagem.altura
                  ? `${banner.imagem.largura}×${banner.imagem.altura} px · `
                  : ''}
                {banner.link ? `Link: ${banner.link}` : 'Sem link'}
              </p>
              {banner.inicioEm || banner.fimEm ? (
                <p className="text-xs text-text-muted">
                  {banner.inicioEm ? `De ${formatDate(banner.inicioEm)}` : 'Já'}
                  {banner.fimEm ? ` até ${formatDate(banner.fimEm)}` : ' sem data de fim'}
                </p>
              ) : null}
            </div>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <button
                type="button"
                role="switch"
                aria-checked={banner.ativo}
                aria-label={`Banner ${banner.titulo} ativo`}
                disabled={manager.isUpdating || (!banner.ativo && !canActivate)}
                title={
                  !banner.ativo && !canActivate
                    ? `Limite de ${MAX_ACTIVE_BANNERS} banners ativos`
                    : undefined
                }
                onClick={() => void toggleAtivo(banner)}
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className={`relative inline-block h-6 w-10 rounded-full transition ${
                    banner.ativo ? 'bg-primary' : 'bg-slate-400'
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
                      banner.ativo ? 'left-[19px]' : 'left-[3px]'
                    }`}
                  />
                </span>
                {banner.ativo ? 'Ativo' : 'Inativo'}
              </button>
              <button
                type="button"
                onClick={() => openForm({ mode: 'edit', banner })}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setRemoving(banner)}
                aria-label={`Remover ${banner.titulo}`}
                className="grid min-h-11 w-11 place-items-center rounded-lg text-danger transition hover:bg-danger-soft"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )

  if (manager.isLoading) {
    content = (
      <div className="flex flex-col gap-3" role="status" aria-label="Carregando banners">
        {[0, 1].map((index) => (
          <div key={index} className="flex items-center gap-4 rounded-2xl border border-border-soft bg-white p-3">
            <Skeleton className="aspect-[1920/706] w-56 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  } else if (manager.error && banners.length === 0) {
    content = (
      <Feedback
        tone="error"
        title="Não foi possível carregar os banners"
        description={manager.error}
      />
    )
  } else if (banners.length === 0) {
    content = (
      <EmptyState
        title="Nenhum banner cadastrado"
        description={`O catálogo está sem carrossel. Importe os ${bannerImages.length} banners que já existiam ou crie um novo.`}
        action={
          <div className="flex flex-wrap justify-center gap-2.5">
            {bannerImages.length > 0 ? (
              <Button
                variant="secondary"
                disabled={isImporting}
                onClick={() => void importDefaults()}
              >
                {isImporting ? 'Importando...' : 'Importar banners atuais'}
              </Button>
            ) : null}
            <Button onClick={() => openForm({ mode: 'create' })}>
              <PlusIcon />
              Novo banner
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <BackofficePageHeader
        title="Banners"
        description="Imagens do carrossel no topo do catálogo. Arraste para mudar a ordem."
        actions={
          <>
            <span className="flex min-h-11 items-center rounded-lg border border-border-soft bg-white px-3.5 text-sm font-semibold text-text">
              Ativos {activeCount}/{MAX_ACTIVE_BANNERS}
            </span>
            <Button onClick={() => openForm({ mode: 'create' })}>
              <PlusIcon />
              Novo banner
            </Button>
          </>
        }
      />

      {manager.error && banners.length > 0 ? (
        <ErrorBanner message={manager.error} />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="preview-title" className="overflow-hidden rounded-2xl border border-border-soft bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
              <div>
                <h2 id="preview-title" className="font-bold text-foreground">
                  Como está no catálogo agora
                </h2>
                <p className="text-xs text-text-muted">
                  {live.length === 0
                    ? 'Nenhum banner no ar: o carrossel não aparece.'
                    : `${live.length} ${live.length === 1 ? 'banner no ar' : 'banners no ar'}, nesta ordem.`}
                </p>
              </div>
              <div role="group" aria-label="Tela da prévia" className="inline-flex rounded-[10px] bg-background p-1">
                {(['desktop', 'mobile'] as const).map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    aria-pressed={previewVariant === variant}
                    onClick={() => setPreviewVariant(variant)}
                    className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
                      previewVariant === variant
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    {variant === 'desktop' ? 'Computador' : 'Celular'}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-backoffice p-4">
              <div className={`mx-auto overflow-hidden rounded-xl shadow-sm ${previewVariant === 'mobile' ? 'max-w-[360px]' : ''}`}>
                {live.length > 0 ? (
                  <BannerCarousel
                    key={previewVariant}
                    forceVariant={previewVariant}
                    banners={live.map((banner) => ({
                      id: banner.id,
                      src: banner.imagem.url,
                      srcMobile: banner.imagemMobile?.url,
                      alt: banner.textoAlternativo,
                    }))}
                  />
                ) : (
                  <div className={`grid place-items-center bg-white text-sm text-text-muted ${previewVariant === 'mobile' ? 'aspect-[16/8]' : 'aspect-[16/5]'}`}>
                    Sem banners no ar
                  </div>
                )}
              </div>
            </div>
          </section>

          {content}
        </div>

        <DimensionGuide />
      </div>

      {editing ? (
        <BannerFormModal
          key={editing.mode === 'edit' ? editing.banner.id : 'novo'}
          banner={editing.mode === 'edit' ? editing.banner : undefined}
          canActivate={canActivate}
          isSaving={manager.isUpdating}
          error={formError}
          onClose={() => setEditing(null)}
          onCreate={async (input) => {
            const outcome = await manager.create(input)

            if (!outcome.ok) {
              setFormError(outcome.message)
              return false
            }

            showToast({ message: `Banner “${input.titulo}” criado` })
            return true
          }}
          onUpdate={async (id, input) => {
            const outcome = await manager.update(id, input)

            if (!outcome.ok) {
              setFormError(outcome.message)
              return false
            }

            showToast({ message: 'Banner atualizado' })
            return true
          }}
        />
      ) : null}

      {removing ? (
        <Modal
          title="Remover banner?"
          size="small"
          onClose={() => setRemoving(null)}
          footer={
            <>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setRemoving(null)}
                className="min-h-11 rounded-[10px] border-2 border-primary bg-white px-4 text-sm font-bold text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={manager.isUpdating}
                onClick={() => void confirmRemove()}
                className="min-h-11 rounded-[10px] bg-[#b42318] px-4 text-sm font-bold text-white transition hover:bg-danger disabled:opacity-60"
              >
                Remover banner
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <img
              src={removing.imagem.url}
              alt=""
              className="aspect-[1920/706] w-full rounded-lg object-cover"
            />
            <p className="text-sm text-text">
              “{removing.titulo}” sai do catálogo e da lista. Se quiser só
              tirar do ar por um tempo, prefira <strong>desativar</strong>.
            </p>
          </div>
        </Modal>
      ) : null}
    </main>
  )
}

function DimensionGuide() {
  const { desktop, mobile, safeArea } = BANNER_DIMENSIONS
  const safeLeft = ((desktop.width - safeArea.width) / 2 / desktop.width) * 100
  const safeTop = ((desktop.height - safeArea.height) / 2 / desktop.height) * 100

  return (
    <aside
      aria-labelledby="dimension-title"
      className="flex h-fit flex-col gap-4 rounded-2xl border border-border-soft bg-white p-5 xl:sticky xl:top-6"
    >
      <h2 id="dimension-title" className="font-bold text-foreground">
        Tamanho ideal da imagem
      </h2>

      <div>
        <p className="text-2xl font-extrabold text-foreground">
          {desktop.width} × {desktop.height} px
        </p>
        <p className="text-sm text-text-muted">
          Proporção ~2,7:1, a mesma dos banners atuais.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="relative aspect-[1920/706] w-full rounded-lg bg-surface"
      >
        <span
          className="absolute grid place-items-center rounded border-2 border-dashed border-primary text-[11px] font-bold text-primary-darker"
          style={{
            left: `${safeLeft}%`,
            right: `${safeLeft}%`,
            top: `${safeTop}%`,
            bottom: `${safeTop}%`,
          }}
        >
          Área segura {safeArea.width}×{safeArea.height}
        </span>
      </div>

      <ul className="flex flex-col gap-2.5 text-sm text-text">
        <li>
          <strong>Textos e logos</strong> dentro da área segura central (
          {safeArea.width}×{safeArea.height} px). No computador o carrossel
          corta ~50 px em cima e embaixo; no celular corta ~250 px de cada
          lateral.
        </li>
        <li>
          <strong>Celular (opcional):</strong> {mobile.width}×{mobile.height}{' '}
          px (2:1) quando a arte tem muito texto.
        </li>
        <li>
          <strong>Arquivo:</strong> WebP ou JPG, qualidade ~80%, até 1,5 MB.
          Os banners atuais têm ~150 KB.
        </li>
        <li>
          <strong>Até {MAX_ACTIVE_BANNERS} ativos.</strong> Use “Período no ar”
          para campanhas com data.
        </li>
      </ul>
    </aside>
  )
}
