export type ProductStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export type ProductCategory =
  | 'MEL'
  | 'QUEIJO'
  | 'GELEIA'
  | 'CARNE'
  | 'BEBIDAS'
  | 'BOLACHAS'
  | 'PAES'
  | 'OUTROS'

export type MeasurementUnit =
  | 'KG'
  | 'G'
  | 'UNIDADE'
  | 'LITRO'
  | 'ML'
  | 'DÚZIA'
  | 'CAIXA'
  | 'PACOTE'

export interface ProductFile {
  url: string
  contentType: string
  nomeOriginal: string
}

export interface ProductRegistration {
  tipo: 'SELO ARTE' | 'MAPA' | 'Outro'
  tipoOutros?: string
  numero: string
  dataEmissao?: string
  dataValidade?: string
}

export interface ProductAward {
  nome: string
  descricao: string
  ano: number
  comprovante: ProductFile
}

export interface Product {
  id: string
  produtorId: string
  nome: string
  descricao: string
  categoria: ProductCategory
  unidadeMedida: MeasurementUnit
  registros: ProductRegistration[]
  fotosAvaliacao: ProductFile[]
  fotosDivulgacao: ProductFile[]
  premiacoes: ProductAward[]
  valorCentavos: number
  observacoes?: string
  ativo: boolean
  status: ProductStatus
  motivoRejeicao?: string
  createdAt: string
  updatedAt: string
}

export interface CatalogProduct {
  id: string
  nome: string
  descricao: string
  categoria: ProductCategory
  unidadeMedida: MeasurementUnit
  valorCentavos: number
  fotoDivulgacao: ProductFile
  produtor: {
    id: string
    nome: string
    municipio: string
    telefone: string
  }
}

export interface CatalogFilters {
  busca: string
  categoria: string
  municipio: string
}

export interface ProductCatalog {
  produtos: CatalogProduct[]
  categorias: ProductCategory[]
  municipios: string[]
}
