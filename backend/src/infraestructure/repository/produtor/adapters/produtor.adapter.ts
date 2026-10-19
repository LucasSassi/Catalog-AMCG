import type { Produtor } from "../../../../domain/produtor/entity/produtor.entity";
import type { ProdutorModelDocument } from "../../../db/mongo/models/produtor.model";

export function toProdutorEntity(document: ProdutorModelDocument): Produtor {
  return {
    id: document._id.toString(),
    nomeEmpresa: document.nomeEmpresa,
    municipioId: document.municipioId,
    documento: {
      tipo: document.documento.tipo,
      numero: document.documento.numero,
    },
    registros: document.registros.map((registro) => ({
      tipo: registro.tipo,
      numero: registro.numero,
      ...(registro.dataEmissao !== undefined
        ? { dataEmissao: registro.dataEmissao }
        : {}),
      ...(registro.dataValidade !== undefined
        ? { dataValidade: registro.dataValidade }
        : {}),
    })),
    contato: {
      telefone: document.contato.telefone,
      email: document.contato.email,
    },
    endereco: {
      rua: document.endereco.rua,
      bairro: document.endereco.bairro,
      cidade: document.endereco.cidade,
      estado: document.endereco.estado,
    },
    historia: document.historia ?? "",
    ...(document.logo !== undefined
      ? {
          logo: {
            url: document.logo.url,
            contentType: document.logo.contentType,
            nomeOriginal: document.logo.nomeOriginal,
          },
        }
      : {}),
    fotos: (document.fotos ?? []).map((foto) => ({
      url: foto.url,
      contentType: foto.contentType,
      nomeOriginal: foto.nomeOriginal,
    })),
    redesSociais: (document.redesSociais ?? []).map((rede) => ({
      tipo: rede.tipo,
      handle: rede.handle,
    })),
    ...(document.site !== undefined && document.site !== ""
      ? { site: document.site }
      : {}),
    ativo: document.ativo,
    status: document.status,
    destaque: document.destaque ?? false,
    ...(document.motivoRejeicao !== undefined
      ? { motivoRejeicao: document.motivoRejeicao }
      : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
