import type {
  ReviewAlert,
  ReviewChecklistItem,
} from '../../../shared/lib/review-status'
import type { Producer } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000
const EXPIRING_SOON_DAYS = 60
const MIN_PHOTOS = 2
const MIN_HISTORIA_LENGTH = 40

function formatMonthYear(value: string): string {
  const date = new Date(value)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${month}/${date.getUTCFullYear()}`
}

function registroValidity(producer: Producer, now: number) {
  const dated = producer.registros
    .map((registro) => ({
      registro,
      validade: registro.dataValidade
        ? new Date(registro.dataValidade).getTime()
        : Number.NaN,
    }))
    .filter((item) => !Number.isNaN(item.validade))

  const expired = dated.find((item) => item.validade < now)
  const expiringSoon = dated.find(
    (item) =>
      item.validade >= now && item.validade - now <= EXPIRING_SOON_DAYS * DAY_MS,
  )

  return { expired, expiringSoon }
}

/** Sinais que pedem atenção antes de aprovar (exibidos na lista e no perfil). */
export function getProducerAlerts(
  producer: Producer,
  now = Date.now(),
): ReviewAlert[] {
  const alerts: ReviewAlert[] = []
  const { expired, expiringSoon } = registroValidity(producer, now)
  const fotos = producer.fotos ?? []

  if (expired?.registro.dataValidade) {
    alerts.push({
      id: 'registro-vencido',
      label: `Registro ${expired.registro.tipo} vencido em ${formatMonthYear(expired.registro.dataValidade)}`,
      tone: 'danger',
    })
  } else if (expiringSoon?.registro.dataValidade) {
    alerts.push({
      id: 'registro-vencendo',
      label: `Registro ${expiringSoon.registro.tipo} vence em ${formatMonthYear(expiringSoon.registro.dataValidade)}`,
      tone: 'warning',
    })
  }

  if (!producer.logo) {
    alerts.push({ id: 'sem-logo', label: 'Sem logo', tone: 'warning' })
  }

  if (fotos.length < MIN_PHOTOS) {
    alerts.push({
      id: 'poucas-fotos',
      label: fotos.length === 0 ? 'Sem fotos' : `Só ${fotos.length} foto`,
      tone: 'warning',
    })
  }

  return alerts
}

/** Conferência guiada exibida na revisão rápida e no perfil. */
export function getProducerChecklist(
  producer: Producer,
  now = Date.now(),
): ReviewChecklistItem[] {
  const { expired } = registroValidity(producer, now)
  const fotos = producer.fotos ?? []
  const registro = producer.registros[0]

  return [
    {
      id: 'documento',
      label: 'Documento informado',
      ok: Boolean(producer.documento.numero.trim()),
      detail: `${producer.documento.tipo} ${producer.documento.numero}`.trim(),
    },
    {
      id: 'registro',
      label: 'Registro sanitário válido',
      ok: Boolean(registro) && !expired,
      detail: registro
        ? expired
          ? 'Vencido'
          : `${registro.tipo} ${registro.numero}`
        : 'Não informado',
    },
    {
      id: 'logo',
      label: 'Logo enviada',
      ok: Boolean(producer.logo),
    },
    {
      id: 'fotos',
      label: `Ao menos ${MIN_PHOTOS} fotos`,
      ok: fotos.length >= MIN_PHOTOS,
      detail: `${fotos.length} enviada${fotos.length === 1 ? '' : 's'}`,
    },
    {
      id: 'contato',
      label: 'WhatsApp e e-mail',
      ok: Boolean(
        producer.contato.telefone.trim() && producer.contato.email.trim(),
      ),
    },
    {
      id: 'historia',
      label: 'História preenchida',
      ok: producer.historia.trim().length >= MIN_HISTORIA_LENGTH,
    },
  ]
}
