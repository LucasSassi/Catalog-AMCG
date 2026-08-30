import type {
  ListarProdutosFiltros,
  Produto,
} from "../entity/produto.entity";

export interface IProdutoRepositoryRead {
  findById(id: string): Promise<Produto | null>;
  list(filtros?: ListarProdutosFiltros): Promise<Produto[]>;
  findByRegistroNumero(numero: string): Promise<Produto | null>;
}
