export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const

export const DOCUMENT_TYPES = ['CNPJ', 'CPF', 'CAD_PRO'] as const

export const REGISTRATION_TYPES = ['SIM'] as const

export const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const MAX_PRODUCER_PHOTOS = 8
export const MAX_HISTORIA_LENGTH = 2000

export const SOCIAL_NETWORK_TYPES = ['INSTAGRAM', 'FACEBOOK'] as const

export const SOCIAL_NETWORK_LABELS: Record<
  (typeof SOCIAL_NETWORK_TYPES)[number],
  string
> = {
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
}
