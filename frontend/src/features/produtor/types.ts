export type ProducerStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export interface ProducerDocument {
  tipo: 'CNPJ' | 'CPF' | 'CAD_PRO'
  numero: string
}

export interface ProducerRegistration {
  tipo: 'SIM' | 'SUSAF' | 'SIF' | 'Outro'
  tipoOutros?: string
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

export interface Producer {
  id: string
  nomeEmpresa: string
  municipioId: string
  documento: ProducerDocument
  registros: ProducerRegistration[]
  contato: ProducerContact
  endereco: ProducerAddress
  ativo: boolean
  status: ProducerStatus
  motivoRejeicao?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProducerInput {
  nomeEmpresa: string
  municipioId: string
  documento: ProducerDocument
  registros: ProducerRegistration[]
  contato: ProducerContact
  endereco: ProducerAddress
}

