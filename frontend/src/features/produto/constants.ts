export const PRODUCT_CATEGORIES = [
  'MEL',
  'QUEIJO',
  'GELEIA',
  'CARNE',
  'BEBIDAS',
  'BOLACHAS',
  'PAES',
  'OUTROS',
] as const

export const PRODUCT_CATEGORY_LABELS: Record<
  (typeof PRODUCT_CATEGORIES)[number],
  string
> = {
  MEL: 'Méis',
  QUEIJO: 'Queijos',
  GELEIA: 'Geleias',
  CARNE: 'Carnes',
  BEBIDAS: 'Bebidas',
  BOLACHAS: 'Bolachas',
  PAES: 'Pães',
  OUTROS: 'Outros',
}

export const MEASUREMENT_UNITS = [
  'KG',
  'G',
  'UNIDADE',
  'LITRO',
  'ML',
  'DÚZIA',
  'CAIXA',
  'PACOTE',
] as const

export const PRODUCT_REGISTRATION_TYPES = [
  'SELO ARTE',
  'MAPA',
  'Outro',
] as const

export const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const
