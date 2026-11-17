import { isValidObjectId, model, Schema } from "mongoose";
import type {
  CodigoVerificacao,
  CriarCodigoVerificacaoData,
  ICodigoVerificacaoRepository,
} from "../../../application/services/verificacao/codigo-verificacao.repository";

interface CodigoVerificacaoDocument {
  produtorId: string;
  codigoHash: string;
  tentativas: number;
  expiraEm: Date;
  createdAt: Date;
}

const codigoVerificacaoSchema = new Schema<CodigoVerificacaoDocument>(
  {
    produtorId: { type: String, required: true, index: true },
    codigoHash: { type: String, required: true },
    tentativas: { type: Number, required: true, default: 0 },
    // Índice TTL: o MongoDB apaga o desafio sozinho depois de expirar.
    expiraEm: { type: Date, required: true, expires: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const CodigoVerificacaoModel = model<CodigoVerificacaoDocument>(
  "CodigoVerificacao",
  codigoVerificacaoSchema,
  "codigos_verificacao",
);

function toEntity(
  document: CodigoVerificacaoDocument & { _id: unknown },
): CodigoVerificacao {
  return {
    id: String(document._id),
    produtorId: document.produtorId,
    codigoHash: document.codigoHash,
    tentativas: document.tentativas,
    expiraEm: document.expiraEm,
    criadoEm: document.createdAt,
  };
}

export class CodigoVerificacaoRepository
  implements ICodigoVerificacaoRepository
{
  async findUltimoPorProdutor(
    produtorId: string,
  ): Promise<CodigoVerificacao | null> {
    const document = await CodigoVerificacaoModel.findOne({ produtorId })
      .sort({ createdAt: -1 })
      .lean();
    return document ? toEntity(document) : null;
  }

  async findById(id: string): Promise<CodigoVerificacao | null> {
    if (!isValidObjectId(id)) return null;
    const document = await CodigoVerificacaoModel.findById(id).lean();
    return document ? toEntity(document) : null;
  }

  async substituir(
    data: CriarCodigoVerificacaoData,
  ): Promise<CodigoVerificacao> {
    await CodigoVerificacaoModel.deleteMany({ produtorId: data.produtorId });
    const document = await CodigoVerificacaoModel.create(data);
    return toEntity(document.toObject());
  }

  async registrarTentativa(id: string): Promise<number> {
    const document = await CodigoVerificacaoModel.findByIdAndUpdate(
      id,
      { $inc: { tentativas: 1 } },
      { new: true },
    ).lean();
    return document?.tentativas ?? Number.POSITIVE_INFINITY;
  }

  async delete(id: string): Promise<void> {
    await CodigoVerificacaoModel.deleteOne({ _id: id });
  }
}
