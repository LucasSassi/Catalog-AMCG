import type { Produto } from "../../../../domain/produto/entity/produto.entity";
import type { ProdutoModelDocument } from "../../../db/mongo/models/produto.model";

function mapArquivo(arquivo: ProdutoModelDocument["fotosAvaliacao"][number]) {
  return {
    url: arquivo.url,
    contentType: arquivo.contentType,
    nomeOriginal: arquivo.nomeOriginal,
  };
}

function mapRegistro(
  registro: ProdutoModelDocument["registros"][number],
): Produto["registros"][number] {
  return {
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
  };
}

function mapPremiacao(
  premiacao: ProdutoModelDocument["premiacoes"][number],
): Produto["premiacoes"][number] {
  return {
    nome: premiacao.nome,
    descricao: premiacao.descricao,
    ano: premiacao.ano,
    comprovante: mapArquivo(premiacao.comprovante),
  };
}

export function toProdutoEntity(document: ProdutoModelDocument): Produto {
  return {
    id: document._id.toString(),
    produtorId: document.produtorId,
    nome: document.nome,
    descricao: document.descricao,
    categoria: document.categoria,
    unidadeMedida: document.unidadeMedida,
    registros: document.registros.map(mapRegistro),
    fotosAvaliacao: document.fotosAvaliacao.map(mapArquivo),
    fotosDivulgacao: document.fotosDivulgacao.map(mapArquivo),
    premiacoes: document.premiacoes.map(mapPremiacao),
    valorCentavos: document.valorCentavos,
    ...(document.observacoes !== undefined
      ? { observacoes: document.observacoes }
      : {}),
    ativo: document.ativo,
    status: document.status,
    ...(document.motivoRejeicao !== undefined
      ? { motivoRejeicao: document.motivoRejeicao }
      : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
