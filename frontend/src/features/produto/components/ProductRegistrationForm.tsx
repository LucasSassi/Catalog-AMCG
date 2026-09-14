import { useEffect, useState, type FormEvent } from 'react'
import { listProducers } from '../../produtor/api/producers'
import type { Producer } from '../../produtor/types'
import { Button } from '../../../shared/components/Button'
import { Feedback } from '../../../shared/components/Feedback'
import {
  IMAGE_CONTENT_TYPES,
  MEASUREMENT_UNITS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_REGISTRATION_TYPES,
} from '../constants'
import { useRegisterProduct } from '../hooks/useRegisterProduct'
import type {
  CreateProductInput,
  ProductFile,
  ProductRegistration,
} from '../types'

interface ProductRegistrationFormProps {
  onSuccess?: () => void
  approveAfterCreate?: boolean
}

const emptyRegistration: ProductRegistration = {
  tipo: 'SELO ARTE',
  numero: '',
}

const emptyPhoto: ProductFile = {
  url: '',
  contentType: 'image/jpeg',
  nomeOriginal: '',
}

const inputClassName =
  'min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600'

export function ProductRegistrationForm({
  onSuccess,
  approveAfterCreate = true,
}: ProductRegistrationFormProps) {
  const [approvedProducers, setApprovedProducers] = useState<Producer[]>([])
  const [isLoadingProducers, setIsLoadingProducers] = useState(true)
  const [producersError, setProducersError] = useState('')
  const [priceReais, setPriceReais] = useState('')
  const [form, setForm] = useState<CreateProductInput>({
    produtorId: '',
    nome: '',
    descricao: '',
    categoria: 'MEL',
    unidadeMedida: 'KG',
    registros: [{ ...emptyRegistration }],
    fotosAvaliacao: [{ ...emptyPhoto }],
    fotosDivulgacao: [],
    premiacoes: [],
    valorCentavos: 0,
    observacoes: '',
  })

  const { submit, error, isLoading } = useRegisterProduct({
    approveAfterCreate,
  })

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
          setForm((current) => ({
            ...current,
            produtorId: current.produtorId || producers[0].id,
          }))
        }
      })
      .catch((requestError) => {
        if (!isCurrent) {
          return
        }

        if (requestError instanceof Error) {
          setProducersError(requestError.message)
        } else {
          setProducersError('Não foi possível carregar os produtores.')
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

  function updateRegistration(
    index: number,
    field: keyof ProductRegistration,
    value: string,
  ) {
    setForm((current) => {
      const registros = current.registros.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }

        return { ...item, [field]: value }
      })

      return { ...current, registros }
    })
  }

  function updatePhoto(
    index: number,
    field: keyof ProductFile,
    value: string,
  ) {
    setForm((current) => {
      const fotosAvaliacao = current.fotosAvaliacao.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }

        return { ...item, [field]: value }
      })

      return { ...current, fotosAvaliacao }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const reais = Number(priceReais.replace(',', '.'))
    let valorCentavos = 0

    if (!Number.isNaN(reais) && reais >= 0) {
      valorCentavos = Math.round(reais * 100)
    }

    const payload: CreateProductInput = {
      ...form,
      valorCentavos,
      fotosDivulgacao: form.fotosAvaliacao,
      observacoes: form.observacoes?.trim()
        ? form.observacoes.trim()
        : undefined,
      premiacoes: [],
    }

    const didSubmit = await submit(payload)

    if (didSubmit) {
      onSuccess?.()
    }
  }

  if (isLoadingProducers) {
    return <Feedback title="Carregando produtores aprovados..." />
  }

  if (producersError) {
    return (
      <Feedback
        tone="error"
        title="Não foi possível carregar produtores"
        description={producersError}
      />
    )
  }

  if (approvedProducers.length === 0) {
    return (
      <Feedback
        title="Nenhum produtor aprovado"
        description="Cadastre e aprove um produtor antes de cadastrar um produto."
      />
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Produtor
        </legend>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Produtor aprovado
          </span>
          <select
            required
            value={form.produtorId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                produtorId: event.target.value,
              }))
            }
            className={inputClassName}
          >
            {approvedProducers.map((producer) => (
              <option key={producer.id} value={producer.id}>
                {producer.nomeEmpresa} — {producer.endereco.cidade}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Dados do produto
        </legend>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Nome
          </span>
          <input
            required
            type="text"
            value={form.nome}
            onChange={(event) =>
              setForm((current) => ({ ...current, nome: event.target.value }))
            }
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Descrição
          </span>
          <textarea
            required
            rows={3}
            value={form.descricao}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                descricao: event.target.value,
              }))
            }
            className={`${inputClassName} min-h-24`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Categoria
            </span>
            <select
              required
              value={form.categoria}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  categoria: event.target
                    .value as CreateProductInput['categoria'],
                }))
              }
              className={inputClassName}
            >
              {PRODUCT_CATEGORIES.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {PRODUCT_CATEGORY_LABELS[categoria]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Unidade
            </span>
            <select
              required
              value={form.unidadeMedida}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  unidadeMedida: event.target
                    .value as CreateProductInput['unidadeMedida'],
                }))
              }
              className={inputClassName}
            >
              {MEASUREMENT_UNITS.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {unidade}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Valor (R$)
          </span>
          <input
            required
            type="text"
            inputMode="decimal"
            value={priceReais}
            onChange={(event) => setPriceReais(event.target.value)}
            className={inputClassName}
            placeholder="Ex.: 25,90"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Observações (opcional)
          </span>
          <textarea
            rows={2}
            value={form.observacoes ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                observacoes: event.target.value,
              }))
            }
            className={`${inputClassName} min-h-20`}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Registros
        </legend>

        {form.registros.map((registro, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">
                Registro {index + 1}
              </p>
              {form.registros.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      registros: current.registros.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    }))
                  }
                >
                  Remover
                </Button>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Tipo
              </span>
              <select
                required
                value={registro.tipo}
                onChange={(event) =>
                  updateRegistration(index, 'tipo', event.target.value)
                }
                className={inputClassName}
              >
                {PRODUCT_REGISTRATION_TYPES.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>

            {registro.tipo === 'Outro' ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Descreva o tipo
                </span>
                <input
                  required
                  type="text"
                  value={registro.tipoOutros ?? ''}
                  onChange={(event) =>
                    updateRegistration(index, 'tipoOutros', event.target.value)
                  }
                  className={inputClassName}
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Número
              </span>
              <input
                required
                type="text"
                value={registro.numero}
                onChange={(event) =>
                  updateRegistration(index, 'numero', event.target.value)
                }
                className={inputClassName}
              />
            </label>
          </div>
        ))}

        {form.registros.length < 5 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setForm((current) => ({
                ...current,
                registros: [...current.registros, { ...emptyRegistration }],
              }))
            }
          >
            Adicionar registro
          </Button>
        ) : null}
      </fieldset>

      <PhotoFields
        title="Fotos"
        photos={form.fotosAvaliacao}
        onChange={updatePhoto}
        onAdd={() =>
          setForm((current) => ({
            ...current,
            fotosAvaliacao: [...current.fotosAvaliacao, { ...emptyPhoto }],
          }))
        }
        onRemove={(index) =>
          setForm((current) => ({
            ...current,
            fotosAvaliacao: current.fotosAvaliacao.filter(
              (_, itemIndex) => itemIndex !== index,
            ),
          }))
        }
      />

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Enviando cadastro...' : 'Enviar cadastro'}
      </Button>
    </form>
  )
}

function PhotoFields({
  title,
  photos,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string
  photos: ProductFile[]
  onChange: (
    index: number,
    field: keyof ProductFile,
    value: string,
  ) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
        {title}
      </legend>

      {photos.map((photo, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-slate-200 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">
              Foto {index + 1}
            </p>
            {photos.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onRemove(index)}
              >
                Remover
              </Button>
            ) : null}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              URL
            </span>
            <input
              required
              type="url"
              value={photo.url}
              onChange={(event) =>
                onChange(index, 'url', event.target.value)
              }
              className={inputClassName}
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Content-Type
            </span>
            <select
              required
              value={photo.contentType}
              onChange={(event) =>
                onChange(index, 'contentType', event.target.value)
              }
              className={inputClassName}
            >
              {IMAGE_CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome original
            </span>
            <input
              required
              type="text"
              value={photo.nomeOriginal}
              onChange={(event) =>
                onChange(index, 'nomeOriginal', event.target.value)
              }
              className={inputClassName}
              placeholder="foto.jpg"
            />
          </label>
        </div>
      ))}

      {photos.length < 5 ? (
        <Button type="button" variant="secondary" onClick={onAdd}>
          Adicionar foto
        </Button>
      ) : null}
    </fieldset>
  )
}
