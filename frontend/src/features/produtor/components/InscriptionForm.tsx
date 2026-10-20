import { useState, type FormEvent } from 'react'
import { InscriptionProductFields } from '../../produto/components/InscriptionProductFields'
import { MAX_PRODUCT_PHOTOS } from '../../produto/constants'
import { Button } from '../../../shared/components/Button'
import { Feedback } from '../../../shared/components/Feedback'
import {
  AMCG_MUNICIPIOS,
  COMPANY_REGISTRATION_TYPE_OPTIONS,
  IMAGE_CONTENT_TYPES,
  MAX_PRODUCER_PHOTOS,
  YES_NO_OPTIONS,
} from '../constants'
import { useSubmitInscription } from '../hooks/useSubmitInscription'
import { buildInscriptionPayload } from '../lib/build-inscription-payload'
import {
  FileConversionError,
  fileToArquivo,
  filesToArquivos,
} from '../lib/file-to-arquivo'
import { maskPhoneInput } from '../lib/phone-mask'
import type {
  InscriptionFormState,
  InscriptionProductDraft,
  YesNoOption,
} from '../types'
import {
  InscriptionField,
  inscriptionControlClassName,
  inscriptionTextareaClassName,
} from './InscriptionField'
import { InscriptionFileInput } from './InscriptionFileInput'
import { InscriptionSection } from './InscriptionSection'

const IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'

const AWARD_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

interface InscriptionFormProps {
  onSuccess: () => void
}

function createProductDraft(): InscriptionProductDraft {
  return {
    id: crypto.randomUUID(),
    nome: '',
    categoria: 'MEL_E_DERIVADOS',
    descricaoBreve: '',
    seloArte: '',
    numeroRegistro: '',
    descricaoCompleta: '',
    premiado: '',
    fotosAvaliacao: [],
    fotosDivulgacao: [],
    valorReais: '',
    outrasInformacoes: '',
  }
}

const initialForm: InscriptionFormState = {
  municipio: '',
  fotosDivulgacao: [],
  nomeEmpresa: '',
  documentoNumero: '',
  tipoRegistro: '',
  tipoRegistroOutro: '',
  numeroRegistro: '',
  cep: '',
  endereco: '',
  informarEnderecoNoSite: '',
  telefone: '',
  email: '',
  instagram: '',
  facebook: '',
  site: '',
  historia: '',
  produtos: [createProductDraft()],
}

