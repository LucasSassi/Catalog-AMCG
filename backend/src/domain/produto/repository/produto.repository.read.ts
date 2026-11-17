import type {
  CatalogoCursorFiltros,
  CatalogoCursorPage,
  CatalogoSimilaresSorteioFiltros,
  ListarProdutosFiltros,
  Produto,
} from "../entity/produto.entity";

export interface IProdutoRepositoryRead {
  findById(id: string): Promise<Produto | null>;
  list(filtros?: ListarProdutosFiltros): Promise<Produto[]>;
  listCatalogCursor(filtros: CatalogoCursorFiltros): Promise<CatalogoCursorPage>;
  sampleApproved(excludeIds: string[], size: number): Promise<Produto[]>;
  /** Sorteia produtos visíveis no catálogo, no máximo um por produtor. */
  sampleSimilares(filtros: CatalogoSimilaresSorteioFiltros): Promise<Produto[]>;
  /** Produto de OUTRO produtor que já usa este número de registro. */
  findByRegistroNumeroDeOutroProdutor(
    numero: string,
    produtorId: string,
  ): Promise<Produto | null>;
  countDestaques(): Promise<number>;
}
