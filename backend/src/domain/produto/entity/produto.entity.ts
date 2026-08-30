import type {
  CategoriaProduto,
  RegistroProdutoTipo,
  StatusProduto,
  UnidadeMedida,
} from "./produto.constants";

export interface Arquivo {
  url: string;
  contentType: string;
  nomeOriginal: string;
}

export interface RegistroProduto {
  tipo: RegistroProdutoTipo;
  tipoOutros?: string;
  numero: string;
  dataEmissao?: Date;
  dataValidade?: Date;
}

export interface Premiacao {
  nome: string;
  descricao: string;
  ano: number;
  comprovante: Arquivo;
}

export interface Produto {
  id: string;
  produtorId: string;
  nome: string;
  descricao: string;
  categoria: CategoriaProduto;
  unidadeMedida: UnidadeMedida;
  registros: RegistroProduto[];
  fotosAvaliacao: Arquivo[];
  fotosDivulgacao: Arquivo[];
  premiacoes: Premiacao[];
  valorCentavos: number;
  observacoes?: string;
  ativo: boolean;
  status: StatusProduto;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CadastrarProdutoInput {
  produtorId: string;
  nome: string;
  descricao: string;
  categoria: CategoriaProduto;
  unidadeMedida: UnidadeMedida;
  registros: RegistroProduto[];
  fotosAvaliacao: Arquivo[];
  fotosDivulgacao: Arquivo[];
  premiacoes: Premiacao[];
  valorCentavos: number;
  observacoes?: string;
}

export interface AtualizarProdutoInput {
  produtorId?: string;
  nome?: string;
  descricao?: string;
  categoria?: CategoriaProduto;
  unidadeMedida?: UnidadeMedida;
  registros?: RegistroProduto[];
  fotosAvaliacao?: Arquivo[];
  fotosDivulgacao?: Arquivo[];
  premiacoes?: Premiacao[];
  valorCentavos?: number;
  observacoes?: string;
  status?: StatusProduto;
  motivoRejeicao?: string;
}

export interface ListarProdutosFiltros {
  produtorId?: string;
  categoria?: CategoriaProduto;
  ativo?: boolean;
  status?: StatusProduto;
}
