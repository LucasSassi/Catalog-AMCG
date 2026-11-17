import { useId, useState, type DragEvent } from 'react'
import {
  buildThumbnailUrl,
  THUMBNAIL_WIDTH,
} from '../../../shared/lib/buildThumbnailUrl'
import { fileToArquivo } from '../lib/file-to-arquivo'
import type { ProducerFile } from '../types'

interface ImageDropzoneProps {
  label: string
  description?: string
  files: ProducerFile[]
  max: number
  allowedTypes: readonly string[]
  onChange: (files: ProducerFile[]) => void
}

/**
 * Envio de imagens por arrastar-e-soltar ou clique, com prévia, remoção e
 * mensagem clara quando um arquivo passa de 700 KB ou tem tipo inválido.
 */
export function ImageDropzone({
  label,
  description,
  files,
  max,
  allowedTypes,
  onChange,
}: ImageDropzoneProps) {
  const inputId = useId()
  const [errors, setErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const remaining = max - files.length

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) {
      return
    }

    setIsReading(true)
    const accepted: ProducerFile[] = []
    const problems: string[] = []
    const candidates = Array.from(list)

    for (const file of candidates.slice(0, Math.max(remaining, 0))) {
      try {
        accepted.push(await fileToArquivo(file, allowedTypes))
      } catch (error) {
        problems.push(
          error instanceof Error ? error.message : `Falha ao ler ${file.name}.`,
        )
      }
    }

    if (candidates.length > remaining) {
      problems.push(`Limite de ${max} ${max === 1 ? 'imagem' : 'imagens'}.`)
    }

    setErrors(problems)
    setIsReading(false)

    if (accepted.length > 0) {
      onChange(max === 1 ? accepted.slice(0, 1) : [...files, ...accepted])
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    void addFiles(event.dataTransfer.files)
  }

  function remove(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-text-muted">
          {files.length}/{max}
        </span>
      </div>
      {description ? (
        <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      ) : null}

      {files.length > 0 ? (
        <ul className="mt-2.5 grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2.5">
          {files.map((file, index) => (
            <li
              key={`${file.nomeOriginal}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-border-soft bg-background"
            >
              <img
                src={buildThumbnailUrl(file.url, THUMBNAIL_WIDTH.gallery)}
                alt={file.nomeOriginal}
                className="aspect-square w-full object-cover"
              />
              {index === 0 && max > 1 ? (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-foreground/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Capa
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remover ${file.nomeOriginal}`}
                className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-sm font-bold text-danger shadow-sm transition hover:bg-danger-soft"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {remaining > 0 ? (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-2.5 flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition focus-within:border-primary ${
            isDragging
              ? 'border-primary bg-secondary-background'
              : 'border-slate-300 bg-white hover:border-primary'
          }`}
        >
          <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
          <span className="text-sm font-bold text-foreground">
            {isReading
              ? 'Lendo arquivos...'
              : 'Arraste as imagens ou clique para escolher'}
          </span>
          <span className="text-xs text-text-muted">
            JPG, PNG ou WebP · até 700 KB cada
            {max > 1 ? ` · mais ${remaining}` : ''}
          </span>
          <input
            id={inputId}
            type="file"
            accept={allowedTypes.join(',')}
            multiple={max > 1}
            className="sr-only"
            onChange={(event) => {
              void addFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </label>
      ) : null}

      {errors.length > 0 ? (
        <ul role="alert" className="mt-2 flex flex-col gap-1">
          {errors.map((message) => (
            <li
              key={message}
              className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger"
            >
              {message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
