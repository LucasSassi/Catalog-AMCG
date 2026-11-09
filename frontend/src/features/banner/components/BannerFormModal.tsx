import { useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../../../shared/components/Modal'
import {
  FormField,
  formInputClassName,
} from '../../../shared/components/SectionedForm'
import {
  BANNER_LINK_SUGGESTIONS,
  MAX_BANNER_ALT_LENGTH,
  MAX_BANNER_TITLE_LENGTH,
} from '../constants'
import type {
  Banner,
  BannerImage,
  CreateBannerInput,
  UpdateBannerInput,
} from '../types'
import { BannerImageField } from './BannerImageField'

interface BannerFormModalProps {
  banner?: Banner
  canActivate: boolean
  isSaving: boolean
  error: string
  onClose: () => void
  onCreate: (input: CreateBannerInput) => Promise<boolean>
  onUpdate: (id: string, input: UpdateBannerInput) => Promise<boolean>
}

interface FormState {
  titulo: string
  textoAlternativo: string
  imagem?: BannerImage
  imagemMobile?: BannerImage
  link: string
  ativo: boolean
  inicioEm: string
  fimEm: string
}

/** ISO → valor de `<input type="datetime-local">` no fuso local. */
function toLocalInput(iso?: string): string {
  if (!iso) {
    return ''
  }

  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromLocalInput(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined
}

function buildState(banner?: Banner, canActivate = true): FormState {
  return {
    titulo: banner?.titulo ?? '',
    textoAlternativo: banner?.textoAlternativo ?? '',
    imagem: banner?.imagem,
    imagemMobile: banner?.imagemMobile,
    link: banner?.link ?? '',
    ativo: banner?.ativo ?? canActivate,
    inicioEm: toLocalInput(banner?.inicioEm),
    fimEm: toLocalInput(banner?.fimEm),
  }
}

export function BannerFormModal({
  banner,
  canActivate,
  isSaving,
  error,
  onClose,
  onCreate,
  onUpdate,
}: BannerFormModalProps) {
  const isEditing = banner !== undefined
  const [initial] = useState(() => buildState(banner, canActivate))
  const [form, setForm] = useState<FormState>(initial)
  const [showMobile, setShowMobile] = useState(Boolean(banner?.imagemMobile))
  const [localError, setLocalError] = useState('')
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial],
  )

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function guardedClose() {
    if (isDirty && !window.confirm('Descartar as alterações não salvas?')) {
      return
    }

    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (!form.imagem) {
      setLocalError('Envie a imagem do banner.')
      return
    }

    if (form.inicioEm && form.fimEm && form.fimEm < form.inicioEm) {
      setLocalError('A data de fim deve ser depois da data de início.')
      return
    }

    const link = form.link.trim()
    let ok: boolean

    if (isEditing && banner) {
      ok = await onUpdate(banner.id, {
        titulo: form.titulo.trim(),
        textoAlternativo: form.textoAlternativo.trim(),
        imagem: form.imagem,
        imagemMobile: form.imagemMobile ?? null,
        link: link || null,
        inicioEm: fromLocalInput(form.inicioEm) ?? null,
        fimEm: fromLocalInput(form.fimEm) ?? null,
      })
    } else {
      ok = await onCreate({
        titulo: form.titulo.trim(),
        textoAlternativo: form.textoAlternativo.trim(),
        imagem: form.imagem,
        imagemMobile: form.imagemMobile,
        link: link || undefined,
        ativo: form.ativo,
        inicioEm: fromLocalInput(form.inicioEm),
        fimEm: fromLocalInput(form.fimEm),
      })
    }

    if (ok) {
      onClose()
    }
  }

  const shownError = localError || error

  return (
    <Modal
      title={isEditing ? `Editar banner` : 'Novo banner'}
      subtitle={
        <p className="text-sm text-text-muted">
          {isEditing
            ? banner.titulo
            : 'O banner entra no fim do carrossel. Você pode reordenar depois.'}
        </p>
      }
      size="wide"
      onClose={guardedClose}
      footer={
        <>
          <span
            className={`flex items-center gap-2 text-sm font-semibold ${
              isDirty ? 'text-pending' : 'text-text-muted'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${isDirty ? 'bg-warning' : 'bg-muted'}`}
            />
            {isDirty ? 'Alterações não salvas' : 'Nenhuma alteração'}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={guardedClose}
            className="min-h-11 rounded-[10px] px-4 text-sm font-bold text-foreground transition hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="banner-form"
            disabled={isSaving}
            className="min-h-11 rounded-[10px] bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-darker disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar banner' : 'Criar banner'}
          </button>
        </>
      }
    >
      <form
        id="banner-form"
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-5">
          <BannerImageField
            label="Imagem do banner"
            description="Aparece no computador e, se não houver imagem própria, também no celular."
            variant="desktop"
            image={form.imagem}
            required
            onChange={(image) => update('imagem', image)}
          />

          {showMobile ? (
            <BannerImageField
              label="Imagem para celular"
              description="Use quando o texto da arte fica cortado no celular (formato 2:1)."
              variant="mobile"
              image={form.imagemMobile}
              onChange={(image) => {
                update('imagemMobile', image)

                if (!image) {
                  setShowMobile(false)
                }
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowMobile(true)}
              className="self-start text-sm font-semibold text-primary-darker hover:text-primary-dark"
            >
              + Adicionar versão para celular (1080×540 px)
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            label="Título interno"
            hint={`Só aparece no backoffice. ${form.titulo.length}/${MAX_BANNER_TITLE_LENGTH}`}
          >
            <input
              required
              type="text"
              maxLength={MAX_BANNER_TITLE_LENGTH}
              value={form.titulo}
              onChange={(event) => update('titulo', event.target.value)}
              className={formInputClassName}
              placeholder="Ex.: Mel Rei Abelha — novembro"
            />
          </FormField>

          <FormField
            label="Descrição da imagem"
            hint="Lida por leitores de tela. Descreva o que a imagem mostra, incluindo textos da arte."
          >
            <textarea
              required
              rows={3}
              maxLength={MAX_BANNER_ALT_LENGTH}
              value={form.textoAlternativo}
              onChange={(event) => update('textoAlternativo', event.target.value)}
              className={formInputClassName}
              placeholder="Ex.: Pote de mel com favo ao lado e o texto “Mel puro dos Campos Gerais”"
            />
          </FormField>

          <FormField
            label="Link ao clicar (opcional)"
            hint="Página do catálogo (começando com /) ou endereço completo com https://"
          >
            <input
              type="text"
              value={form.link}
              onChange={(event) => update('link', event.target.value)}
              className={formInputClassName}
              placeholder="/produtos/… ou https://…"
            />
          </FormField>
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {BANNER_LINK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.value}
                type="button"
                onClick={() => update('link', suggestion.value)}
                className="min-h-8 rounded-full border border-slate-300 bg-white px-2.5 text-xs font-semibold text-text transition hover:border-primary"
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <fieldset className="rounded-xl border border-border-soft p-3.5">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Período no ar (opcional)
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Início">
                <input
                  type="datetime-local"
                  value={form.inicioEm}
                  onChange={(event) => update('inicioEm', event.target.value)}
                  className={formInputClassName}
                />
              </FormField>
              <FormField label="Fim">
                <input
                  type="datetime-local"
                  value={form.fimEm}
                  min={form.inicioEm || undefined}
                  onChange={(event) => update('fimEm', event.target.value)}
                  className={formInputClassName}
                />
              </FormField>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Útil para campanhas e feiras: o banner entra e sai sozinho.
            </p>
          </fieldset>

          {!isEditing ? (
            <label className="flex min-h-11 items-center gap-2.5 text-sm text-text">
              <input
                type="checkbox"
                checked={form.ativo}
                disabled={!canActivate}
                onChange={(event) => update('ativo', event.target.checked)}
                className="h-[18px] w-[18px] accent-primary"
              />
              {canActivate
                ? 'Publicar ativo no catálogo'
                : 'Limite de banners ativos atingido: será criado desativado'}
            </label>
          ) : null}

          {shownError ? (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {shownError}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  )
}
