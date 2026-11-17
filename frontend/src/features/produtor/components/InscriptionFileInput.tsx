import { useId, useRef } from 'react'

interface InscriptionFileInputProps {
  accept: string
  multiple?: boolean
  fileNames: string[]
  onChange: (files: FileList | null) => void
  emptyLabel?: string
  hint?: string
  /** Exige um arquivo ao enviar o formulário (ver form-validation). */
  required?: boolean
}

export function InscriptionFileInput({
  accept,
  multiple = false,
  fileNames,
  onChange,
  emptyLabel = 'Nenhum anexo inserido',
  hint,
  required = false,
}: InscriptionFileInputProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const label =
    fileNames.length > 0 ? fileNames.join(', ') : emptyLabel

  return (
    <div className="relative" data-file-input>
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
      {required ? (
        // Input oculto só para a validação; fica por último para o <label> do
        // campo continuar acionando o botão.
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          // Sem readOnly: campos somente leitura ficam fora da validação.
          onChange={() => {}}
          value={fileNames.length > 0 ? fileNames.join(',') : ''}
          data-required-proxy=""
          data-required-message="anexe o arquivo"
          className="sr-only"
        />
      ) : null}
    </div>
  )
}
