export function maskPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length === 0) {
    return ''
  }

  if (digits.length <= 2) {
    return `(${digits}`
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function phoneToE164(maskedPhone: string): string {
  const digits = maskedPhone.replace(/\D/g, '')

  if (digits.length === 11) {
    return `+55${digits}`
  }

  if (digits.length === 10) {
    return `+55${digits}`
  }

  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`
  }

  return `+55${digits}`
}
