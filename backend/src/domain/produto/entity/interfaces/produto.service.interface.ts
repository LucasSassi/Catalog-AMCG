import type {
  AtualizarProdutoInput,
  CatalogoFiltros,
  CatalogoProdutos,
  CadastrarProdutoInput,
  ListarProdutosFiltros,
  Produto,
} from "../produto.entity";

export interface IProdutoService {
  create(input: CadastrarProdutoInput): Promise<Produto>;
  listCatalog(filtros?: CatalogoFiltros): Promise<CatalogoProdutos>;
  list(filtros?: ListarProdutosFiltros): Promise<Produto[]>;
  getById(id: string): Promise<Produto>;
  update(id: string, input: AtualizarProdutoInput): Promise<Produto>;
  remove(id: string): Promise<void>;
}
