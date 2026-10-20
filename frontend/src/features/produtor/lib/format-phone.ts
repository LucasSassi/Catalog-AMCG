export function formatPhoneDisplay(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')

  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const first = digits.slice(4, 9)
    const last = digits.slice(9)
    return `(${ddd}) ${first}-${last}`
  }

  if (digits.length === 12 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const first = digits.slice(4, 8)
    const last = digits.slice(8)
    return `(${ddd}) ${first}-${last}`
  }

  if (digits.length === 11) {
    const ddd = digits.slice(0, 2)
    const first = digits.slice(2, 7)
    const last = digits.slice(7)
    return `(${ddd}) ${first}-${last}`
  }

  if (digits.length === 10) {
    const ddd = digits.slice(0, 2)
    const first = digits.slice(2, 6)
    const last = digits.slice(6)
    return `(${ddd}) ${first}-${last}`
  }

  return telefone
}
