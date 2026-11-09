import { useEffect, useMemo, useState } from 'react'
import { Feedback } from '../../../shared/components/Feedback'
import {
  FormField,
  formInputClassName,
  SectionedForm,
  type FormSection,
} from '../../../shared/components/SectionedForm'
import { listProducers } from '../../produtor/api/producers'
import { ImageDropzone } from '../../produtor/components/ImageDropzone'
import type { Producer } from '../../produtor/types'
import {
  IMAGE_CONTENT_TYPES,
  MAX_DESCRICAO_BREVE_LENGTH,
  MAX_PRODUCT_PHOTOS,
  MEASUREMENT_UNITS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_REGISTRATION_TYPES,
} from '../constants'
import { useRegisterProduct } from '../hooks/useRegisterProduct'
import { useUpdateProduct } from '../hooks/useUpdateProduct'
import type { CreateProductInput, Product, ProductRegistration } from '../types'

interface ProductRegistrationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  onDirtyChange?: (dirty: boolean) => void
  approveAfterCreate?: boolean
  product?: Product
}

interface ProductFormSnapshot {
  form: CreateProductInput
  priceReais: string
}

const MAX_REGISTRATIONS = 5

const emptyRegistration: ProductRegistration = {
  tipo: 'SELO ARTE',
  numero: '',
}

function buildInitialForm(product?: Product): CreateProductInput {
  if (!product) {
    return {
      produtorId: '',
      nome: '',
      descricaoBreve: '',
      descricao: '',
      categoria: 'MEL_E_DERIVADOS',
      unidadeMedida: 'KG',
      registros: [{ ...emptyRegistration }],
      fotosAvaliacao: [],
      fotosDivulgacao: [],
      premiacoes: [],
      valorCentavos: 0,
      observacoes: '',
    }
  }

  return {
    produtorId: product.produtorId,
    nome: product.nome,
    descricaoBreve: product.descricaoBreve,
    descricao: product.descricao,
    categoria: product.categoria,
    unidadeMedida: product.unidadeMedida,
    registros:
      product.registros.length > 0
        ? product.registros.map((registro) => ({ ...registro }))
        : [{ ...emptyRegistration }],
    fotosAvaliacao: product.fotosAvaliacao
      .filter((foto) => foto.url)
      .map((foto) => ({ ...foto })),
    fotosDivulgacao: product.fotosDivulgacao.map((foto) => ({ ...foto })),
    premiacoes: product.premiacoes.map((premiacao) => ({ ...premiacao })),
    valorCentavos: product.valorCentavos,
    observacoes: product.observacoes ?? '',
  }
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim()
  // "1.234,56" (pt-BR) ou "25.90" / "25,90"
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed

  if (!normalized) {
    return null
  }

  const reais = Number(normalized)
  return Number.isNaN(reais) || reais < 0 ? null : Math.round(reais * 100)
}

