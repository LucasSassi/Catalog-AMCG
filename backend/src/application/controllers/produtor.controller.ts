import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../domain/common/errors/app-error";
import {
  E164_PHONE_REGEX,
  REGISTRO_PRODUTOR_TIPO,
  STATUS_PRODUTOR,
  TIPO_DOCUMENTO,
  UF_BRASIL,
  listUfsBrasil,
} from "../../domain/produtor/entity/produtor.constants";
import type { IProdutorService } from "../../domain/produtor/entity/interfaces/produtor.service.interface";
import { createAuthMiddleware } from "../middleware/auth.middleware";

const documentoSchema = z.object({
  tipo: z.enum(TIPO_DOCUMENTO),
  numero: z.string().trim().min(1, "Número do documento é obrigatório"),
});

const registroSchema = z
  .object({
    tipo: z.enum(REGISTRO_PRODUTOR_TIPO),
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

const cadastrarSchema = z.object({
  nomeEmpresa: z.string().trim().min(1, "Nome da empresa é obrigatório"),
  municipioId: z.string().trim().min(1, "Município é obrigatório"),
  documento: documentoSchema,
  registros: z.array(registroSchema).min(1, "Ao menos um registro é obrigatório"),
  contato: contatoSchema,
  endereco: enderecoSchema,
});

const atualizarSchema = z
  .object({
    nomeEmpresa: z
      .string()
      .trim()
      .min(1, "Nome da empresa é obrigatório")
      .optional(),
    municipioId: z.string().trim().min(1, "Município é obrigatório").optional(),
    documento: documentoSchema.optional(),
    registros: z
      .array(registroSchema)
      .min(1, "Ao menos um registro é obrigatório")
      .optional(),
    contato: contatoSchema.optional(),
    endereco: enderecoSchema.optional(),
  })
  .refine(
    (data) =>
      data.nomeEmpresa !== undefined ||
      data.municipioId !== undefined ||
      data.documento !== undefined ||
      data.registros !== undefined ||
      data.contato !== undefined ||
      data.endereco !== undefined,
    { message: "Nenhum campo para atualizar" },
  );

const listQuerySchema = z.object({
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  status: z.enum(STATUS_PRODUTOR).optional(),
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

export interface CreateProdutorControllerOptions {
  produtorService: IProdutorService;
  jwtSecret: string;
}

export function createProdutorController(
  options: CreateProdutorControllerOptions,
): Router {
  const router = Router();
  const { produtorService, jwtSecret } = options;
  const requireAuth = createAuthMiddleware(jwtSecret);

  router.post(
    "/",
    requireAuth,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(cadastrarSchema, request.body);
        const produtor = await produtorService.create(body);
        response.status(201).json(produtor);
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
        const produtores = await produtorService.list(filtros);
        response.status(200).json(produtores);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/ufs",
    requireAuth,
    (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json(listUfsBrasil());
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
        const produtor = await produtorService.getById(getRouteId(request));
        response.status(200).json(produtor);
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
        const produtor = await produtorService.update(
          getRouteId(request),
          body,
        );
        response.status(200).json(produtor);
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
        await produtorService.remove(getRouteId(request));
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
