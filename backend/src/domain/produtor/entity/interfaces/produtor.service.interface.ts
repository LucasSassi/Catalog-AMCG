import type {
  AtualizarProdutorInput,
  CadastrarProdutorInput,
  CatalogoProdutores,
  ListarProdutoresFiltros,
  Produtor,
} from "../produtor.entity";

export interface IProdutorService {
  create(input: CadastrarProdutorInput): Promise<Produtor>;
  list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]>;
  listCatalog(): Promise<CatalogoProdutores>;
  getById(id: string): Promise<Produtor>;
  update(id: string, input: AtualizarProdutorInput): Promise<Produtor>;
  setDestaque(id: string, destaque: boolean): Promise<Produtor>;
  remove(id: string): Promise<void>;
}
