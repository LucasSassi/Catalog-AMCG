import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../domain/common/errors/app-error";
import {
  CATEGORIA_PRODUTO,
  MAX_FOTOS as MAX_FOTOS_PRODUTO,
  MAX_REGISTROS,
  MIN_FOTOS as MIN_FOTOS_PRODUTO,
  MIN_REGISTROS,
  REGISTRO_PRODUTO_TIPO,
  UNIDADE_MEDIDA,
} from "../../domain/produto/entity/produto.constants";
import type { IProdutoService } from "../../domain/produto/entity/interfaces/produto.service.interface";
import type { CadastrarProdutoInput } from "../../domain/produto/entity/produto.entity";
import {
  E164_PHONE_REGEX,
  MAX_FOTOS as MAX_FOTOS_PRODUTOR,
  MAX_HISTORIA_LENGTH,
  MAX_REDES_SOCIAIS,
  MIN_FOTOS as MIN_FOTOS_PRODUTOR,
  REGISTRO_PRODUTOR_TIPO,
  TIPO_DOCUMENTO,
  TIPO_REDE_SOCIAL,
  UF_BRASIL,
} from "../../domain/produtor/entity/produtor.constants";
import type { IProdutorService } from "../../domain/produtor/entity/interfaces/produtor.service.interface";
import type { CadastrarProdutorInput } from "../../domain/produtor/entity/produtor.entity";
import { createAuthMiddleware } from "../middleware/auth.middleware";

const arquivoSchema = z.object({
  url: z.string().trim().min(1, "URL do arquivo é obrigatória"),
  contentType: z.string().trim().min(1, "Content type é obrigatório"),
  nomeOriginal: z.string().trim().min(1, "Nome original é obrigatório"),
});

const documentoSchema = z.object({
  tipo: z.enum(TIPO_DOCUMENTO),
  numero: z.string().trim().min(1, "Número do documento é obrigatório"),
});

const registroProdutorSchema = z.object({
  tipo: z.enum(REGISTRO_PRODUTOR_TIPO),
  numero: z.string().trim().min(1, "Número do registro é obrigatório"),
  dataEmissao: z.coerce.date().optional(),
  dataValidade: z.coerce.date().optional(),
});

const contatoSchema = z.object({
  telefone: z
    .string()
    .trim()
    .regex(E164_PHONE_REGEX, "Telefone deve estar no formato E.164"),
  email: z.string().trim().email("E-mail inválido"),
});

const enderecoSchema = z.object({
  rua: z.string().trim().min(1, "Rua é obrigatória"),
  bairro: z.string().trim().min(1, "Bairro é obrigatório"),
  cidade: z.string().trim().min(1, "Cidade é obrigatória"),
  estado: z.enum(UF_BRASIL),
});

const redeSocialItemSchema = z.object({
  tipo: z.enum(TIPO_REDE_SOCIAL),
  handle: z.string().trim().min(1, "Handle da rede social é obrigatório"),
});

const redesSociaisSchema = z
  .array(redeSocialItemSchema)
  .max(MAX_REDES_SOCIAIS, `Máximo de ${MAX_REDES_SOCIAIS} redes sociais`)
  .superRefine((items, ctx) => {
    const tipos = new Set<string>();
    for (const [index, item] of items.entries()) {
      if (tipos.has(item.tipo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Não é permitido cadastrar o mesmo tipo de rede social mais de uma vez",
          path: [index, "tipo"],
        });
      }
      tipos.add(item.tipo);
    }
  });

const optionalSiteSchema = z
  .string()
  .trim()
  .url("Site inválido")
  .optional()
  .or(z.literal(""))
  .transform((value) =>
    value === "" || value === undefined ? undefined : value,
  );

const produtorSchema = z.object({
  nomeEmpresa: z.string().trim().min(1, "Nome da empresa é obrigatório"),
  municipioId: z.string().trim().min(1, "Município é obrigatório"),
  documento: documentoSchema,
  registros: z
    .array(registroProdutorSchema)
    .min(1, "Ao menos um registro é obrigatório"),
  contato: contatoSchema,
  endereco: enderecoSchema,
  historia: z
    .string()
    .trim()
    .min(1, "História do produtor é obrigatória")
    .max(
      MAX_HISTORIA_LENGTH,
      `História deve ter no máximo ${MAX_HISTORIA_LENGTH} caracteres`,
    ),
  logo: arquivoSchema,
  fotos: z
    .array(arquivoSchema)
    .min(MIN_FOTOS_PRODUTOR, `Mínimo de ${MIN_FOTOS_PRODUTOR} foto`)
    .max(MAX_FOTOS_PRODUTOR, `Máximo de ${MAX_FOTOS_PRODUTOR} fotos`),
  redesSociais: redesSociaisSchema.optional().default([]),
  site: optionalSiteSchema,
});

