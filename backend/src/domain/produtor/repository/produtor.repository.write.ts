import type {
  Contato,
  Documento,
  Endereco,
  Produtor,
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
  ativo: boolean;
  status: StatusProdutor;
}

export interface UpdateProdutorData {
  nomeEmpresa?: string;
  municipioId?: string;
  documento?: Documento;
  registros?: RegistroProdutor[];
  contato?: Contato;
  endereco?: Endereco;
  ativo?: boolean;
}

export interface IProdutorRepositoryWrite {
  create(data: CreateProdutorData): Promise<Produtor>;
  update(id: string, data: UpdateProdutorData): Promise<Produtor | null>;
  softDelete(id: string): Promise<Produtor | null>;
}
