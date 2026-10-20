import type {
  Arquivo,
  Contato,
  Documento,
  Endereco,
  Produtor,
  RedeSocialItem,
  RegistroProdutor,
} from "../entity/produtor.entity";
import type { StatusProdutor } from "../entity/produtor.constants";

export interface CreateProdutorData {
  nomeEmpresa: string;
  municipioId: string;
  documento: Documento;
  registros: RegistroProdutor[];
  contato: Contato;
  endereco: Endereco;
  historia: string;
  logo: Arquivo;
  fotos: Arquivo[];
  redesSociais: RedeSocialItem[];
  site?: string;
  ativo: boolean;
  status: StatusProdutor;
  destaque: boolean;
}

export interface UpdateProdutorData {
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
  ativo?: boolean;
  status?: StatusProdutor;
  destaque?: boolean;
  motivoRejeicao?: string | null;
}

export interface IProdutorRepositoryWrite {
  create(data: CreateProdutorData): Promise<Produtor>;
  update(id: string, data: UpdateProdutorData): Promise<Produtor | null>;
  softDelete(id: string): Promise<Produtor | null>;
  hardDelete(id: string): Promise<boolean>;
}
