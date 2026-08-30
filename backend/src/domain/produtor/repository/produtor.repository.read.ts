import type {
  ListarProdutoresFiltros,
  Produtor,
} from "../entity/produtor.entity";

export interface IProdutorRepositoryRead {
  findById(id: string): Promise<Produtor | null>;
  list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]>;
  findByDocumentoNumero(numero: string): Promise<Produtor | null>;
  findByRegistroNumero(numero: string): Promise<Produtor | null>;
}
