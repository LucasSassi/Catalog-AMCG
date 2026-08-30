import type {
  AtualizarProdutorInput,
  CadastrarProdutorInput,
  ListarProdutoresFiltros,
  Produtor,
} from "../produtor.entity";

export interface IProdutorService {
  create(input: CadastrarProdutorInput): Promise<Produtor>;
  list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]>;
  getById(id: string): Promise<Produtor>;
  update(id: string, input: AtualizarProdutorInput): Promise<Produtor>;
  remove(id: string): Promise<void>;
}
