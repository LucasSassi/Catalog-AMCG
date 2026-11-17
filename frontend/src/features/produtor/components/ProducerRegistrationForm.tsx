import { useEffect, useMemo, useState } from 'react'
import {
  FormField,
  formInputClassName,
  SectionedForm,
  type FormSection,
} from '../../../shared/components/SectionedForm'
import {
  BRAZILIAN_STATES,
  DOCUMENT_TYPES,
  IMAGE_CONTENT_TYPES,
  MAX_CEP_DIGITS,
  MAX_HISTORIA_LENGTH,
  MAX_PRODUCER_PHOTOS,
  REGISTRATION_TYPES,
} from '../constants'
import { useRegisterProducer } from '../hooks/useRegisterProducer'
import { useUpdateProducer } from '../hooks/useUpdateProducer'
import type {
  CreateProducerInput,
  Producer,
  ProducerFile,
  ProducerRegistration,
} from '../types'
import { ImageDropzone } from './ImageDropzone'

interface ProducerRegistrationFormProps {
  onSuccess: () => void
  onCancel?: () => void
  onDirtyChange?: (dirty: boolean) => void
  approveAfterCreate?: boolean
  producer?: Producer
}

interface ProducerFormState extends Omit<
  CreateProducerInput,
  'logo' | 'redesSociais'
> {
  logo: ProducerFile[]
  instagram: string
  facebook: string
}

const emptyRegistration: ProducerRegistration = {
  tipo: 'SIM',
  numero: '',
}

function getSocialHandle(
  producer: Producer | undefined,
  tipo: 'INSTAGRAM' | 'FACEBOOK',
): string {
  return producer?.redesSociais.find((item) => item.tipo === tipo)?.handle ?? ''
}

function buildInitialForm(producer?: Producer): ProducerFormState {
  if (!producer) {
    return {
      nomeEmpresa: '',
      municipioId: '',
      documento: { tipo: 'CNPJ', numero: '' },
      registros: [{ ...emptyRegistration }],
      contato: { telefone: '', email: '' },
      endereco: { cep: '', rua: '', bairro: '', cidade: '', estado: 'PR' },
      exibirEndereco: false,
      historia: '',
      logo: [],
      fotos: [],
      site: '',
      instagram: '',
      facebook: '',
    }
  }

  return {
    nomeEmpresa: producer.nomeEmpresa,
    municipioId: producer.municipioId,
    documento: {
      ...producer.documento,
      numero:
        producer.documento.tipo === 'CAD_PRO'
          ? producer.documento.numero.replace(/^CAD-/i, '')
          : producer.documento.numero,
    },
    registros:
      producer.registros.length > 0
        ? producer.registros.map((registro) => ({ ...registro }))
        : [{ ...emptyRegistration }],
    contato: { ...producer.contato },
    endereco: { ...producer.endereco },
    exibirEndereco: producer.exibirEndereco,
    historia: producer.historia,
    logo: producer.logo?.url ? [{ ...producer.logo }] : [],
    fotos: (producer.fotos ?? [])
      .filter((foto) => foto.url)
      .map((foto) => ({ ...foto })),
    site: producer.site ?? '',
    instagram: getSocialHandle(producer, 'INSTAGRAM'),
    facebook: getSocialHandle(producer, 'FACEBOOK'),
  }
}

function filled(...values: string[]): boolean {
  return values.every((value) => value.trim().length > 0)
}

