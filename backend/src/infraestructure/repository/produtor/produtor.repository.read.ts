import type { IProdutorRepositoryRead } from "../../../domain/produtor/repository/produtor.repository.read";
import type {
  ListarProdutoresFiltros,
  Produtor,
} from "../../../domain/produtor/entity/produtor.entity";
import { ProdutorModel } from "../../db/mongo/models/produtor.model";
import { toProdutorEntity } from "./adapters/produtor.adapter";

export class ProdutorRepositoryRead implements IProdutorRepositoryRead {
  async findById(id: string): Promise<Produtor | null> {
    const document = await ProdutorModel.findById(id).exec();
    return document ? toProdutorEntity(document) : null;
  }

  async list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]> {
    const query: Record<string, unknown> = {};

    if (filtros?.ativo !== undefined) {
      query.ativo = filtros.ativo;
    }

    if (filtros?.status !== undefined) {
      query.status = filtros.status;
    }

    if (filtros?.destaque !== undefined) {
      query.destaque = filtros.destaque;
    }

    const documents = await ProdutorModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(toProdutorEntity);
  }

  async findByDocumentoNumero(numero: string): Promise<Produtor | null> {
    const document = await ProdutorModel.findOne({
      "documento.numero": numero,
    }).exec();
    return document ? toProdutorEntity(document) : null;
  }

  async findByRegistroNumero(numero: string): Promise<Produtor | null> {
    const document = await ProdutorModel.findOne({
      "registros.numero": numero,
    }).exec();
    return document ? toProdutorEntity(document) : null;
  }

  async countDestaques(): Promise<number> {
    return ProdutorModel.countDocuments({
      destaque: true,
      ativo: true,
      status: "APROVADO",
    }).exec();
  }
}
