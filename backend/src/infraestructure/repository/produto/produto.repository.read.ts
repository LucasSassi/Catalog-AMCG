import type { IProdutoRepositoryRead } from "../../../domain/produto/repository/produto.repository.read";
import type {
  ListarProdutosFiltros,
  Produto,
} from "../../../domain/produto/entity/produto.entity";
import { ProdutoModel } from "../../db/mongo/models/produto.model";
import { toProdutoEntity } from "./adapters/produto.adapter";

export class ProdutoRepositoryRead implements IProdutoRepositoryRead {
  async findById(id: string): Promise<Produto | null> {
    const document = await ProdutoModel.findById(id).exec();
    return document ? toProdutoEntity(document) : null;
  }

  async list(filtros?: ListarProdutosFiltros): Promise<Produto[]> {
    const query: Record<string, unknown> = {};

    if (filtros?.produtorId !== undefined) {
      query.produtorId = filtros.produtorId;
    }

    if (filtros?.categoria !== undefined) {
      query.categoria = filtros.categoria;
    }

    if (filtros?.ativo !== undefined) {
      query.ativo = filtros.ativo;
    }

    if (filtros?.status !== undefined) {
      query.status = filtros.status;
    }

    const documents = await ProdutoModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(toProdutoEntity);
  }

  async findByRegistroNumero(numero: string): Promise<Produto | null> {
    const document = await ProdutoModel.findOne({
      "registros.numero": numero,
    }).exec();
    return document ? toProdutoEntity(document) : null;
  }
}
