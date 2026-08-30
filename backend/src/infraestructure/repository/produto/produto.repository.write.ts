import type {
  CreateProdutoData,
  IProdutoRepositoryWrite,
  UpdateProdutoData,
} from "../../../domain/produto/repository/produto.repository.write";
import type { Produto } from "../../../domain/produto/entity/produto.entity";
import { ProdutoModel } from "../../db/mongo/models/produto.model";
import { toProdutoEntity } from "./adapters/produto.adapter";

export class ProdutoRepositoryWrite implements IProdutoRepositoryWrite {
  async create(data: CreateProdutoData): Promise<Produto> {
    const document = await ProdutoModel.create({
      produtorId: data.produtorId,
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      unidadeMedida: data.unidadeMedida,
      registros: data.registros,
      fotosAvaliacao: data.fotosAvaliacao,
      fotosDivulgacao: data.fotosDivulgacao,
      premiacoes: data.premiacoes,
      valorCentavos: data.valorCentavos,
      ...(data.observacoes !== undefined ? { observacoes: data.observacoes } : {}),
      ativo: data.ativo,
      status: data.status,
    });
    return toProdutoEntity(document);
  }

  async update(id: string, data: UpdateProdutoData): Promise<Produto | null> {
    const payload: Record<string, unknown> = { ...data };

    if (data.motivoRejeicao === null) {
      payload.$unset = { motivoRejeicao: "" };
      delete payload.motivoRejeicao;
    }

    const document = await ProdutoModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).exec();

    return document ? toProdutoEntity(document) : null;
  }

  async softDelete(id: string): Promise<Produto | null> {
    const document = await ProdutoModel.findByIdAndUpdate(
      id,
      { ativo: false },
      { new: true, runValidators: true },
    ).exec();

    return document ? toProdutoEntity(document) : null;
  }
}
