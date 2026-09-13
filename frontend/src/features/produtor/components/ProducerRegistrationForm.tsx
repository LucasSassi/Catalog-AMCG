import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/Button'
import {
  BRAZILIAN_STATES,
  DOCUMENT_TYPES,
  REGISTRATION_TYPES,
} from '../constants'
import { useRegisterProducer } from '../hooks/useRegisterProducer'
import type { CreateProducerInput, ProducerRegistration } from '../types'

interface ProducerRegistrationFormProps {
  onSuccess: () => void
}

const emptyRegistration: ProducerRegistration = {
  tipo: 'SIM',
  numero: '',
}

const initialForm: CreateProducerInput = {
  nomeEmpresa: '',
  municipioId: '',
  documento: { tipo: 'CNPJ', numero: '' },
  registros: [{ ...emptyRegistration }],
  contato: { telefone: '', email: '' },
  endereco: { rua: '', bairro: '', cidade: '', estado: 'PR' },
}

const inputClassName =
  'min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600'

export function ProducerRegistrationForm({
  onSuccess,
}: ProducerRegistrationFormProps) {
  const [form, setForm] = useState<CreateProducerInput>(initialForm)
  const { submit, error, isLoading } = useRegisterProducer()

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const didSubmit = await submit(form)

    if (didSubmit) {
      onSuccess()
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
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
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
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
                  onClick={() => removeRegistration(index)}
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
                {REGISTRATION_TYPES.map((tipo) => (
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

        <Button type="button" variant="secondary" onClick={addRegistration}>
          Adicionar registro
        </Button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
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
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-brand-700">
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