const registroProdutoSchema = z
  .object({
    tipo: z.enum(REGISTRO_PRODUTO_TIPO),
    tipoOutros: z.string().trim().optional(),
    numero: z.string().trim().min(1, "Número do registro é obrigatório"),
    dataEmissao: z.coerce.date().optional(),
    dataValidade: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "Outro" && !data.tipoOutros?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "tipoOutros é obrigatório quando o tipo for Outro",
        path: ["tipoOutros"],
      });
    }
  });

const premiacaoSchema = z.object({
  nome: z.string().trim().min(1, "Nome da premiação é obrigatório"),
  descricao: z.string().trim().min(1, "Descrição da premiação é obrigatória"),
  ano: z.coerce.number().int(),
  comprovante: arquivoSchema,
});

const produtoSchema = z.object({
  nome: z.string().trim().min(1, "Nome do produto é obrigatório"),
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  categoria: z.enum(CATEGORIA_PRODUTO),
  unidadeMedida: z.enum(UNIDADE_MEDIDA),
  registros: z
    .array(registroProdutoSchema)
    .min(MIN_REGISTROS, `Ao menos ${MIN_REGISTROS} registro é obrigatório`)
    .max(MAX_REGISTROS, `Máximo de ${MAX_REGISTROS} registros`),
  fotosAvaliacao: z
    .array(arquivoSchema)
    .min(
      MIN_FOTOS_PRODUTO,
      `Ao menos ${MIN_FOTOS_PRODUTO} foto de avaliação é obrigatória`,
    )
    .max(
      MAX_FOTOS_PRODUTO,
      `Máximo de ${MAX_FOTOS_PRODUTO} fotos de avaliação`,
    ),
  fotosDivulgacao: z
    .array(arquivoSchema)
    .min(
      MIN_FOTOS_PRODUTO,
      `Ao menos ${MIN_FOTOS_PRODUTO} foto de divulgação é obrigatória`,
    )
    .max(
      MAX_FOTOS_PRODUTO,
      `Máximo de ${MAX_FOTOS_PRODUTO} fotos de divulgação`,
    ),
  premiacoes: z.array(premiacaoSchema),
  valorCentavos: z.coerce.number().int().min(0, "Valor não pode ser negativo"),
  observacoes: z.string().trim().optional(),
});

const inscricaoSchema = z.object({
  produtor: produtorSchema,
  produtos: z
    .array(produtoSchema)
    .min(1, "Ao menos um produto é obrigatório"),
});

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join("; ");
    throw new ValidationError(message);
  }

  return result.data;
}

export interface CreateInscricaoControllerOptions {
  produtorService: IProdutorService;
  produtoService: IProdutoService;
  jwtSecret: string;
}

export function createInscricaoController(
  options: CreateInscricaoControllerOptions,
): Router {
  const router = Router();
  const { produtorService, produtoService, jwtSecret } = options;
  const requireAuth = createAuthMiddleware(jwtSecret);

  router.post(
    "/",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      let createdProdutorId: string | null = null;
      const createdProdutoIds: string[] = [];

      try {
        const body = parseOrThrow(inscricaoSchema, request.body);
        const produtorInput = body.produtor as CadastrarProdutorInput;

        const produtor = await produtorService.create(produtorInput);
        createdProdutorId = produtor.id;

        const produtos = [];

        for (const produtoBody of body.produtos) {
          const produtoInput: CadastrarProdutoInput = {
            ...produtoBody,
            produtorId: produtor.id,
          };
          const produto =
            await produtoService.createForPendingProducer(produtoInput);
          createdProdutoIds.push(produto.id);
          produtos.push(produto);
        }

        response.status(201).json({ produtor, produtos });
      } catch (error) {
        for (const produtoId of createdProdutoIds) {
          try {
            await produtoService.hardRemove(produtoId);
          } catch {
            // Best-effort rollback
          }
        }

        if (createdProdutorId) {
          try {
            await produtorService.hardRemove(createdProdutorId);
          } catch {
            // Best-effort rollback
          }
        }

        next(error);
      }
    },
  );

  return router;
}