export function ProducerRegistrationForm({
  onSuccess,
  onCancel,
  onDirtyChange,
  approveAfterCreate = false,
  producer,
}: ProducerRegistrationFormProps) {
  const isEditMode = producer !== undefined
  const [initial] = useState(() => buildInitialForm(producer))
  const [form, setForm] = useState<ProducerFormState>(initial)
  const register = useRegisterProducer({ approveAfterCreate })
  const update = useUpdateProducer()
  const error = isEditMode ? update.error : register.error
  const isLoading = isEditMode ? update.isLoading : register.isLoading
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial],
  )

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  function updateField<K extends keyof ProducerFormState>(
    field: K,
    value: ProducerFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateRegistration(
    index: number,
    changes: Partial<ProducerRegistration>,
  ) {
    setForm((current) => ({
      ...current,
      registros: current.registros.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }
        const next = { ...item, ...changes }
        if (next.tipo !== 'Outro') {
          delete next.tipoOutros
        }
        return next
      }),
    }))
  }

  async function handleSubmit() {
    const logo = form.logo[0]

    if (!logo) {
      return
    }

    const redesSociais = [
      ...(form.instagram.trim()
        ? [{ tipo: 'INSTAGRAM' as const, handle: form.instagram.trim() }]
        : []),
      ...(form.facebook.trim()
        ? [{ tipo: 'FACEBOOK' as const, handle: form.facebook.trim() }]
        : []),
    ]

    const payload: CreateProducerInput = {
      nomeEmpresa: form.nomeEmpresa,
      municipioId: form.municipioId,
      documento: form.documento,
      registros: form.registros,
      contato: form.contato,
      endereco: form.endereco,
      exibirEndereco: form.exibirEndereco,
      historia: form.historia,
      logo,
      fotos: form.fotos,
      redesSociais,
      site: form.site?.trim() || undefined,
    }

    if (isEditMode && producer) {
      const updated = await update.submit(
        producer.id,
        payload,
        producer.revisao ?? 0,
      )

      if (updated) {
        onSuccess()
      }
      return
    }

    if (await register.submit(payload)) {
      onSuccess()
    }
  }

  const sections: FormSection[] = [
    {
      id: 'empresa',
      label: 'Empresa',
      description: 'Como o produtor aparece no catálogo.',
      status: filled(form.nomeEmpresa, form.municipioId, form.historia)
        ? 'ok'
        : 'incompleto',
      content: (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome da empresa">
              <input
                required
                type="text"
                value={form.nomeEmpresa}
                onChange={(event) =>
                  updateField('nomeEmpresa', event.target.value)
                }
                className={formInputClassName}
              />
            </FormField>
            <FormField label="Município (AMCG)">
              <input
                required
                type="text"
                value={form.municipioId}
                onChange={(event) =>
                  updateField('municipioId', event.target.value)
                }
                className={formInputClassName}
                placeholder="Ex.: Ponta Grossa"
              />
            </FormField>
          </div>
          <FormField
            label="História do produtor"
            hint={`${form.historia.length}/${MAX_HISTORIA_LENGTH} caracteres`}
          >
            <textarea
              required
              value={form.historia}
              maxLength={MAX_HISTORIA_LENGTH}
              rows={5}
              onChange={(event) => updateField('historia', event.target.value)}
              className={formInputClassName}
              placeholder="Conte a história e a identidade produtiva do produtor"
            />
          </FormField>
        </>
      ),
    },
    {
      id: 'documentos',
      label: 'Documentos',
      description: 'Documento do empreendimento e registro sanitário.',
      status: filled(
        form.documento.numero,
        ...form.registros.map((registro) => registro.numero),
        ...form.registros
          .filter((registro) => registro.tipo === 'Outro')
          .map((registro) => registro.tipoOutros ?? ''),
      )
        ? 'ok'
        : 'incompleto',
      content: (
        <>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <FormField label="Tipo">
              <select
                required
                value={form.documento.tipo}
                onChange={(event) =>
                  updateField('documento', {
                    ...form.documento,
                    tipo: event.target
                      .value as CreateProducerInput['documento']['tipo'],
                  })
                }
                className={formInputClassName}
              >
                {DOCUMENT_TYPES.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Número do documento">
              <div className="flex">
                {form.documento.tipo === 'CAD_PRO' && (
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center rounded-l-md border border-r-0 bg-slate-100 px-3 text-sm font-semibold text-slate-700"
                  >
                    CAD-
                  </span>
                )}
                <input
                  required
                  type="text"
                  value={form.documento.numero}
                  onChange={(event) =>
                    updateField('documento', {
                      ...form.documento,
                      numero:
                        form.documento.tipo === 'CAD_PRO'
                          ? event.target.value.replace(/^CAD-/i, '')
                          : event.target.value,
                    })
                  }
                  className={`${formInputClassName} min-w-0 flex-1 ${form.documento.tipo === 'CAD_PRO' ? 'rounded-l-none' : ''}`}
                />
              </div>
            </FormField>
          </div>
          {form.registros.map((registro, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-2 sm:flex-nowrap"
            >
              <FormField
                label={`Tipo de registro ${form.registros.length > 1 ? index + 1 : ''}`.trim()}
                className="w-full sm:w-52 sm:shrink-0"
              >
                <select
                  required
                  value={registro.tipo}
                  onChange={(event) =>
                    updateRegistration(index, {
                      tipo: event.target.value as ProducerRegistration['tipo'],
                    })
                  }
                  className={formInputClassName}
                >
                  {REGISTRATION_TYPES.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </FormField>
              {registro.tipo === 'Outro' ? (
                <FormField label="Qual registro?" className="flex-1">
                  <input
                    required
                    type="text"
                    value={registro.tipoOutros ?? ''}
                    onChange={(event) =>
                      updateRegistration(index, {
                        tipoOutros: event.target.value,
                      })
                    }
                    className={formInputClassName}
                    placeholder="Ex.: SESA-PR"
                  />
                </FormField>
              ) : null}
              <FormField label="Número do registro" className="flex-1">
                <input
                  required
                  type="text"
                  value={registro.numero}
                  onChange={(event) =>
                    updateRegistration(index, { numero: event.target.value })
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
                      form.registros.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                  className="mb-5 min-h-11 rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger-soft"
                >
                  Remover
                </button>
              ) : null}
            </div>
          ))}
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
        </>
      ),
    },
    {
      id: 'contato',
      label: 'Contato',
      description: 'O WhatsApp recebe os pedidos do catálogo.',
      status: filled(form.contato.telefone, form.contato.email)
        ? 'ok'
        : 'incompleto',
      content: (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="WhatsApp"
              hint="Formato internacional: +5542999999999"
            >
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
                className={formInputClassName}
                placeholder="+5542999999999"
              />
            </FormField>
            <FormField label="E-mail">
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
                className={formInputClassName}
              />
            </FormField>
            <FormField label="Instagram (opcional)">
              <input
                type="text"
                value={form.instagram}
                onChange={(event) =>
                  updateField('instagram', event.target.value)
                }
                className={formInputClassName}
                placeholder="@produtor"
              />
            </FormField>
            <FormField label="Facebook (opcional)">
              <input
                type="text"
                value={form.facebook}
                onChange={(event) =>
                  updateField('facebook', event.target.value)
                }
                className={formInputClassName}
                placeholder="produtor.oficial"
              />
            </FormField>
          </div>
          <FormField label="Site (opcional)">
            <input
              type="url"
              value={form.site ?? ''}
              onChange={(event) => updateField('site', event.target.value)}
              className={formInputClassName}
              placeholder="https://..."
            />
          </FormField>
        </>
      ),
    },
    {
      id: 'endereco',
      label: 'Endereço',
      description: 'O produtor escolhe se o endereço aparece no site.',
      status:
        filled(form.endereco.rua, form.endereco.bairro, form.endereco.cidade) &&
        form.endereco.cep.replace(/\D/g, '').length === MAX_CEP_DIGITS
          ? 'ok'
          : 'incompleto',
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="CEP" hint="8 dígitos">
            <input
              required
              type="text"
              inputMode="numeric"
              pattern="\d{5}-?\d{3}"
              title="CEP com 8 dígitos (ex.: 84010-000)"
              value={form.endereco.cep}
              onChange={(event) =>
                updateField('endereco', {
                  ...form.endereco,
                  cep: event.target.value,
                })
              }
              className={formInputClassName}
              placeholder="84010-000"
            />
          </FormField>
          <FormField label="Exibir endereço no site?">
            <select
              required
              value={form.exibirEndereco ? 'Sim' : 'Não'}
              onChange={(event) =>
                updateField('exibirEndereco', event.target.value === 'Sim')
              }
              className={formInputClassName}
            >
              <option value="Sim">Sim, mostrar na página do produtor</option>
              <option value="Não">Não, mostrar só o município</option>
            </select>
          </FormField>
          <FormField label="Rua e número" className="sm:col-span-2">
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
              className={formInputClassName}
            />
          </FormField>
          <FormField label="Bairro">
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
              className={formInputClassName}
            />
          </FormField>
          <div className="grid grid-cols-[1fr_6rem] gap-4">
            <FormField label="Cidade">
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
                className={formInputClassName}
              />
            </FormField>
            <FormField label="UF">
              <select
                required
                value={form.endereco.estado}
                onChange={(event) =>
                  updateField('endereco', {
                    ...form.endereco,
                    estado: event.target.value,
                  })
                }
                className={formInputClassName}
              >
                {BRAZILIAN_STATES.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      ),
    },
    {
      id: 'imagens',
      label: 'Logo e fotos',
      description:
        'A logo é obrigatória; fotos ajudam na análise e na vitrine.',
      status:
        form.logo.length === 0 || form.fotos.length === 0
          ? 'incompleto'
          : form.fotos.length < 2
            ? 'aviso'
            : 'ok',
      content: (
        <>
          <ImageDropzone
            label="Logo"
            files={form.logo}
            max={1}
            allowedTypes={IMAGE_CONTENT_TYPES}
            onChange={(files) => updateField('logo', files)}
          />
          <ImageDropzone
            label="Fotos do produtor"
            description="Recomendado: ao menos 2 fotos do local ou da produção."
            files={form.fotos}
            max={MAX_PRODUCER_PHOTOS}
            allowedTypes={IMAGE_CONTENT_TYPES}
            onChange={(files) => updateField('fotos', files)}
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
