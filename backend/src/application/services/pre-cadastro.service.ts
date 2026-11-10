import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../domain/common/errors/app-error";
import { TIPO_DOCUMENTO } from "../../domain/produtor/entity/produtor.constants";
import { ProdutorModel } from "../../infraestructure/db/mongo/models/produtor.model";
import { UsuarioModel } from "../../infraestructure/db/mongo/models/usuario.model";

export const documentoVinculoSchema = z
  .object({
    tipo: z.enum(TIPO_DOCUMENTO),
    numero: z.string().trim().min(1).max(100),
  })
  .strict()
  .transform((doc) => ({
    ...doc,
    numero:
      doc.tipo === "CAD_PRO"
        ? doc.numero.replace(/^CAD-/i, "").trim()
        : doc.numero.replace(/\D/g, ""),
  }))
  .refine(
    (doc) =>
      doc.tipo === "CAD_PRO" ||
      doc.numero.length === (doc.tipo === "CPF" ? 11 : 14),
    "Número de documento inválido para o tipo selecionado",
  );

export async function contaSemVinculo(userId: string) {
  const user = await UsuarioModel.findById(userId);
  if (!user) throw new NotFoundError("Conta não encontrada");
  if (user.produtorId)
    throw new ConflictError(
      "Sua conta já possui um produtor vinculado. Acesse Meu perfil ou procure a administração",
    );
  return user;
}

export async function vincularConta(
  userId: string,
  produtorId: string,
  origem: "PRE_CADASTRO" | "INSCRICAO",
) {
  const result = await UsuarioModel.findOneAndUpdate(
    { _id: userId, produtorId: null },
    {
      $set: { produtorId },
      $push: {
        historicoVinculos: {
          usuarioId: userId,
          novo: produtorId,
          origem,
          data: new Date(),
        },
      },
    },
    { new: true },
  );
  if (!result)
    throw new ConflictError(
      "O vínculo da conta mudou. Atualize a página para conferir seu perfil",
    );
}

export class PreCadastroService {
  constructor(private readonly jwtSecret: string) {}
  async consultar(userId: string | undefined, input: unknown) {
    if (userId) await contaSemVinculo(userId);
    const parsed = documentoVinculoSchema.safeParse(input);
    if (!parsed.success)
      throw new ValidationError(
        parsed.error.issues.map((i) => i.message).join("; "),
      );
    const documento = parsed.data;
    const numeros =
      documento.tipo === "CAD_PRO"
        ? [documento.numero, `CAD-${documento.numero}`]
        : [documento.numero];
    const encontrados = await ProdutorModel.find({
      "documento.tipo": documento.tipo,
      "documento.numero": { $in: numeros },
    }).limit(2);
    if (!encontrados.length) return { encontrado: false as const };
    if (encontrados.length > 1)
      throw new ConflictError(
        "Encontramos mais de um pré-cadastro para esse documento. Procure a administração para conferir o vínculo",
      );
    const producer = encontrados[0];
    const claims = {
        produtorId: String(producer._id),
        atualizadoEm: producer.updatedAt?.toISOString() ?? null,
        documento,
      };
    const confirmacaoToken = jwt.sign(claims, this.jwtSecret, {
      ...(userId ? { subject: userId } : {}),
      audience: "vinculo-pre-cadastro",
      expiresIn: "10m",
    });
    return {
      encontrado: true as const,
      confirmacaoToken,
      produtor: {
        revisao: producer.revisao ?? 0,
        nomeEmpresa: producer.nomeEmpresa,
        historia: producer.historia,
        ...(producer.logo ? { logo: producer.logo } : {}),
        fotos: producer.fotos ?? [],
        municipio: producer.endereco.cidade,
        documento,
      },
    };
  }
  async confirmar(userId: string, token: string) {
    await contaSemVinculo(userId);
    let payload: jwt.JwtPayload;
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        audience: "vinculo-pre-cadastro",
      });
      if (typeof decoded === "string") throw new Error();
      if (decoded.sub && decoded.sub !== userId) throw new Error();
      payload = decoded;
    } catch {
      throw new ValidationError(
        "Confirmação inválida ou expirada. Consulte seu documento novamente",
      );
    }
    const producer = await ProdutorModel.findById(payload.produtorId);
    const numeroDocumentoAtual = producer
      ? producer.documento.tipo === "CAD_PRO"
        ? producer.documento.numero.replace(/^CAD-/i, "").trim()
        : producer.documento.numero.replace(/\D/g, "")
      : null;
    if (
      !producer ||
      (producer.updatedAt?.toISOString() ?? null) !== payload.atualizadoEm ||
      producer.documento.tipo !== payload.documento?.tipo ||
      numeroDocumentoAtual !== payload.documento?.numero
    )
      throw new ConflictError(
        "O pré-cadastro foi atualizado. Consulte e confira os dados novamente",
      );
    await vincularConta(userId, String(producer._id), "PRE_CADASTRO");
    return { vinculado: true, revisarPerfil: true };
  }
}
