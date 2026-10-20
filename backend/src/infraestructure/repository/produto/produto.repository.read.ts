import { Types, type PipelineStage } from "mongoose";
import { PRODUTOR_COLLECTION } from "../../../domain/produtor/entity/produtor.constants";
import type { IProdutoRepositoryRead } from "../../../domain/produto/repository/produto.repository.read";
import type {
  CatalogoCursorFiltros,
  CatalogoCursorPage,
  ListarProdutosFiltros,
  Produto,
} from "../../../domain/produto/entity/produto.entity";
import { ProdutoModel } from "../../db/mongo/models/produto.model";
import { toProdutoEntity } from "./adapters/produto.adapter";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toObjectIdOrNull(id: string): Types.ObjectId | null {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  return new Types.ObjectId(id);
}

function buildProducerLookupPipeline(): PipelineStage.Lookup["$lookup"] {
  return {
    from: PRODUTOR_COLLECTION,
    let: { produtorId: "$produtorId" },
    pipeline: [
      {
        $match: {
          $expr: { $eq: [{ $toString: "$_id" }, "$$produtorId"] },
          ativo: true,
          status: "APROVADO",
        },
      },
      {
        $project: {
          nomeEmpresa: 1,
          "endereco.cidade": 1,
          "contato.telefone": 1,
          registros: 1,
        },
      },
    ],
    as: "produtorDoc",
  };
}

function buildCatalogMatch(
  filtros: CatalogoCursorFiltros,
): Record<string, unknown> {
  const match: Record<string, unknown> = {
    ativo: true,
    status: "APROVADO",
    "fotosDivulgacao.0": { $exists: true },
  };

  if (filtros.categoria !== undefined) {
    match.categoria = filtros.categoria;
  }

  if (filtros.destaque !== undefined) {
    match.destaque = filtros.destaque;
  }

  if (filtros.certificacao !== undefined && filtros.certificacao !== "SIM") {
    match["registros.tipo"] = filtros.certificacao;
  }

  const excludeObjectIds = (filtros.excludeIds ?? [])
    .map(toObjectIdOrNull)
    .filter((id): id is Types.ObjectId => id !== null);

  if (excludeObjectIds.length > 0) {
    match._id = { $nin: excludeObjectIds };
  }

  return match;
}

function buildCatalogFilterStages(
  filtros: CatalogoCursorFiltros,
): PipelineStage[] {
  const stages: PipelineStage[] = [
    { $match: buildCatalogMatch(filtros) },
    { $lookup: buildProducerLookupPipeline() },
    { $unwind: "$produtorDoc" },
  ];

  if (filtros.municipio?.trim()) {
    stages.push({
      $match: { "produtorDoc.endereco.cidade": filtros.municipio.trim() },
    });
  }

  if (filtros.certificacao === "SIM") {
    stages.push({
      $match: { "produtorDoc.registros.tipo": "SIM" },
    });
  }

  if (filtros.busca?.trim()) {
    const regex = {
      $regex: escapeRegex(filtros.busca.trim()),
      $options: "i",
    };
    stages.push({
      $match: {
        $or: [
          { nome: regex },
          { descricao: regex },
          { "produtorDoc.nomeEmpresa": regex },
        ],
      },
    });
  }

  return stages;
}

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

    if (filtros?.destaque !== undefined) {
      query.destaque = filtros.destaque;
    }

    const documents = await ProdutoModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(toProdutoEntity);
  }

  async listCatalogCursor(
    filtros: CatalogoCursorFiltros,
  ): Promise<CatalogoCursorPage> {
    const pipeline: PipelineStage[] = [
      ...buildCatalogFilterStages(filtros),
      { $sort: { _id: -1 } },
    ];

    if (filtros.lastItemId) {
      const lastObjectId = toObjectIdOrNull(filtros.lastItemId);
      if (!lastObjectId) {
        return { items: [], nextLastItemId: null };
      }
      pipeline.push({ $match: { _id: { $lt: lastObjectId } } });
    }

    pipeline.push({ $limit: filtros.pageSize + 1 });
    pipeline.push({ $project: { produtorDoc: 0 } });

    const documents = await ProdutoModel.aggregate(pipeline).exec();
    const hasExtra = documents.length > filtros.pageSize;
    const pageDocuments = hasExtra
      ? documents.slice(0, filtros.pageSize)
      : documents;
    const items = pageDocuments.map((document) =>
      toProdutoEntity(document as Parameters<typeof toProdutoEntity>[0]),
    );
    const lastItem = items[items.length - 1];

    return {
      items,
      nextLastItemId: hasExtra && lastItem ? lastItem.id : null,
    };
  }

  async sampleApproved(
    excludeIds: string[],
    size: number,
  ): Promise<Produto[]> {
    if (size <= 0) {
      return [];
    }

    const pipeline: PipelineStage[] = [
      ...buildCatalogFilterStages({
        pageSize: size,
        excludeIds,
      }),
      { $sample: { size } },
      { $project: { produtorDoc: 0 } },
    ];

    const documents = await ProdutoModel.aggregate(pipeline).exec();
    return documents.map((document) =>
      toProdutoEntity(document as Parameters<typeof toProdutoEntity>[0]),
    );
  }

  async findByRegistroNumero(numero: string): Promise<Produto | null> {
    const document = await ProdutoModel.findOne({
      "registros.numero": numero,
    }).exec();
    return document ? toProdutoEntity(document) : null;
  }

  async countDestaques(): Promise<number> {
    return ProdutoModel.countDocuments({
      destaque: true,
      ativo: true,
      status: "APROVADO",
    }).exec();
  }
}
