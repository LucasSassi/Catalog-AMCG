export type ProductStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export type ProductCategory =
  | 'BEBIDAS_ARTESANAIS'
  | 'QUEIJOS_E_LACTEOS'
  | 'MEL_E_DERIVADOS'
  | 'PANIFICADOS'
  | 'CONSERVAS'
  | 'EMBUTIDOS_E_DEFUMADOS'
  | 'CEREAIS_E_GRAOS'
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
  tipo: 'SELO ARTE' | 'MAPA' | 'SUSAF' | 'SIF' | 'Outro'
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
  destaque: boolean
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
  destaque: boolean
  premiado: boolean
  produtor: {
    id: string
    nome: string
    municipio: string
    telefone: string
  }
}

export interface CatalogProductDetail extends CatalogProduct {
  fotosDivulgacao: ProductFile[]
  registros: Array<{ tipo: ProductRegistration['tipo'] }>
  premiacoes: Array<{ nome: string; ano: number }>
  observacoes?: string
  produtor: CatalogProduct['produtor'] & {
    temRegistroSim: boolean
  }
}

export interface CatalogFilters {
  busca: string
  categoria: string
  municipio: string
  certificacao: string
}

export interface ProductCatalog {
  produtos: CatalogProduct[]
  categorias: ProductCategory[]
  municipios: string[]
  certificacoes: string[]
}

export interface CreateProductInput {
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
}
