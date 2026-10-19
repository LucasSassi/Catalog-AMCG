export type ProducerStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export type SocialNetworkType = 'INSTAGRAM' | 'FACEBOOK'

export interface ProducerDocument {
  tipo: 'CNPJ' | 'CPF' | 'CAD_PRO'
  numero: string
}

export interface ProducerRegistration {
  tipo: 'SIM'
  numero: string
  dataEmissao?: string
  dataValidade?: string
}

export interface ProducerContact {
  telefone: string
  email: string
}

export interface ProducerAddress {
  rua: string
  bairro: string
  cidade: string
  estado: string
}

export interface ProducerFile {
  url: string
  contentType: string
  nomeOriginal: string
}

export interface ProducerSocialNetwork {
  tipo: SocialNetworkType
  handle: string
}

export interface CatalogProducerAddress {
  bairro: string
  cidade: string
  estado: string
}

export interface Producer {
  id: string
  nomeEmpresa: string
  municipioId: string
  documento: ProducerDocument
  registros: ProducerRegistration[]
  contato: ProducerContact
  endereco: ProducerAddress
  historia: string
  logo?: ProducerFile
  fotos: ProducerFile[]
  redesSociais: ProducerSocialNetwork[]
  site?: string
  ativo: boolean
  status: ProducerStatus
  destaque: boolean
  motivoRejeicao?: string
  createdAt: string
  updatedAt: string
}

export interface CatalogProducer {
  id: string
  nome: string
  municipio: string
  telefone: string
  destaque: boolean
  historia: string
  logo?: ProducerFile
  fotos: ProducerFile[]
  endereco: CatalogProducerAddress
  redesSociais: ProducerSocialNetwork[]
  site?: string
}

export interface ProducerCatalog {
  produtores: CatalogProducer[]
}

export interface CreateProducerInput {
  nomeEmpresa: string
  municipioId: string
  documento: ProducerDocument
  registros: ProducerRegistration[]
  contato: ProducerContact
  endereco: ProducerAddress
  historia: string
  logo: ProducerFile
  fotos: ProducerFile[]
  redesSociais?: ProducerSocialNetwork[]
  site?: string
}
