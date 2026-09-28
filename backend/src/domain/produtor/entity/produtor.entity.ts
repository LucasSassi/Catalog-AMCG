import type {
  RegistroProdutorTipo,
  StatusProdutor,
  TipoDocumento,
  UfBrasil,
} from "./produtor.constants";

export interface Contato {
  telefone: string;
  email: string;
}

export interface Documento {
  tipo: TipoDocumento;
  numero: string;
}

export interface RegistroProdutor {
  tipo: RegistroProdutorTipo;
  numero: string;
  dataEmissao?: Date;
  dataValidade?: Date;
}

export interface Endereco {
  rua: string;
  bairro: string;
  cidade: string;
  estado: UfBrasil;
}

export interface Produtor {
  id: string;
  nomeEmpresa: string;
  municipioId: string;
  documento: Documento;
  registros: RegistroProdutor[];
  contato: Contato;
  endereco: Endereco;
  ativo: boolean;
  status: StatusProdutor;
  destaque: boolean;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProdutorCatalogo {
  id: string;
  nome: string;
  municipio: string;
  telefone: string;
  destaque: boolean;
}

export interface CatalogoProdutores {
  produtores: ProdutorCatalogo[];
}

export interface CadastrarProdutorInput {
  nomeEmpresa: string;
  municipioId: string;
  documento: Documento;
  registros: RegistroProdutor[];
  contato: Contato;
  endereco: Endereco;
}

export interface AtualizarProdutorInput {
  nomeEmpresa?: string;
  municipioId?: string;
  documento?: Documento;
  registros?: RegistroProdutor[];
  contato?: Contato;
  endereco?: Endereco;
  status?: StatusProdutor;
  motivoRejeicao?: string;
}

export interface ListarProdutoresFiltros {
  ativo?: boolean;
  status?: StatusProdutor;
  destaque?: boolean;
}
