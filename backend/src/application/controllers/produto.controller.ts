import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../domain/common/errors/app-error";
import {
  CATEGORIA_PRODUTO,
  MAX_FOTOS,
  MAX_REGISTROS,
  MIN_FOTOS,
  MIN_REGISTROS,
  REGISTRO_PRODUTO_TIPO,
  STATUS_PRODUTO,
  UNIDADE_MEDIDA,
  listCategoriasProduto,
  listUnidadesMedida,
} from "../../domain/produto/entity/produto.constants";
import type { IProdutoService } from "../../domain/produto/entity/interfaces/produto.service.interface";
import { createAuthMiddleware } from "../middleware/auth.middleware";

const arquivoSchema = z.object({
  url: z.string().trim().min(1, "URL do arquivo é obrigatória"),
  contentType: z.string().trim().min(1, "Content type é obrigatório"),
  nomeOriginal: z.string().trim().min(1, "Nome original é obrigatório"),
});

const registroSchema = z
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

const cadastrarSchema = z.object({
  produtorId: z.string().trim().min(1, "Produtor é obrigatório"),
  nome: z.string().trim().min(1, "Nome do produto é obrigatório"),
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  categoria: z.enum(CATEGORIA_PRODUTO),
  unidadeMedida: z.enum(UNIDADE_MEDIDA),
  registros: z
    .array(registroSchema)
    .min(MIN_REGISTROS, `Ao menos ${MIN_REGISTROS} registro é obrigatório`)
    .max(MAX_REGISTROS, `Máximo de ${MAX_REGISTROS} registros`),
  fotosAvaliacao: z
    .array(arquivoSchema)
    .min(MIN_FOTOS, `Ao menos ${MIN_FOTOS} foto de avaliação é obrigatória`)
    .max(MAX_FOTOS, `Máximo de ${MAX_FOTOS} fotos de avaliação`),
  fotosDivulgacao: z
    .array(arquivoSchema)
    .min(MIN_FOTOS, `Ao menos ${MIN_FOTOS} foto de divulgação é obrigatória`)
    .max(MAX_FOTOS, `Máximo de ${MAX_FOTOS} fotos de divulgação`),
  premiacoes: z.array(premiacaoSchema),
  valorCentavos: z.coerce.number().int().min(0, "Valor não pode ser negativo"),
  observacoes: z.string().trim().optional(),
});

const atualizarSchema = z
  .object({
    produtorId: z.string().trim().min(1, "Produtor é obrigatório").optional(),
    nome: z.string().trim().min(1, "Nome do produto é obrigatório").optional(),
    descricao: z.string().trim().min(1, "Descrição é obrigatória").optional(),
    categoria: z.enum(CATEGORIA_PRODUTO).optional(),
    unidadeMedida: z.enum(UNIDADE_MEDIDA).optional(),
    registros: z
      .array(registroSchema)
      .min(MIN_REGISTROS, `Ao menos ${MIN_REGISTROS} registro é obrigatório`)
      .max(MAX_REGISTROS, `Máximo de ${MAX_REGISTROS} registros`)
      .optional(),
    fotosAvaliacao: z
      .array(arquivoSchema)
      .min(MIN_FOTOS, `Ao menos ${MIN_FOTOS} foto de avaliação é obrigatória`)
      .max(MAX_FOTOS, `Máximo de ${MAX_FOTOS} fotos de avaliação`)
      .optional(),
    fotosDivulgacao: z
      .array(arquivoSchema)
      .min(MIN_FOTOS, `Ao menos ${MIN_FOTOS} foto de divulgação é obrigatória`)
      .max(MAX_FOTOS, `Máximo de ${MAX_FOTOS} fotos de divulgação`)
      .optional(),
    premiacoes: z.array(premiacaoSchema).optional(),
    valorCentavos: z.coerce
      .number()
      .int()
      .min(0, "Valor não pode ser negativo")
      .optional(),
    observacoes: z.string().trim().optional(),
    status: z.enum(STATUS_PRODUTO).optional(),
    motivoRejeicao: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "REJEITADO" && !data.motivoRejeicao?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motivo da rejeição é obrigatório quando o status for REJEITADO",
        path: ["motivoRejeicao"],
      });
    }
  })
  .refine(
    (data) =>
      data.produtorId !== undefined ||
      data.nome !== undefined ||
      data.descricao !== undefined ||
      data.categoria !== undefined ||
      data.unidadeMedida !== undefined ||
      data.registros !== undefined ||
      data.fotosAvaliacao !== undefined ||
      data.fotosDivulgacao !== undefined ||
      data.premiacoes !== undefined ||
      data.valorCentavos !== undefined ||
      data.observacoes !== undefined ||
      data.status !== undefined ||
      data.motivoRejeicao !== undefined,
    { message: "Nenhum campo para atualizar" },
  );

const listQuerySchema = z.object({
  produtorId: z.string().trim().min(1).optional(),
  categoria: z.enum(CATEGORIA_PRODUTO).optional(),
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  status: z.enum(STATUS_PRODUTO).optional(),
});

const catalogQuerySchema = z.object({
  busca: z.string().trim().optional(),
  categoria: z.enum(CATEGORIA_PRODUTO).optional(),
  municipio: z.string().trim().optional(),
});

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join("; ");
    throw new ValidationError(message);
  }

  return result.data;
}

function getRouteId(request: Request): string {
  const id = request.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export interface CreateProdutoControllerOptions {
  produtoService: IProdutoService;
  jwtSecret: string;
}

export function createProdutoController(
  options: CreateProdutoControllerOptions,
): Router {
  const router = Router();
  const { produtoService, jwtSecret } = options;
  const requireAuth = createAuthMiddleware(jwtSecret);

  router.get(
    "/catalogo",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const filtros = parseOrThrow(catalogQuerySchema, request.query);
        const catalogo = await produtoService.listCatalog(filtros);
        response.status(200).json(catalogo);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(cadastrarSchema, request.body);
        const produto = await produtoService.create(body);
        response.status(201).json(produto);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const filtros = parseOrThrow(listQuerySchema, request.query);
        const produtos = await produtoService.list(filtros);
        response.status(200).json(produtos);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/categorias",
    requireAuth,
    (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json(listCategoriasProduto());
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/unidades-medida",
    requireAuth,
    (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json(listUnidadesMedida());
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/:id",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const produto = await produtoService.getById(getRouteId(request));
        response.status(200).json(produto);
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    "/:id",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(atualizarSchema, request.body);
        const produto = await produtoService.update(getRouteId(request), body);
        response.status(200).json(produto);
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    "/:id",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        await produtoService.remove(getRouteId(request));
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
