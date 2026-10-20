import {
  MAX_PRODUCT_PHOTOS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
} from '../constants'
import type { ProductCategory } from '../types'
import {
  InscriptionField,
  inscriptionControlClassName,
  inscriptionTextareaClassName,
} from '../../produtor/components/InscriptionField'
import { InscriptionFileInput } from '../../produtor/components/InscriptionFileInput'
import { YES_NO_OPTIONS } from '../../produtor/constants'
import type {
  InscriptionProductDraft,
  ProducerFile,
  YesNoOption,
} from '../../produtor/types'
import { Button } from '../../../shared/components/Button'

interface InscriptionProductFieldsProps {
  product: InscriptionProductDraft
  index: number
  canRemove: boolean
  onRemove: () => void
  onChange: (product: InscriptionProductDraft) => void
  onPickAvaliacao: (files: FileList | null) => void
  onPickDivulgacao: (files: FileList | null) => void
  onPickComprovante: (files: FileList | null) => void
}

function countWords(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) {
    return 0
  }

  return trimmed.split(/\s+/).length
}

export function InscriptionProductFields({
  product,
  index,
  canRemove,
  onRemove,
  onChange,
  onPickAvaliacao,
  onPickDivulgacao,
  onPickComprovante,
}: InscriptionProductFieldsProps) {
  function update<K extends keyof InscriptionProductDraft>(
    field: K,
    value: InscriptionProductDraft[K],
  ) {
    onChange({ ...product, [field]: value })
  }

  function handleDescricaoBreve(value: string) {
    if (countWords(value) > 20) {
      return
    }

    update('descricaoBreve', value)
  }

  const comprovanteRequired = product.premiado === 'Sim'
  const photosHint = `Até ${MAX_PRODUCT_PHOTOS} arquivos`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          {index === 0 ? 'Novo Produto' : `Produto ${index + 1}`}
        </p>
        {canRemove ? (
          <Button type="button" variant="danger" onClick={onRemove}>
            Remover
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InscriptionField label="Nome do Produto" required>
          <input
            required
            type="text"
            value={product.nome}
            onChange={(event) => update('nome', event.target.value)}
            className={inscriptionControlClassName}
            placeholder="Nome do produto"
          />
        </InscriptionField>

        <InscriptionField label="Categoria do Produto" required>
          <select
            required
            value={product.categoria}
            onChange={(event) =>
              update('categoria', event.target.value as ProductCategory)
            }
            className={inscriptionControlClassName}
          >
            {PRODUCT_CATEGORIES.map((categoria) => (
              <option key={categoria} value={categoria}>
                {PRODUCT_CATEGORY_LABELS[categoria]}
              </option>
            ))}
          </select>
        </InscriptionField>

        <InscriptionField label="Descrição Breve" required>
          <input
            required
            type="text"
            value={product.descricaoBreve}
            onChange={(event) => handleDescricaoBreve(event.target.value)}
            className={inscriptionControlClassName}
            placeholder="Descrição curta (máx. 20 palavras)"
          />
        </InscriptionField>

        <InscriptionField label="Selo Arte" required>
          <select
            required
            value={product.seloArte}
            onChange={(event) =>
              update('seloArte', event.target.value as YesNoOption | '')
            }
            className={inscriptionControlClassName}
          >
            <option value="">Selecione</option>
            {YES_NO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </InscriptionField>

        <InscriptionField label="Número do Registro" required>
          <input
            required
            type="text"
            value={product.numeroRegistro}
            onChange={(event) => update('numeroRegistro', event.target.value)}
            className={inscriptionControlClassName}
            placeholder="Nº registro"
          />
        </InscriptionField>
      </div>

      <InscriptionField label="Descrição Completa" required>
        <textarea
          required
          value={product.descricaoCompleta}
          onChange={(event) => update('descricaoCompleta', event.target.value)}
          className={inscriptionTextareaClassName}
          placeholder="Descrição Completa"
        />
      </InscriptionField>

      <div className="grid gap-4 md:grid-cols-2">
        <InscriptionField label="Premiado" required>
          <select
            required
            value={product.premiado}
            onChange={(event) =>
              update('premiado', event.target.value as YesNoOption | '')
            }
            className={inscriptionControlClassName}
          >
            <option value="">Selecione</option>
            {YES_NO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </InscriptionField>

        <InscriptionField
          label="Comprovações de Premiações (pdf, jpg)"
          required={comprovanteRequired}
        >
          <InscriptionFileInput
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            fileNames={fileNames(product.comprovantePremiacao)}
            onChange={onPickComprovante}
          />
        </InscriptionField>

        <InscriptionField
          label="Fotos de AVALIAÇÃO (rótulo - jpg, png)"
          required
        >
          <InscriptionFileInput
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            fileNames={product.fotosAvaliacao.map((file) => file.nomeOriginal)}
            onChange={onPickAvaliacao}
            hint={photosHint}
          />
        </InscriptionField>

        <InscriptionField label="Fotos de DIVULGAÇÃO (jpg, png)" required>
          <InscriptionFileInput
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            fileNames={product.fotosDivulgacao.map((file) => file.nomeOriginal)}
            onChange={onPickDivulgacao}
            hint={photosHint}
          />
        </InscriptionField>
      </div>

      <div className="max-w-xs">
        <InscriptionField label="Valor do Produto (R$)" required>
          <input
            required
            type="text"
            value={product.valorReais}
            onChange={(event) => update('valorReais', event.target.value)}
            className={inscriptionControlClassName}
            placeholder="00,00"
          />
        </InscriptionField>
      </div>

      <InscriptionField label="Outras Informações">
        <textarea
          value={product.outrasInformacoes}
          onChange={(event) =>
            update('outrasInformacoes', event.target.value)
          }
          className={inscriptionTextareaClassName}
          placeholder="Outras informações sobre o produto (como: composição nutricional, ingredientes, características, peculiaridades e demais detalhes relevantes)"
        />
      </InscriptionField>
    </div>
  )
}

function fileNames(file?: ProducerFile): string[] {
  if (!file) {
    return []
  }

  return [file.nomeOriginal]
}
