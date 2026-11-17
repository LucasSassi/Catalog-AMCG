import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../domain/common/errors/app-error";
import { TIPO_DOCUMENTO } from "../../domain/produtor/entity/produtor.constants";
import {
  ProdutorModel,
  type ProdutorModelDocument,
} from "../../infraestructure/db/mongo/models/produtor.model";
import { UsuarioModel } from "../../infraestructure/db/mongo/models/usuario.model";
import { CodigoVerificacaoRepository } from "../../infraestructure/repository/verificacao/codigo-verificacao.repository";
import { ConsoleEmailSender, type IEmailSender } from "./email/email-sender";
import type { ICodigoVerificacaoRepository } from "./verificacao/codigo-verificacao.repository";

export const documentoVinculoSchema = z
  .object({
    tipo: z.enum(TIPO_DOCUMENTO),
    numero: z.string().trim().min(1).max(100),
  })
  .strict()
  .transform((doc) => ({
    ...doc,
    numero: normalizarNumeroDocumento(doc.tipo, doc.numero),
  }))
  .refine(
    (doc) =>
      doc.tipo === "CAD_PRO" ||
      doc.numero.length === (doc.tipo === "CPF" ? 11 : 14),
    "Número de documento inválido para o tipo selecionado",
  );

export const CODIGO_VERIFICACAO_TAMANHO = 6;
export const CODIGO_VERIFICACAO_VALIDADE_MINUTOS = 10;
export const CODIGO_VERIFICACAO_MAX_TENTATIVAS = 5;
/** Intervalo mínimo entre dois e-mails para o mesmo pré-cadastro. */
export const CODIGO_VERIFICACAO_REENVIO_SEGUNDOS = 60;

export const verificarCodigoSchema = z
  .object({
    verificacaoId: z.string().trim().min(1, "Verificação é obrigatória"),
    codigo: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Informe o código de 6 dígitos enviado por e-mail"),
  })
  .strict();

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

/** "joao.silva@gmail.com" -> "jo***@g***.com" */
export function mascararEmail(email: string): string {
  const [local = "", dominio = ""] = email.trim().split("@");
  const ponto = dominio.lastIndexOf(".");
  const nomeDominio = ponto > 0 ? dominio.slice(0, ponto) : dominio;
  const tld = ponto > 0 ? dominio.slice(ponto) : "";
  return `${local.slice(0, Math.min(2, local.length))}***@${nomeDominio.charAt(0)}***${tld}`;
}

export interface PreCadastroDeps {
  emailSender?: IEmailSender;
  codigos?: ICodigoVerificacaoRepository;
  agora?: () => Date;
  gerarCodigo?: () => string;
}

/**
 * Vínculo de conta a um pré-cadastro existente:
 * 1. `consultar`: acha o pré-cadastro pelo documento e envia um código para o
 *    e-mail que JÁ estava no cadastro (não devolve nenhum dado do produtor);
 * 2. `verificar`: com o código certo, devolve os dados e o `confirmacaoToken`;
 * 3. `confirmar`: vincula a conta autenticada usando esse token.
 * Assim, quem só sabe o número do documento não consegue tomar o perfil.
 */
export class PreCadastroService {
  private readonly emailSender: IEmailSender;
  private readonly codigos: ICodigoVerificacaoRepository;
  private readonly agora: () => Date;
  private readonly gerarCodigo: () => string;

  constructor(
    private readonly jwtSecret: string,
    deps: PreCadastroDeps = {},
  ) {
    this.emailSender = deps.emailSender ?? new ConsoleEmailSender();
    this.codigos = deps.codigos ?? new CodigoVerificacaoRepository();
    this.agora = deps.agora ?? (() => new Date());
    this.gerarCodigo =
      deps.gerarCodigo ??
      (() =>
        String(randomInt(0, 10 ** CODIGO_VERIFICACAO_TAMANHO)).padStart(
          CODIGO_VERIFICACAO_TAMANHO,
          "0",
        ));
  }

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
    const produtorId = String(producer._id);
    const email = producer.contato?.email?.trim();
    if (!email)
      throw new ConflictError(
        "Encontramos seu pré-cadastro, mas ele não tem e-mail para confirmarmos que é você. Procure a administração para atualizar o e-mail",
      );

    const emailMascarado = mascararEmail(email);
    const agora = this.agora();
    const ultimo = await this.codigos.findUltimoPorProdutor(produtorId);
    const segundosDesdeUltimo = ultimo
      ? (agora.getTime() - ultimo.criadoEm.getTime()) / 1000
      : Number.POSITIVE_INFINITY;

    // Evita disparar vários e-mails seguidos: reaproveita o desafio recente.
    if (
      ultimo &&
      ultimo.expiraEm > agora &&
      segundosDesdeUltimo < CODIGO_VERIFICACAO_REENVIO_SEGUNDOS
    ) {
      return {
        encontrado: true as const,
        verificacaoId: ultimo.id,
        emailMascarado,
        reenvioEmSegundos: Math.ceil(
          CODIGO_VERIFICACAO_REENVIO_SEGUNDOS - segundosDesdeUltimo,
        ),
      };
    }

