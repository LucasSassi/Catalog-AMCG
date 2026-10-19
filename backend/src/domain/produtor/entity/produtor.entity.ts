import type {
  RegistroProdutorTipo,
  StatusProdutor,
  TipoDocumento,
  TipoRedeSocial,
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

export interface Arquivo {
  url: string;
  contentType: string;
  nomeOriginal: string;
}

export interface RedeSocialItem {
  tipo: TipoRedeSocial;
  handle: string;
}

export interface EnderecoCatalogo {
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
  historia: string;
  logo?: Arquivo;
  fotos: Arquivo[];
  redesSociais: RedeSocialItem[];
  site?: string;
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
  historia: string;
  logo?: Arquivo;
  fotos: Arquivo[];
  endereco: EnderecoCatalogo;
  redesSociais: RedeSocialItem[];
  site?: string;
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
  historia: string;
  logo: Arquivo;
  fotos: Arquivo[];
  redesSociais?: RedeSocialItem[];
  site?: string;
}

export interface AtualizarProdutorInput {
  nomeEmpresa?: string;
  municipioId?: string;
  documento?: Documento;
  registros?: RegistroProdutor[];
  contato?: Contato;
  endereco?: Endereco;
  historia?: string;
  logo?: Arquivo;
  fotos?: Arquivo[];
  redesSociais?: RedeSocialItem[];
  site?: string | null;
  status?: StatusProdutor;
  motivoRejeicao?: string;
}

export interface ListarProdutoresFiltros {
  ativo?: boolean;
  status?: StatusProdutor;
  destaque?: boolean;
}
