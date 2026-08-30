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
      ...(registro.tipoOutros !== undefined
        ? { tipoOutros: registro.tipoOutros }
        : {}),
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
    ativo: document.ativo,
    status: document.status,
    ...(document.motivoRejeicao !== undefined
      ? { motivoRejeicao: document.motivoRejeicao }
      : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
