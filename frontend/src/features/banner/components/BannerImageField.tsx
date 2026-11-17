import { useId, useState, type DragEvent } from 'react'
import {
  BANNER_CONTENT_TYPES,
  BANNER_DIMENSIONS,
  CAROUSEL_DESKTOP_RATIO,
  CAROUSEL_MOBILE_RATIO,
} from '../constants'
import {
  checkBannerDimensions,
  fileToBannerImage,
} from '../lib/banner-image'
import type { BannerImage } from '../types'

interface BannerImageFieldProps {
  label: string
  description: string
  variant: 'desktop' | 'mobile'
  image?: BannerImage
  required?: boolean
  onChange: (image: BannerImage | undefined) => void
}

/**
 * Envio da imagem do banner com validação, aviso de dimensões e um guia que
 * mostra o que fica visível no computador e no celular.
 */
export function BannerImageField({
  label,
  description,
  variant,
  image,
  required = false,
  onChange,
}: BannerImageFieldProps) {
  const inputId = useId()
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const target = BANNER_DIMENSIONS[variant]
  const check = image ? checkBannerDimensions(image, variant) : null

  async function handleFiles(list: FileList | null) {
    const file = list?.[0]

    if (!file) {
      return
    }

    setIsReading(true)
    setError('')

    try {
      onChange(await fileToBannerImage(file, file.name))
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : 'Não foi possível ler a imagem.',
      )
    } finally {
      setIsReading(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    void handleFiles(event.dataTransfer.files)
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {label}
          {required ? null : (
            <span className="font-medium text-text-muted"> (opcional)</span>
          )}
        </span>
        <span className="text-xs font-semibold text-text-muted">
          Ideal: {target.width}×{target.height} px
        </span>
      </div>
      <p className="mt-0.5 text-xs text-text-muted">{description}</p>

      {image ? (
        <div className="mt-2.5 flex flex-col gap-2">
          <CropGuide image={image} variant={variant} />
          {check ? (
            <p
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                check.tone === 'ok'
                  ? 'bg-approved-soft text-primary-darker'
                  : 'bg-[#fff4e5] text-[#8a4b00]'
              }`}
            >
              {check.tone === 'ok' ? '✓ ' : '⚠ '}
              {check.message}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-text-muted">
              {image.nomeOriginal}
            </span>
            <label
              htmlFor={inputId}
              className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 font-semibold text-foreground transition hover:border-primary focus-within:border-primary"
            >
              Trocar imagem
            </label>
            {!required ? (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="min-h-10 rounded-lg px-3 font-semibold text-danger transition hover:bg-danger-soft"
              >
                Remover
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-2.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 text-center transition focus-within:border-primary ${
            variant === 'desktop' ? 'aspect-[1920/706]' : 'aspect-[2/1] max-w-sm'
          } ${
            isDragging
              ? 'border-primary bg-secondary-background'
              : 'border-slate-300 bg-white hover:border-primary'
          }`}
        >
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="m21 16-5-5-9 8" />
          </svg>
          <span className="text-sm font-bold text-foreground">
            {isReading ? 'Lendo imagem...' : 'Arraste a imagem ou clique para escolher'}
          </span>
          <span className="text-xs text-text-muted">
            {target.width}×{target.height} px · JPG, PNG ou WebP · até 1,5 MB
          </span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept={BANNER_CONTENT_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {error ? (
        <p role="alert" className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Fração visível (largura, altura) quando a imagem preenche um quadro. */
function visibleFraction(imageRatio: number, frameRatio: number) {
  return imageRatio < frameRatio
    ? { width: 1, height: imageRatio / frameRatio }
    : { width: frameRatio / imageRatio, height: 1 }
}

function CropGuide({
  image,
  variant,
}: {
  image: BannerImage
  variant: 'desktop' | 'mobile'
}) {
  const [showGuide, setShowGuide] = useState(true)
  const ratio =
    image.largura && image.altura ? image.largura / image.altura : null
  const frames =
    variant === 'desktop'
      ? [
          { id: 'desktop', label: 'Computador', ratio: CAROUSEL_DESKTOP_RATIO, color: '#f7c948' },
          { id: 'mobile', label: 'Celular', ratio: CAROUSEL_MOBILE_RATIO, color: '#ffffff' },
        ]
      : [{ id: 'mobile', label: 'Celular', ratio: CAROUSEL_MOBILE_RATIO, color: '#ffffff' }]

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-border-soft bg-foreground">
        <img
          src={image.url}
          alt=""
          className={`block w-full ${variant === 'mobile' ? 'max-w-sm' : ''}`}
        />
        {ratio && showGuide
          ? frames.map((frame) => {
              const visible = visibleFraction(ratio, frame.ratio)

              return (
                <span
                  key={frame.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-sm border-2 border-dashed"
                  style={{
                    borderColor: frame.color,
                    width: `${visible.width * 100}%`,
                    height: `${visible.height * 100}%`,
                    left: `${((1 - visible.width) / 2) * 100}%`,
                    top: `${((1 - visible.height) / 2) * 100}%`,
                  }}
                >
                  <span
                    className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-foreground"
                    style={{ backgroundColor: frame.color }}
                  >
                    {frame.label}
                  </span>
                </span>
              )
            })
          : null}
      </div>
      {ratio ? (
        <label className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={showGuide}
            onChange={(event) => setShowGuide(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Mostrar áreas visíveis — mantenha textos e logos dentro das duas
          molduras.
        </label>
      ) : null}
    </div>
  )
}
