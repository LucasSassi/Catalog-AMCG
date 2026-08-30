import type {
  Arquivo,
  Premiacao,
  Produto,
  RegistroProduto,
} from "../entity/produto.entity";
import type {
  CategoriaProduto,
  StatusProduto,
  UnidadeMedida,
} from "../entity/produto.constants";

export interface CreateProdutoData {
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
}

export interface UpdateProdutoData {
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
  ativo?: boolean;
  status?: StatusProduto;
  motivoRejeicao?: string | null;
}

export interface IProdutoRepositoryWrite {
  create(data: CreateProdutoData): Promise<Produto>;
  update(id: string, data: UpdateProdutoData): Promise<Produto | null>;
  softDelete(id: string): Promise<Produto | null>;
}
