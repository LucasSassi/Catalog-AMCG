import type {
  ListarProdutoresFiltros,
  Produtor,
} from "../entity/produtor.entity";

export interface IProdutorRepositoryRead {
  findById(id: string): Promise<Produtor | null>;
  findByIds(ids: string[]): Promise<Produtor[]>;
  list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]>;
  listLimited(
    filtros: ListarProdutoresFiltros,
    limit: number,
  ): Promise<Produtor[]>;
  sampleApproved(excludeIds: string[], size: number): Promise<Produtor[]>;
  listMunicipiosAprovados(): Promise<string[]>;
  findByDocumentoNumero(numero: string): Promise<Produtor | null>;
  findByRegistroNumero(numero: string): Promise<Produtor | null>;
  countDestaques(): Promise<number>;
}