    const codigo = this.gerarCodigo();
    const desafio = await this.codigos.substituir({
      produtorId,
      codigoHash: this.hashCodigo(produtorId, codigo),
      expiraEm: new Date(
        agora.getTime() + CODIGO_VERIFICACAO_VALIDADE_MINUTOS * 60 * 1000,
      ),
    });

    try {
      await this.emailSender.send(
        montarEmailCodigo(email, producer.nomeEmpresa, codigo),
      );
    } catch (error) {
      await this.codigos.delete(desafio.id);
      console.error("Falha ao enviar código de verificação", error);
      throw new AppError(
        "Não foi possível enviar o código por e-mail agora. Tente novamente em alguns minutos",
        503,
      );
    }

    return {
      encontrado: true as const,
      verificacaoId: desafio.id,
      emailMascarado,
      reenvioEmSegundos: CODIGO_VERIFICACAO_REENVIO_SEGUNDOS,
    };
  }

  /** Confere o código enviado por e-mail e só então libera os dados do pré-cadastro. */
  async verificar(userId: string | undefined, input: unknown) {
    if (userId) await contaSemVinculo(userId);
    const parsed = verificarCodigoSchema.safeParse(input);
    if (!parsed.success)
      throw new ValidationError(
        parsed.error.issues.map((i) => i.message).join("; "),
      );
    const { verificacaoId, codigo } = parsed.data;

    const desafio = await this.codigos.findById(verificacaoId);
    if (!desafio || desafio.expiraEm <= this.agora())
      throw new ValidationError(
        "Código expirado ou inválido. Consulte seu documento novamente para receber um novo código",
      );

    if (desafio.tentativas >= CODIGO_VERIFICACAO_MAX_TENTATIVAS) {
      await this.codigos.delete(desafio.id);
      throw new ValidationError(
        "Muitas tentativas incorretas. Consulte seu documento novamente para receber um novo código",
      );
    }

    if (!this.codigoConfere(desafio.produtorId, codigo, desafio.codigoHash)) {
      const tentativas = await this.codigos.registrarTentativa(desafio.id);
      const restantes = CODIGO_VERIFICACAO_MAX_TENTATIVAS - tentativas;
      if (restantes <= 0) {
        await this.codigos.delete(desafio.id);
        throw new ValidationError(
          "Código incorreto. Você atingiu o limite de tentativas; consulte seu documento novamente para receber um novo código",
        );
      }
      throw new ValidationError(
        `Código incorreto. Você tem mais ${restantes} ${restantes === 1 ? "tentativa" : "tentativas"}`,
      );
    }

    // Código de uso único.
    await this.codigos.delete(desafio.id);

    const producer = await ProdutorModel.findById(desafio.produtorId);
    if (!producer)
      throw new NotFoundError(
        "Pré-cadastro não encontrado. Procure a administração",
      );

    return this.liberarPreCadastro(userId, producer);
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
      ? normalizarNumeroDocumento(
          producer.documento.tipo,
          producer.documento.numero,
        )
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

  private liberarPreCadastro(
    userId: string | undefined,
    producer: ProdutorModelDocument,
  ) {
    const documento = {
      tipo: producer.documento.tipo,
      numero: normalizarNumeroDocumento(
        producer.documento.tipo,
        producer.documento.numero,
      ),
    };
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
        ...(producer.contato
          ? {
              contato: {
                telefone: producer.contato.telefone,
                email: producer.contato.email,
              },
            }
          : {}),
        ...(producer.logo ? { logo: producer.logo } : {}),
        fotos: producer.fotos ?? [],
        municipio: producer.endereco.cidade,
        documento,
      },
    };
  }

  private hashCodigo(produtorId: string, codigo: string): string {
    return createHmac("sha256", this.jwtSecret)
      .update(`pre-cadastro:${produtorId}:${codigo}`)
      .digest("hex");
  }

  private codigoConfere(
    produtorId: string,
    codigo: string,
    hashEsperado: string,
  ): boolean {
    const recebido = Buffer.from(this.hashCodigo(produtorId, codigo), "hex");
    const esperado = Buffer.from(hashEsperado, "hex");
    return (
      recebido.length === esperado.length && timingSafeEqual(recebido, esperado)
    );
  }
}

function normalizarNumeroDocumento(tipo: string, numero: string): string {
  return tipo === "CAD_PRO"
    ? numero.replace(/^CAD-/i, "").trim()
    : numero.replace(/\D/g, "");
}

function montarEmailCodigo(to: string, nomeEmpresa: string, codigo: string) {
  const aviso = `Ele vale por ${CODIGO_VERIFICACAO_VALIDADE_MINUTOS} minutos. Se você não pediu este código, ignore este e-mail: ninguém terá acesso ao seu cadastro sem ele.`;
  return {
    to,
    subject: "Seu código de verificação — Catálogo dos Campos Gerais",
    text: [
      `Olá, ${nomeEmpresa}!`,
      "",
      `Seu código de verificação é: ${codigo}`,
      "",
      aviso,
    ].join("\n"),
    html: `<p>Olá, ${escapeHtml(nomeEmpresa)}!</p><p>Seu código de verificação é:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${codigo}</p><p>${aviso}</p>`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
