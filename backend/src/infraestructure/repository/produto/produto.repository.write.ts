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
      descricaoBreve: data.descricaoBreve,
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
      destaque: data.destaque,
    });
    return toProdutoEntity(document);
  }

  async update(id: string, data: UpdateProdutoData): Promise<Produto | null> {
    const { revisaoEsperada, ...values } = data;
    const payload: Record<string, unknown> = { ...values, $inc: { revisao: 1 } };

    if (data.motivoRejeicao === null) {
      payload.$unset = { motivoRejeicao: "" };
      delete payload.motivoRejeicao;
    }

    const document = await ProdutoModel.findOneAndUpdate({ _id: id, ...(revisaoEsperada !== undefined ? { $or: [{ revisao: revisaoEsperada }, ...(revisaoEsperada === 0 ? [{ revisao: { $exists: false } }] : [])] } : {}) }, payload, {
      new: true,
      runValidators: true,
    }).exec();

    return document ? toProdutoEntity(document) : null;
  }

  async softDelete(id: string): Promise<Produto | null> {
    const document = await ProdutoModel.findByIdAndUpdate(
      id,
      { ativo: false, destaque: false, $inc: { revisao: 1 } },
      { new: true, runValidators: true },
    ).exec();

    return document ? toProdutoEntity(document) : null;
  }

  async hardDelete(id: string): Promise<boolean> {
    const document = await ProdutoModel.findByIdAndDelete(id).exec();
    return document !== null;
  }
}
