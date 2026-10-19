import type {
  AtualizarProdutorInput,
  CadastrarProdutorInput,
  CatalogoDestaquesProdutores,
  CatalogoProdutores,
  ListarProdutoresFiltros,
  Produtor,
  ProdutorCatalogo,
} from "../produtor.entity";

export interface IProdutorService {
  create(input: CadastrarProdutorInput): Promise<Produtor>;
  list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]>;
  listCatalog(): Promise<CatalogoProdutores>;
  listDestaques(): Promise<CatalogoDestaquesProdutores>;
  getCatalogById(id: string): Promise<ProdutorCatalogo>;
  getById(id: string): Promise<Produtor>;
  update(id: string, input: AtualizarProdutorInput): Promise<Produtor>;
  setDestaque(id: string, destaque: boolean): Promise<Produtor>;
  remove(id: string): Promise<void>;
}
