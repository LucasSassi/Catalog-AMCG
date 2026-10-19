import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../domain/common/errors/app-error";
import {
  E164_PHONE_REGEX,
  MAX_FOTOS,
  MAX_HISTORIA_LENGTH,
  MAX_REDES_SOCIAIS,
  MIN_FOTOS,
  REGISTRO_PRODUTOR_TIPO,
  STATUS_PRODUTOR,
  TIPO_DOCUMENTO,
  TIPO_REDE_SOCIAL,
  UF_BRASIL,
  listUfsBrasil,
} from "../../domain/produtor/entity/produtor.constants";
import type { IProdutorService } from "../../domain/produtor/entity/interfaces/produtor.service.interface";
import {
  createAuthMiddleware,
  createRequireAdmin,
} from "../middleware/auth.middleware";

const documentoSchema = z.object({
  tipo: z.enum(TIPO_DOCUMENTO),
  numero: z.string().trim().min(1, "Número do documento é obrigatório"),
});

const registroSchema = z.object({
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

const arquivoSchema = z.object({
  url: z.string().trim().min(1, "URL do arquivo é obrigatória"),
  contentType: z.string().trim().min(1, "Content type é obrigatório"),
  nomeOriginal: z.string().trim().min(1, "Nome original é obrigatório"),
});

const fotosSchema = z
  .array(arquivoSchema)
  .min(MIN_FOTOS, `Mínimo de ${MIN_FOTOS} foto`)
  .max(MAX_FOTOS, `Máximo de ${MAX_FOTOS} fotos`);

const historiaSchema = z
  .string()
  .trim()
  .min(1, "História do produtor é obrigatória")
  .max(
    MAX_HISTORIA_LENGTH,
    `História deve ter no máximo ${MAX_HISTORIA_LENGTH} caracteres`,
  );

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
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const cadastrarSchema = z.object({
  nomeEmpresa: z.string().trim().min(1, "Nome da empresa é obrigatório"),
  municipioId: z.string().trim().min(1, "Município é obrigatório"),
  documento: documentoSchema,
  registros: z.array(registroSchema).min(1, "Ao menos um registro é obrigatório"),
  contato: contatoSchema,
  endereco: enderecoSchema,
  historia: historiaSchema,
  logo: arquivoSchema,
  fotos: fotosSchema,
  redesSociais: redesSociaisSchema.optional().default([]),
  site: optionalSiteSchema,
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
    historia: historiaSchema.optional(),
    logo: arquivoSchema.optional(),
    fotos: fotosSchema.optional(),
    redesSociais: redesSociaisSchema.optional(),
    site: z
      .union([z.string().trim().url("Site inválido"), z.literal(""), z.null()])
      .optional(),
    status: z.enum(STATUS_PRODUTOR).optional(),
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
      data.nomeEmpresa !== undefined ||
      data.municipioId !== undefined ||
      data.documento !== undefined ||
      data.registros !== undefined ||
      data.contato !== undefined ||
      data.endereco !== undefined ||
      data.historia !== undefined ||
      data.logo !== undefined ||
      data.fotos !== undefined ||
      data.redesSociais !== undefined ||
      data.site !== undefined ||
      data.status !== undefined ||
      data.motivoRejeicao !== undefined,
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

const destaqueSchema = z.object({
  destaque: z.boolean(),
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
  const requireAdmin = createRequireAdmin(jwtSecret);

  router.get(
    "/catalogo",
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        const catalogo = await produtorService.listCatalog();
        response.status(200).json(catalogo);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/catalogo/:id",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const produtor = await produtorService.getCatalogById(getRouteId(request));
        response.status(200).json(produtor);
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
        const produtor = await produtorService.create(body);
        response.status(201).json(produtor);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/",
    requireAdmin,
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
    requireAdmin,
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
    requireAdmin,
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
    requireAdmin,
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

  router.patch(
    "/:id/destaque",
    requireAdmin,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(destaqueSchema, request.body);
        const produtor = await produtorService.setDestaque(
          getRouteId(request),
          body.destaque,
        );
        response.status(200).json(produtor);
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    "/:id",
    requireAdmin,
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
