import type {
  CreateProdutorData,
  IProdutorRepositoryWrite,
  UpdateProdutorData,
} from "../../../domain/produtor/repository/produtor.repository.write";
import type { Produtor } from "../../../domain/produtor/entity/produtor.entity";
import { ProdutorModel } from "../../db/mongo/models/produtor.model";
import { toProdutorEntity } from "./adapters/produtor.adapter";

export class ProdutorRepositoryWrite implements IProdutorRepositoryWrite {
  async create(data: CreateProdutorData): Promise<Produtor> {
    const document = await ProdutorModel.create({
      nomeEmpresa: data.nomeEmpresa,
      municipioId: data.municipioId,
      documento: data.documento,
      registros: data.registros,
      contato: {
        telefone: data.contato.telefone,
        email: data.contato.email.toLowerCase().trim(),
      },
      endereco: data.endereco,
      historia: data.historia,
      logo: data.logo,
      fotos: data.fotos,
      redesSociais: data.redesSociais,
      ...(data.site !== undefined ? { site: data.site } : {}),
      ativo: data.ativo,
      status: data.status,
      destaque: data.destaque,
    });
    return toProdutorEntity(document);
  }

  async update(id: string, data: UpdateProdutorData): Promise<Produtor | null> {
    const payload: Record<string, unknown> = { ...data };
    const unsetFields: Record<string, string> = {};

    if (data.contato) {
      payload.contato = {
        telefone: data.contato.telefone,
        email: data.contato.email.toLowerCase().trim(),
      };
    }

    if (data.motivoRejeicao === null) {
      unsetFields.motivoRejeicao = "";
      delete payload.motivoRejeicao;
    }

    if (data.site === null) {
      unsetFields.site = "";
      delete payload.site;
    }

    if (Object.keys(unsetFields).length > 0) {
      payload.$unset = unsetFields;
    }

    const document = await ProdutorModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).exec();

    return document ? toProdutorEntity(document) : null;
  }

  async softDelete(id: string): Promise<Produtor | null> {
    const document = await ProdutorModel.findByIdAndUpdate(
      id,
      { ativo: false },
      { new: true, runValidators: true },
    ).exec();

    return document ? toProdutorEntity(document) : null;
  }
}