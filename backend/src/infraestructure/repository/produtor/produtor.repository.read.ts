import { Types } from "mongoose";
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

  async findByIds(ids: string[]): Promise<Produtor[]> {
    const uniqueIds = [...new Set(ids.filter((id) => id.length > 0))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const objectIds = uniqueIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    const documents = await ProdutorModel.find({
      _id: { $in: objectIds },
    }).exec();
    return documents.map(toProdutorEntity);
  }

  async listMunicipiosAprovados(): Promise<string[]> {
    const cidades = await ProdutorModel.distinct("endereco.cidade", {
      ativo: true,
      status: "APROVADO",
    }).exec();

    return cidades
      .filter((cidade): cidade is string => typeof cidade === "string")
      .map((cidade) => cidade.trim())
      .filter((cidade) => cidade.length > 0)
      .sort((cidadeA, cidadeB) => cidadeA.localeCompare(cidadeB, "pt-BR"));
  }

  async list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]> {
    const query = this.buildListQuery(filtros);
    const documents = await ProdutorModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(toProdutorEntity);
  }

  async listLimited(
    filtros: ListarProdutoresFiltros,
    limit: number,
  ): Promise<Produtor[]> {
    const query = this.buildListQuery(filtros);
    const documents = await ProdutorModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return documents.map(toProdutorEntity);
  }

  async sampleApproved(
    excludeIds: string[],
    size: number,
  ): Promise<Produtor[]> {
    if (size <= 0) {
      return [];
    }

    const excludeObjectIds = excludeIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const match: Record<string, unknown> = {
      ativo: true,
      status: "APROVADO",
    };

    if (excludeObjectIds.length > 0) {
      match._id = { $nin: excludeObjectIds };
    }

    const documents = await ProdutorModel.aggregate([
      { $match: match },
      { $sample: { size } },
    ]).exec();

    return documents.map((document) =>
      toProdutorEntity(document as Parameters<typeof toProdutorEntity>[0]),
    );
  }

  private buildListQuery(
    filtros?: ListarProdutoresFiltros,
  ): Record<string, unknown> {
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

    return query;
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
