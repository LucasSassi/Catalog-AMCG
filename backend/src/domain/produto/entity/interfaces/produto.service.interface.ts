import type {
  AtualizarProdutoInput,
  CatalogoFiltros,
  CatalogoProdutos,
  CadastrarProdutoInput,
  ListarProdutosFiltros,
  Produto,
  ProdutoCatalogoDetalhe,
} from "../produto.entity";

export interface IProdutoService {
  create(input: CadastrarProdutoInput): Promise<Produto>;
  listCatalog(filtros?: CatalogoFiltros): Promise<CatalogoProdutos>;
  getCatalogById(id: string): Promise<ProdutoCatalogoDetalhe>;
  list(filtros?: ListarProdutosFiltros): Promise<Produto[]>;
  getById(id: string): Promise<Produto>;
  update(id: string, input: AtualizarProdutoInput): Promise<Produto>;
  setDestaque(id: string, destaque: boolean): Promise<Produto>;
  remove(id: string): Promise<void>;
}
