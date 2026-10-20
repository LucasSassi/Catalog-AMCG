export const PRODUCT_CATEGORIES = [
  'BEBIDAS_ARTESANAIS',
  'QUEIJOS_E_LACTEOS',
  'MEL_E_DERIVADOS',
  'PANIFICADOS',
  'CONSERVAS',
  'EMBUTIDOS_E_DEFUMADOS',
  'CEREAIS_E_GRAOS',
  'OUTROS',
] as const

export const PRODUCT_CATEGORY_LABELS: Record<
  (typeof PRODUCT_CATEGORIES)[number],
  string
> = {
  BEBIDAS_ARTESANAIS: 'Bebidas Artesanais',
  QUEIJOS_E_LACTEOS: 'Queijos e Lácteos',
  MEL_E_DERIVADOS: 'Mel e Derivados',
  PANIFICADOS: 'Panificados',
  CONSERVAS: 'Conservas',
  EMBUTIDOS_E_DEFUMADOS: 'Embutidos e Defumados',
  CEREAIS_E_GRAOS: 'Cereais e Grãos',
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
  'SUSAF',
  'SIF',
  'Outro',
] as const

export const CATALOG_CERTIFICATIONS = [
  ...PRODUCT_REGISTRATION_TYPES,
  'SIM',
] as const

export const SEAL_INFO_TYPES = ['SIM', 'SIF', 'MAPA'] as const

export type SealInfoType = (typeof SEAL_INFO_TYPES)[number]

export const SEAL_INFO: Record<
  SealInfoType,
  { short: string; detail: string }
> = {
  SIM: {
    short:
      'SIM – Inspeção Municipal: comercialização somente dentro dos respectivos municípios.',
    detail:
      'O SIM é a fiscalização sanitária do município. O produto só pode ser vendido nos municípios cobertos por esse serviço de inspeção.',
  },
  SIF: {
    short:
      'SIF – Inspeção Federal: comercialização em todo o território nacional.',
    detail:
      'O SIF é a fiscalização sanitária federal. O produto pode ser vendido em todo o Brasil.',
  },
  MAPA: {
    short:
      'MAPA – Ministério da Agricultura e Pecuária: registro do produto junto ao órgão federal.',
    detail:
      'Identifica produto regularizado no MAPA. A venda segue as condições desse registro.',
  },
}

export const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const
