import type { ProducerDocument } from '../types'

export function parseDocumentNumber(value: string): ProducerDocument {
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, '')

  if (digits.length === 11) {
    return { tipo: 'CPF', numero: digits }
  }

  if (digits.length === 14) {
    return { tipo: 'CNPJ', numero: digits }
  }

  return { tipo: 'CAD_PRO', numero: trimmed }
}
