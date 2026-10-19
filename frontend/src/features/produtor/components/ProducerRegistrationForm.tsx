import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/Button'
import {
  BRAZILIAN_STATES,
  DOCUMENT_TYPES,
  IMAGE_CONTENT_TYPES,
  MAX_HISTORIA_LENGTH,
  MAX_PRODUCER_PHOTOS,
} from '../constants'
import { useRegisterProducer } from '../hooks/useRegisterProducer'
import { useUpdateProducer } from '../hooks/useUpdateProducer'
import type {
  CreateProducerInput,
  Producer,
  ProducerFile,
  ProducerRegistration,
} from '../types'

interface ProducerRegistrationFormProps {
  onSuccess: () => void
  approveAfterCreate?: boolean
  producer?: Producer
}

const emptyRegistration: ProducerRegistration = {
  tipo: 'SIM',
  numero: '',
}

const emptyPhoto: ProducerFile = {
  url: '',
  contentType: 'image/jpeg',
  nomeOriginal: '',
}

const initialForm: CreateProducerInput = {
  nomeEmpresa: '',
  municipioId: '',
  documento: { tipo: 'CNPJ', numero: '' },
  registros: [{ ...emptyRegistration }],
  contato: { telefone: '', email: '' },
  endereco: { rua: '', bairro: '', cidade: '', estado: 'PR' },
  historia: '',
  logo: { ...emptyPhoto },
  fotos: [{ ...emptyPhoto }],
  site: '',
}

function buildInitialForm(producer?: Producer): CreateProducerInput {
  if (!producer) {
    return {
      ...initialForm,
      documento: { ...initialForm.documento },
      registros: [{ ...emptyRegistration }],
      contato: { ...initialForm.contato },
      endereco: { ...initialForm.endereco },
      logo: { ...emptyPhoto },
      fotos: [{ ...emptyPhoto }],
    }
  }

  return {
    nomeEmpresa: producer.nomeEmpresa,
    municipioId: producer.municipioId,
    documento: { ...producer.documento },
    registros:
      producer.registros.length > 0
        ? producer.registros.map((registro) => ({ ...registro }))
        : [{ ...emptyRegistration }],
    contato: { ...producer.contato },
    endereco: { ...producer.endereco },
    historia: producer.historia,
    logo: producer.logo ? { ...producer.logo } : { ...emptyPhoto },
    fotos:
      producer.fotos.length > 0
        ? producer.fotos.map((foto) => ({ ...foto }))
        : [{ ...emptyPhoto }],
    site: producer.site ?? '',
  }
}

function getSocialHandle(
  producer: Producer | undefined,
  tipo: 'INSTAGRAM' | 'FACEBOOK',
): string {
  if (!producer) {
    return ''
  }

  const network = producer.redesSociais.find((item) => item.tipo === tipo)
  if (!network) {
    return ''
  }

  return network.handle
}

const inputClassName =
  'min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary'

