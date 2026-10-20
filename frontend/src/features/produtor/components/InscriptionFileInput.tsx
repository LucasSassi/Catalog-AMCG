import { useId, useRef } from 'react'

interface InscriptionFileInputProps {
  accept: string
  multiple?: boolean
  fileNames: string[]
  onChange: (files: FileList | null) => void
  emptyLabel?: string
  hint?: string
}

export function InscriptionFileInput({
  accept,
  multiple = false,
  fileNames,
  onChange,
  emptyLabel = 'Nenhum anexo inserido',
  hint,
}: InscriptionFileInputProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const label =
    fileNames.length > 0 ? fileNames.join(', ') : emptyLabel

  return (
    <div className="relative">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-b-md border border-t-0 border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-500"
        onClick={() => inputRef.current?.click()}
      >
        <span className="truncate">{label}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {hint ? (
        <p className="mt-1 px-1 text-xs text-slate-500">{hint}</p>
      ) : null}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => onChange(event.target.files)}
      />
    </div>
  )
}
