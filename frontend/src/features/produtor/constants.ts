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

export const REGISTRATION_TYPES = [
  'SIM',
  'SUSAF',
  'SIF',
  'SELO ARTE',
  'MAPA',
  'VIGILÂNCIA SANITÁRIA',
  'Outro',
] as const

export const MAX_CEP_DIGITS = 8

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

export const AMCG_MUNICIPIOS = [
  'Arapoti',
  'Carambeí',
  'Castro',
  'Curiúva',
  'Imbaú',
  'Ipiranga',
  'Ivaí',
  'Jaguariaíva',
  'Ortigueira',
  'Palmeira',
  'Piraí do Sul',
  'Porto Amazonas',
  'Ponta Grossa',
  'Reserva',
  'São João do Triunfo',
  'Sengés',
  'Telêmaco Borba',
  'Tibagi',
  'Ventania',
] as const

export const COMPANY_REGISTRATION_TYPE_OPTIONS = REGISTRATION_TYPES

export const YES_NO_OPTIONS = ['Sim', 'Não'] as const

export const MAX_PRODUCER_DESTAQUES = 3

export const PRODUCER_REJECTION_REASONS = [
  {
    id: 'registro',
    label: 'Registro vencido ou ilegível',
    message:
      'O registro sanitário está vencido ou não foi possível ler o comprovante.',
  },
  {
    id: 'fotos',
    label: 'Fotos insuficientes',
    message: 'As fotos enviadas não mostram bem o empreendimento.',
  },
  {
    id: 'logo',
    label: 'Logo ausente',
    message: 'Falta a logo do empreendimento.',
  },
  {
    id: 'documento',
    label: 'Documento inválido',
    message: 'O documento informado não confere.',
  },
  {
    id: 'regiao',
    label: 'Fora dos Campos Gerais',
    message: 'O endereço informado fica fora da região atendida.',
  },
  {
    id: 'contato',
    label: 'Contato não responde',
    message: 'Não conseguimos falar pelo WhatsApp informado.',
  },
] as const
