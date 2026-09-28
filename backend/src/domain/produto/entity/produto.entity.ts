import type {
  CategoriaProduto,
  CertificacaoCatalogo,
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
  destaque: boolean;
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
  destaque?: boolean;
}

export interface CatalogoFiltros {
  busca?: string;
  categoria?: CategoriaProduto;
  municipio?: string;
  certificacao?: CertificacaoCatalogo;
}

export interface ProdutoCatalogo {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaProduto;
  unidadeMedida: UnidadeMedida;
  valorCentavos: number;
  fotoDivulgacao: Arquivo;
  destaque: boolean;
  premiado: boolean;
  produtor: {
    id: string;
    nome: string;
    municipio: string;
    telefone: string;
  };
}

export interface ProdutoCatalogoDetalhe extends ProdutoCatalogo {
  fotosDivulgacao: Arquivo[];
  registros: Array<{ tipo: RegistroProdutoTipo }>;
  premiacoes: Array<{ nome: string; ano: number }>;
  observacoes?: string;
  produtor: ProdutoCatalogo["produtor"] & {
    temRegistroSim: boolean;
  };
}

export interface CatalogoProdutos {
  produtos: ProdutoCatalogo[];
  categorias: CategoriaProduto[];
  municipios: string[];
  certificacoes: CertificacaoCatalogo[];
}