export function ProducerRegistrationForm({
  onSuccess,
  approveAfterCreate = false,
  producer,
}: ProducerRegistrationFormProps) {
  const isEditMode = producer !== undefined
  const [form, setForm] = useState<CreateProducerInput>(() =>
    buildInitialForm(producer),
  )
  const [instagram, setInstagram] = useState(() =>
    getSocialHandle(producer, 'INSTAGRAM'),
  )
  const [facebook, setFacebook] = useState(() =>
    getSocialHandle(producer, 'FACEBOOK'),
  )
  const register = useRegisterProducer({
    approveAfterCreate,
  })
  const update = useUpdateProducer()
  const error = isEditMode ? update.error : register.error
  const isLoading = isEditMode ? update.isLoading : register.isLoading

  function updateField<K extends keyof CreateProducerInput>(
    field: K,
    value: CreateProducerInput[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateRegistration(
    index: number,
    field: keyof ProducerRegistration,
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

  function addRegistration() {
    setForm((current) => ({
      ...current,
      registros: [...current.registros, { ...emptyRegistration }],
    }))
  }

  function removeRegistration(index: number) {
    setForm((current) => {
      if (current.registros.length === 1) {
        return current
      }

      return {
        ...current,
        registros: current.registros.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      }
    })
  }

  function updatePhoto(
    index: number,
    field: keyof ProducerFile,
    value: string,
  ) {
    setForm((current) => {
      const fotos = current.fotos.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }

        return { ...item, [field]: value }
      })

      return { ...current, fotos }
    })
  }

  function addPhoto() {
    setForm((current) => {
      if (current.fotos.length >= MAX_PRODUCER_PHOTOS) {
        return current
      }

      return {
        ...current,
        fotos: [...current.fotos, { ...emptyPhoto }],
      }
    })
  }

  function removePhoto(index: number) {
    setForm((current) => {
      if (current.fotos.length === 1) {
        return current
      }

      return {
        ...current,
        fotos: current.fotos.filter((_, itemIndex) => itemIndex !== index),
      }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const redesSociais = [
      ...(instagram.trim()
        ? [{ tipo: 'INSTAGRAM' as const, handle: instagram.trim() }]
        : []),
      ...(facebook.trim()
        ? [{ tipo: 'FACEBOOK' as const, handle: facebook.trim() }]
        : []),
    ]

    const payload: CreateProducerInput = {
      ...form,
      redesSociais,
      site: form.site?.trim() || undefined,
    }

    if (isEditMode && producer) {
      const updated = await update.submit(
        producer.id,
        payload,
        producer.status,
      )
      if (updated) {
        onSuccess()
      }
      return
    }

    const didSubmit = await register.submit(payload)

    if (didSubmit) {
      onSuccess()
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
          Empresa
        </legend>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Nome da empresa
          </span>
          <input
            required
            type="text"
            value={form.nomeEmpresa}
            onChange={(event) => updateField('nomeEmpresa', event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Município (AMCG)
          </span>
          <input
            required
            type="text"
            value={form.municipioId}
            onChange={(event) => updateField('municipioId', event.target.value)}
            className={inputClassName}
            placeholder="Ex.: Ponta Grossa"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            História do produtor
          </span>
          <textarea
            required
            value={form.historia}
            maxLength={MAX_HISTORIA_LENGTH}
            rows={5}
            onChange={(event) => updateField('historia', event.target.value)}
            className={inputClassName}
            placeholder="Conte a história e a identidade produtiva do produtor"
          />
          <span className="mt-1 block text-xs text-slate-500">
            {form.historia.length}/{MAX_HISTORIA_LENGTH}
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
          Documento
        </legend>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo
          </span>
          <select
            required
            value={form.documento.tipo}
            onChange={(event) =>
              updateField('documento', {
                ...form.documento,
                tipo: event.target.value as CreateProducerInput['documento']['tipo'],
              })
            }
            className={inputClassName}
          >
            {DOCUMENT_TYPES.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Número
          </span>
          <input
            required
            type="text"
            value={form.documento.numero}
            onChange={(event) =>
              updateField('documento', {
                ...form.documento,
                numero: event.target.value,
              })
            }
            className={inputClassName}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
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
                  onClick={() => removeRegistration(index)}
                >
                  Remover
                </Button>
              ) : null}
            </div>

            <p className="rounded-lg border border-surface bg-secondary-background px-3 py-2 text-sm font-medium text-primary-dark">
              Tipo: Registro SIM (Inspeção Municipal)
            </p>

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

        <Button type="button" variant="secondary" onClick={addRegistration}>
          Adicionar registro
        </Button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
          Contato
        </legend>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Telefone (E.164)
          </span>
          <input
            required
            type="tel"
            value={form.contato.telefone}
            onChange={(event) =>
              updateField('contato', {
                ...form.contato,
                telefone: event.target.value,
              })
            }
            className={inputClassName}
            placeholder="+5542999999999"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            E-mail
          </span>
          <input
            required
            type="email"
            value={form.contato.email}
            onChange={(event) =>
              updateField('contato', {
                ...form.contato,
                email: event.target.value,
              })
            }
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Instagram
          </span>
          <input
            type="text"
            value={instagram}
            onChange={(event) => setInstagram(event.target.value)}
            className={inputClassName}
            placeholder="@produtor"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Facebook
          </span>
          <input
            type="text"
            value={facebook}
            onChange={(event) => setFacebook(event.target.value)}
            className={inputClassName}
            placeholder="produtor.oficial"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Site
          </span>
          <input
            type="url"
            value={form.site ?? ''}
            onChange={(event) => updateField('site', event.target.value)}
            className={inputClassName}
            placeholder="https://..."
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
          Endereço
        </legend>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Rua
          </span>
          <input
            required
            type="text"
            value={form.endereco.rua}
            onChange={(event) =>
              updateField('endereco', {
                ...form.endereco,
                rua: event.target.value,
              })
            }
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Bairro
          </span>
          <input
            required
            type="text"
            value={form.endereco.bairro}
            onChange={(event) =>
              updateField('endereco', {
                ...form.endereco,
                bairro: event.target.value,
              })
            }
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Cidade
          </span>
          <input
            required
            type="text"
            value={form.endereco.cidade}
            onChange={(event) =>
              updateField('endereco', {
                ...form.endereco,
                cidade: event.target.value,
              })
            }
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Estado
          </span>
          <select
            required
            value={form.endereco.estado}
            onChange={(event) =>
              updateField('endereco', {
                ...form.endereco,
                estado: event.target.value,
              })
            }
            className={inputClassName}
          >
            {BRAZILIAN_STATES.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
          Logo
        </legend>

        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              URL
            </span>
            <input
              required
              type="url"
              value={form.logo.url}
              onChange={(event) =>
                updateField('logo', { ...form.logo, url: event.target.value })
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
              value={form.logo.contentType}
              onChange={(event) =>
                updateField('logo', {
                  ...form.logo,
                  contentType: event.target.value,
                })
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
              value={form.logo.nomeOriginal}
              onChange={(event) =>
                updateField('logo', {
                  ...form.logo,
                  nomeOriginal: event.target.value,
                })
              }
              className={inputClassName}
              placeholder="logo-produtor.jpg"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-primary-darker">
          Fotos do produtor
        </legend>

        {form.fotos.map((photo, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">
                Foto {index + 1}
              </p>
              {form.fotos.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removePhoto(index)}
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
                  updatePhoto(index, 'url', event.target.value)
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
                  updatePhoto(index, 'contentType', event.target.value)
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
                  updatePhoto(index, 'nomeOriginal', event.target.value)
                }
                className={inputClassName}
                placeholder="foto-produtor.jpg"
              />
            </label>
          </div>
        ))}

        {form.fotos.length < MAX_PRODUCER_PHOTOS ? (
          <Button type="button" variant="secondary" onClick={addPhoto}>
            Adicionar foto
          </Button>
        ) : null}
      </fieldset>

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading
          ? isEditMode
            ? 'Salvando...'
            : 'Enviando cadastro...'
          : isEditMode
            ? 'Salvar alterações'
            : 'Enviar cadastro'}
      </Button>
    </form>
  )
}
