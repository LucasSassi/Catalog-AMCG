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

export const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const