export function InscriptionForm({ onSuccess }: InscriptionFormProps) {
  const [form, setForm] = useState<InscriptionFormState>(initialForm)
  const [companyOpen, setCompanyOpen] = useState(true)
  const [productOpen, setProductOpen] = useState(true)
  const [localError, setLocalError] = useState('')
  const { submit, error, isLoading } = useSubmitInscription()

  function updateField<K extends keyof InscriptionFormState>(
    field: K,
    value: InscriptionFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateProduct(index: number, product: InscriptionProductDraft) {
    setForm((current) => {
      const produtos = current.produtos.map((item, itemIndex) =>
        itemIndex === index ? product : item,
      )
      return { ...current, produtos }
    })
  }

  function addProduct() {
    setForm((current) => ({
      ...current,
      produtos: [...current.produtos, createProductDraft()],
    }))
    setProductOpen(true)
  }

  function removeProduct(index: number) {
    setForm((current) => {
      if (current.produtos.length <= 1) {
        return current
      }

      return {
        ...current,
        produtos: current.produtos.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      }
    })
  }

  async function handleLogoChange(files: FileList | null) {
    setLocalError('')

    try {
      const arquivos = await filesToArquivos(files, IMAGE_CONTENT_TYPES, 1)
      updateField('logo', arquivos[0])
    } catch (conversionError) {
      setLocalError(toErrorMessage(conversionError))
    }
  }

  async function handleProducerPhotosChange(files: FileList | null) {
    setLocalError('')

    try {
      const arquivos = await filesToArquivos(
        files,
        IMAGE_CONTENT_TYPES,
        MAX_PRODUCER_PHOTOS,
      )
      updateField('fotosDivulgacao', arquivos)
    } catch (conversionError) {
      setLocalError(toErrorMessage(conversionError))
    }
  }

  async function handleProductPhotos(
    index: number,
    field: 'fotosAvaliacao' | 'fotosDivulgacao',
    files: FileList | null,
  ) {
    setLocalError('')

    try {
      const arquivos = await filesToArquivos(
        files,
        IMAGE_CONTENT_TYPES,
        MAX_PRODUCT_PHOTOS,
      )
      const product = form.produtos[index]
      updateProduct(index, { ...product, [field]: arquivos })
    } catch (conversionError) {
      setLocalError(toErrorMessage(conversionError))
    }
  }

  async function handleComprovanteChange(
    index: number,
    files: FileList | null,
  ) {
    setLocalError('')

    try {
      if (!files || files.length === 0) {
        const product = form.produtos[index]
        updateProduct(index, {
          ...product,
          comprovantePremiacao: undefined,
        })
        return
      }

      const arquivo = await fileToArquivo(files[0], AWARD_CONTENT_TYPES)
      const product = form.produtos[index]
      updateProduct(index, { ...product, comprovantePremiacao: arquivo })
    } catch (conversionError) {
      setLocalError(toErrorMessage(conversionError))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (!form.logo) {
      setLocalError('Logo da empresa é obrigatório (jpg, png ou webp).')
      return
    }

    if (form.fotosDivulgacao.length === 0) {
      setLocalError(
        'Ao menos uma foto de divulgação do produtor é obrigatória.',
      )
      return
    }

    if (form.tipoRegistro !== 'SIM') {
      setLocalError(
        'O tipo de registro da empresa aceito no catálogo é SIM (Inspeção Municipal).',
      )
      return
    }

    try {
      const payload = buildInscriptionPayload(form)
      const didSubmit = await submit(payload)

      if (didSubmit) {
        onSuccess()
      }
    } catch (buildError) {
      setLocalError(toErrorMessage(buildError))
    }
  }

  const displayError = localError || error
  const canRemoveProduct = form.produtos.length > 1

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <InscriptionSection
        title="Dados da Empresa (Produtor)"
        open={companyOpen}
        onToggle={() => setCompanyOpen((current) => !current)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InscriptionField label="Município" required>
            <select
              required
              value={form.municipio}
              onChange={(event) => updateField('municipio', event.target.value)}
              className={inscriptionControlClassName}
            >
              <option value="">Selecione o Município</option>
              {AMCG_MUNICIPIOS.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </InscriptionField>

          <InscriptionField label="Logo (jpg, png, webp)" required>
            <InscriptionFileInput
              accept={IMAGE_ACCEPT}
              fileNames={form.logo ? [form.logo.nomeOriginal] : []}
              onChange={handleLogoChange}
              hint="1 arquivo"
            />
          </InscriptionField>

          <InscriptionField label="Nome da Empresa" required>
            <input
              required
              type="text"
              value={form.nomeEmpresa}
              onChange={(event) =>
                updateField('nomeEmpresa', event.target.value)
              }
              className={inscriptionControlClassName}
              placeholder="Nome da empresa"
            />
          </InscriptionField>

          <InscriptionField label="CNPJ / CPF / CAD-PRO" required>
            <input
              required
              type="text"
              value={form.documentoNumero}
              onChange={(event) =>
                updateField('documentoNumero', event.target.value)
              }
              className={inscriptionControlClassName}
              placeholder="Nº documento"
            />
          </InscriptionField>

          <InscriptionField label="Tipo de Registro" required>
            <select
              required
              value={form.tipoRegistro}
              onChange={(event) =>
                updateField(
                  'tipoRegistro',
                  event.target.value as InscriptionFormState['tipoRegistro'],
                )
              }
              className={inscriptionControlClassName}
            >
              <option value="">Selecione o tipo de registro</option>
              {COMPANY_REGISTRATION_TYPE_OPTIONS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </InscriptionField>

          <InscriptionField label="Outro">
            <input
              type="text"
              value={form.tipoRegistroOutro}
              onChange={(event) =>
                updateField('tipoRegistroOutro', event.target.value)
              }
              className={inscriptionControlClassName}
              placeholder="Outro"
              disabled={form.tipoRegistro !== 'Outro'}
            />
          </InscriptionField>
        </div>

        <div className="mt-4">
          <InscriptionField label="Número do Registro" required>
            <input
              required
              type="text"
              value={form.numeroRegistro}
              onChange={(event) =>
                updateField('numeroRegistro', event.target.value)
              }
              className={inscriptionControlClassName}
              placeholder="Nº registro"
            />
          </InscriptionField>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[0.7fr_1.3fr_1fr]">
          <InscriptionField label="CEP">
            <input
              type="text"
              value={form.cep}
              onChange={(event) => updateField('cep', event.target.value)}
              className={inscriptionControlClassName}
              placeholder="CEP"
            />
          </InscriptionField>

          <InscriptionField label="Endereço" required>
            <input
              required
              type="text"
              value={form.endereco}
              onChange={(event) => updateField('endereco', event.target.value)}
              className={inscriptionControlClassName}
              placeholder="Endereço"
            />
          </InscriptionField>

          <InscriptionField label="Deseja informar o endereço no site?">
            <select
              value={form.informarEnderecoNoSite}
              onChange={(event) =>
                updateField(
                  'informarEnderecoNoSite',
                  event.target.value as YesNoOption | '',
                )
              }
              className={inscriptionControlClassName}
            >
              <option value="">Selecione a resposta</option>
              {YES_NO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </InscriptionField>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InscriptionField label="Telefone" required>
            <input
              required
              type="tel"
              value={form.telefone}
              onChange={(event) =>
                updateField('telefone', maskPhoneInput(event.target.value))
              }
              className={inscriptionControlClassName}
              placeholder="(xx) xxxxx-xxxx"
            />
          </InscriptionField>

          <InscriptionField label="Email" required>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className={inscriptionControlClassName}
              placeholder="Email"
            />
          </InscriptionField>

          <InscriptionField label="Instagram">
            <input
              type="text"
              value={form.instagram}
              onChange={(event) =>
                updateField('instagram', event.target.value)
              }
              className={inscriptionControlClassName}
              placeholder="@usuario ou link"
            />
          </InscriptionField>

          <InscriptionField label="Facebook">
            <input
              type="text"
              value={form.facebook}
              onChange={(event) => updateField('facebook', event.target.value)}
              className={inscriptionControlClassName}
              placeholder="@pagina ou link"
            />
          </InscriptionField>

          <InscriptionField label="Site" className="md:col-span-2">
            <input
              type="url"
              value={form.site}
              onChange={(event) => updateField('site', event.target.value)}
              className={inscriptionControlClassName}
              placeholder="Link do site"
            />
          </InscriptionField>
        </div>

        <div className="mt-4">
          <InscriptionField
            label="Fotos de divulgação (jpg, png, webp)"
            required
          >
            <InscriptionFileInput
              accept={IMAGE_ACCEPT}
              multiple
              fileNames={form.fotosDivulgacao.map((file) => file.nomeOriginal)}
              onChange={handleProducerPhotosChange}
              hint={`Até ${MAX_PRODUCER_PHOTOS} arquivos`}
            />
          </InscriptionField>
        </div>

        <div className="mt-4">
          <InscriptionField label="História da Empresa (Produtor)" required>
            <textarea
              required
              value={form.historia}
              onChange={(event) => updateField('historia', event.target.value)}
              className={inscriptionTextareaClassName}
              placeholder="Compartilhe um pouco da sua trajetória."
            />
          </InscriptionField>
        </div>
      </InscriptionSection>

      <InscriptionSection
        title="Dados do Produto"
        open={productOpen}
        onToggle={() => setProductOpen((current) => !current)}
      >
        <div className="space-y-8">
          {form.produtos.map((product, index) => (
            <div
              key={product.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <InscriptionProductFields
                product={product}
                index={index}
                canRemove={canRemoveProduct}
                onRemove={() => removeProduct(index)}
                onChange={(next) => updateProduct(index, next)}
                onPickAvaliacao={(files) =>
                  void handleProductPhotos(index, 'fotosAvaliacao', files)
                }
                onPickDivulgacao={(files) =>
                  void handleProductPhotos(index, 'fotosDivulgacao', files)
                }
                onPickComprovante={(files) =>
                  void handleComprovanteChange(index, files)
                }
              />
            </div>
          ))}
        </div>
      </InscriptionSection>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">Novo Produto</p>
        <Button type="button" onClick={addProduct}>
          ADICIONAR
        </Button>
      </div>

      {displayError ? (
        <Feedback tone="error" title={displayError} />
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'ENVIAR'}
        </Button>
      </div>
    </form>
  )
}

function toErrorMessage(error: unknown): string {
  if (error instanceof FileConversionError || error instanceof Error) {
    return error.message
  }

  return 'Não foi possível processar o formulário.'
}