export function ProductRegistrationForm({
  onSuccess,
  onCancel,
  onDirtyChange,
  approveAfterCreate = true,
  product,
}: ProductRegistrationFormProps) {
  const isEditMode = product !== undefined
  const [approvedProducers, setApprovedProducers] = useState<Producer[]>([])
  const [isLoadingProducers, setIsLoadingProducers] = useState(true)
  const [producersError, setProducersError] = useState('')
  const [snapshot, setSnapshot] = useState<ProductFormSnapshot>(() => ({
    form: buildInitialForm(product),
    priceReais: product
      ? (product.valorCentavos / 100).toFixed(2).replace('.', ',')
      : '',
  }))
  const [form, setForm] = useState<CreateProductInput>(snapshot.form)
  const [priceReais, setPriceReais] = useState(snapshot.priceReais)

  const register = useRegisterProduct({ approveAfterCreate })
  const update = useUpdateProduct()
  const error = isEditMode ? update.error : register.error
  const isLoading = isEditMode ? update.isLoading : register.isLoading
  const isDirty = useMemo(
    () =>
      JSON.stringify({ form, priceReais }) !== JSON.stringify(snapshot),
    [form, priceReais, snapshot],
  )

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    let isCurrent = true

    listProducers('APROVADO')
      .then((producers) => {
        if (!isCurrent) {
          return
        }

        setApprovedProducers(producers)
        setProducersError('')

        if (producers.length > 0) {
          const fallbackId = producers[0].id
          setForm((current) => ({
            ...current,
            produtorId: current.produtorId || fallbackId,
          }))
          setSnapshot((current) => ({
            ...current,
            form: {
              ...current.form,
              produtorId: current.form.produtorId || fallbackId,
            },
          }))
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setProducersError(
            requestError instanceof Error
              ? requestError.message
              : 'Não foi possível carregar os produtores.',
          )
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingProducers(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  function updateField<K extends keyof CreateProductInput>(
    field: K,
    value: CreateProductInput[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateRegistration(
    index: number,
    field: keyof ProductRegistration,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      registros: current.registros.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  async function handleSubmit() {
    const valorCentavos = parsePrice(priceReais) ?? 0

    const payload: CreateProductInput = {
      ...form,
      valorCentavos,
      fotosDivulgacao:
        form.fotosDivulgacao.length > 0
          ? form.fotosDivulgacao
          : form.fotosAvaliacao,
      observacoes: form.observacoes?.trim() ? form.observacoes.trim() : undefined,
      premiacoes: isEditMode ? form.premiacoes : [],
    }

    if (isEditMode && product) {
      const updated = await update.submit(product.id, payload, product.status)

      if (updated) {
        onSuccess?.()
      }
      return
    }

    if (await register.submit(payload)) {
      onSuccess?.()
    }
  }

  if (isLoadingProducers) {
    return (
      <div className="p-6">
        <Feedback title="Carregando produtores aprovados..." />
      </div>
    )
  }

  if (producersError) {
    return (
      <div className="p-6">
        <Feedback
          tone="error"
          title="Não foi possível carregar produtores"
          description={producersError}
        />
      </div>
    )
  }

  if (approvedProducers.length === 0) {
    return (
      <div className="p-6">
        <Feedback
          title="Nenhum produtor aprovado"
          description="Cadastre e aprove um produtor antes de cadastrar um produto."
        />
      </div>
    )
  }

  const price = parsePrice(priceReais)
  const selectedProducer = approvedProducers.find(
    (producer) => producer.id === form.produtorId,
  )

  const sections: FormSection[] = [
    {
      id: 'produto',
      label: 'Produto',
      description: 'Nome, produtor e descrição exibidos no catálogo.',
      status:
        form.produtorId &&
        form.nome.trim() &&
        form.descricaoBreve.trim() &&
        form.descricao.trim()
          ? form.descricao.trim().length < 40
            ? 'aviso'
            : 'ok'
          : 'incompleto',
      content: (
        <>
          <FormField
            label="Produtor"
            hint={
              selectedProducer
                ? `${selectedProducer.endereco.cidade}/${selectedProducer.endereco.estado}`
                : undefined
            }
          >
            <select
              required
              value={form.produtorId}
              onChange={(event) => updateField('produtorId', event.target.value)}
              className={formInputClassName}
            >
              {approvedProducers.map((producer) => (
                <option key={producer.id} value={producer.id}>
                  {producer.nomeEmpresa}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nome do produto">
            <input
              required
              type="text"
              value={form.nome}
              onChange={(event) => updateField('nome', event.target.value)}
              className={formInputClassName}
            />
          </FormField>
          <FormField
            label="Descrição breve"
            hint={`Aparece nos cards do catálogo · ${form.descricaoBreve.length}/${MAX_DESCRICAO_BREVE_LENGTH} caracteres`}
          >
            <input
              required
              type="text"
              maxLength={MAX_DESCRICAO_BREVE_LENGTH}
              value={form.descricaoBreve}
              onChange={(event) => updateField('descricaoBreve', event.target.value)}
              className={formInputClassName}
              placeholder="Resumo do produto em uma frase"
            />
          </FormField>
          <FormField
            label="Descrição completa"
            hint={
              form.descricao.trim().length > 0 && form.descricao.trim().length < 40
                ? 'Dica: descrições com mais detalhes (ingredientes, modo de produção) vendem melhor.'
                : `${form.descricao.length} caracteres`
            }
          >
            <textarea
              required
              rows={4}
              value={form.descricao}
              onChange={(event) => updateField('descricao', event.target.value)}
              className={formInputClassName}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Categoria">
              <select
                required
                value={form.categoria}
                onChange={(event) =>
                  updateField(
                    'categoria',
                    event.target.value as CreateProductInput['categoria'],
                  )
                }
                className={formInputClassName}
              >
                {PRODUCT_CATEGORIES.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {PRODUCT_CATEGORY_LABELS[categoria]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Unidade">
              <select
                required
                value={form.unidadeMedida}
                onChange={(event) =>
                  updateField(
                    'unidadeMedida',
                    event.target.value as CreateProductInput['unidadeMedida'],
                  )
                }
                className={formInputClassName}
              >
                {MEASUREMENT_UNITS.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </>
      ),
    },
    {
      id: 'preco',
      label: 'Preço',
      status: price !== null && price > 0 ? 'ok' : 'incompleto',
      content: (
        <>
          <FormField
            label={`Valor por ${form.unidadeMedida.toLowerCase()} (R$)`}
            hint={
              priceReais && price === null
                ? 'Use números, por exemplo 25,90.'
                : undefined
            }
          >
            <div className="flex min-h-11 items-center rounded-lg border border-slate-300 bg-white focus-within:border-primary">
              <span className="pl-3 text-sm font-semibold text-text-muted">R$</span>
              <input
                required
                type="text"
                inputMode="decimal"
                value={priceReais}
                aria-invalid={Boolean(priceReais) && price === null}
                onChange={(event) => setPriceReais(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-text outline-none"
                placeholder="25,90"
              />
            </div>
          </FormField>
          <FormField label="Observações (opcional)">
            <textarea
              rows={2}
              value={form.observacoes ?? ''}
              onChange={(event) => updateField('observacoes', event.target.value)}
              className={formInputClassName}
              placeholder="Ex.: validade, conservação, encomendas"
            />
          </FormField>
        </>
      ),
    },
    {
      id: 'registros',
      label: 'Registros',
      description: 'Selos e inspeções que garantem a procedência.',
      status: form.registros.every(
        (registro) =>
          registro.numero.trim() &&
          (registro.tipo !== 'Outro' || registro.tipoOutros?.trim()),
      )
        ? 'ok'
        : 'incompleto',
      content: (
        <>
          {form.registros.map((registro, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-border-soft p-3.5 sm:grid-cols-[10rem_1fr_auto] sm:items-end"
            >
              <FormField label="Tipo">
                <select
                  required
                  value={registro.tipo}
                  onChange={(event) =>
                    updateRegistration(index, 'tipo', event.target.value)
                  }
                  className={formInputClassName}
                >
                  {PRODUCT_REGISTRATION_TYPES.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Número">
                <input
                  required
                  type="text"
                  value={registro.numero}
                  onChange={(event) =>
                    updateRegistration(index, 'numero', event.target.value)
                  }
                  className={formInputClassName}
                />
              </FormField>
              {form.registros.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'registros',
                      form.registros.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger-soft"
                >
                  Remover
                </button>
              ) : (
                <span />
              )}
              {registro.tipo === 'Outro' ? (
                <FormField label="Descreva o tipo" className="sm:col-span-3">
                  <input
                    required
                    type="text"
                    value={registro.tipoOutros ?? ''}
                    onChange={(event) =>
                      updateRegistration(index, 'tipoOutros', event.target.value)
                    }
                    className={formInputClassName}
                  />
                </FormField>
              ) : null}
            </div>
          ))}
          {form.registros.length < MAX_REGISTRATIONS ? (
            <button
              type="button"
              onClick={() =>
                updateField('registros', [
                  ...form.registros,
                  { ...emptyRegistration },
                ])
              }
              className="self-start text-sm font-semibold text-primary-darker hover:text-primary-dark"
            >
              + Adicionar registro
            </button>
          ) : null}
        </>
      ),
    },
    {
      id: 'fotos',
      label: 'Fotos',
      description: 'Sem fotos de divulgação, as de avaliação são usadas no catálogo.',
      status:
        form.fotosAvaliacao.length === 0
          ? 'incompleto'
          : form.fotosDivulgacao.length === 0
            ? 'aviso'
            : 'ok',
      content: (
        <>
          <ImageDropzone
            label="Fotos para avaliação"
            description="Uso interno: rótulo, embalagem e o produto de perto."
            files={form.fotosAvaliacao}
            max={MAX_PRODUCT_PHOTOS}
            allowedTypes={IMAGE_CONTENT_TYPES}
            onChange={(files) => updateField('fotosAvaliacao', files)}
          />
          <ImageDropzone
            label="Fotos de divulgação"
            description="Aparecem no catálogo. A primeira é a capa."
            files={form.fotosDivulgacao}
            max={MAX_PRODUCT_PHOTOS}
            allowedTypes={IMAGE_CONTENT_TYPES}
            onChange={(files) => updateField('fotosDivulgacao', files)}
          />
        </>
      ),
    },
  ]

  return (
    <SectionedForm
      sections={sections}
      isDirty={isDirty}
      isSubmitting={isLoading}
      submitLabel={
        isEditMode
          ? 'Salvar alterações'
          : approveAfterCreate
            ? 'Cadastrar e aprovar'
            : 'Enviar cadastro'
      }
      submittingLabel={isEditMode ? 'Salvando...' : 'Enviando cadastro...'}
      error={error}
      onSubmit={() => void handleSubmit()}
      onCancel={onCancel}
    />
  )
}
