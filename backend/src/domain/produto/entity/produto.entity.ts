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
  revisao?: number;
  origemPendencia?: "CADASTRO" | "ALTERACAO";
  camposAlterados?: string[];
  alteradoPor?: string;
  alteradoEm?: Date;

  id: string;
  produtorId: string;
  nome: string;
  descricaoBreve: string;
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
  descricaoBreve: string;
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
  revisao?: number;
  autorId?: string;
  produtorId?: string;
  nome?: string;
  descricaoBreve?: string;
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
  premiado?: boolean;
  pageSize?: number;
  lastItemId?: string;
}

export interface CatalogoSimilaresFiltros {
  categoria: CategoriaProduto;
  excludeId?: string;
  pageSize?: number;
  lastItemId?: string;
}

export interface CatalogoDoProdutorFiltros {
  produtorId: string;
  excludeId?: string;
  pageSize?: number;
  lastItemId?: string;
}

export interface CatalogoCursorFiltros {
  busca?: string;
  categoria?: CategoriaProduto;
  municipio?: string;
  certificacao?: CertificacaoCatalogo;
  premiado?: boolean;
  produtorId?: string;
  pageSize: number;
  lastItemId?: string;
  destaque?: boolean;
  excludeIds?: string[];
}

export interface CatalogoCursorPage {
  items: Produto[];
  nextLastItemId: string | null;
}

export interface CatalogoCursorMeta {
  pageSize: number;
  nextLastItemId: string | null;
  hasNext: boolean;
}

export interface ProdutoCatalogo {
  id: string;
  nome: string;
  descricaoBreve: string;
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
  descricao: string;
  fotosDivulgacao: Arquivo[];
  registros: Array<{ tipo: RegistroProdutoTipo; tipoOutros?: string }>;
  premiacoes: Array<{ nome: string; descricao: string; ano: number }>;
  observacoes?: string;
  produtor: ProdutoCatalogo["produtor"] & {
    temRegistroSim: boolean;
    logo?: Arquivo;
  };
}

export interface CatalogoProdutos extends CatalogoCursorMeta {
  produtos: ProdutoCatalogo[];
  categorias: CategoriaProduto[];
  municipios: string[];
  certificacoes: CertificacaoCatalogo[];
}

export interface CatalogoDestaquesProdutos {
  produtos: ProdutoCatalogo[];
}

export interface CatalogoSimilaresProdutos extends CatalogoCursorMeta {
  produtos: ProdutoCatalogo[];
}

export interface CatalogoDoProdutorProdutos extends CatalogoCursorMeta {
  produtos: ProdutoCatalogo[];
}
