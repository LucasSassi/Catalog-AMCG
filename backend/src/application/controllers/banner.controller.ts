import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../domain/common/errors/app-error";
import {
  BANNER_VARIANTES,
  MAX_TEXTO_ALTERNATIVO_LENGTH,
  MAX_TITULO_LENGTH,
} from "../../domain/banner/entity/banner.constants";
import type { IBannerService } from "../../domain/banner/entity/interfaces/banner.service.interface";
import { createRequireAdmin } from "../middleware/auth.middleware";

const imagemSchema = z.object({
  url: z.string().trim().min(1, "Imagem é obrigatória"),
  contentType: z.string().trim().min(1, "Content type é obrigatório"),
  nomeOriginal: z.string().trim().min(1, "Nome original é obrigatório"),
  largura: z.coerce.number().int().positive().optional(),
  altura: z.coerce.number().int().positive().optional(),
});

const tituloSchema = z
  .string()
  .trim()
  .min(1, "Título é obrigatório")
  .max(MAX_TITULO_LENGTH, `Título deve ter no máximo ${MAX_TITULO_LENGTH} caracteres`);

const textoAlternativoSchema = z
  .string()
  .trim()
  .min(1, "Descrição da imagem é obrigatória")
  .max(
    MAX_TEXTO_ALTERNATIVO_LENGTH,
    `Descrição da imagem deve ter no máximo ${MAX_TEXTO_ALTERNATIVO_LENGTH} caracteres`,
  );

const nullableDate = z.null().or(z.coerce.date());

const cadastrarSchema = z.object({
  titulo: tituloSchema,
  textoAlternativo: textoAlternativoSchema,
  imagem: imagemSchema,
  imagemMobile: imagemSchema.optional(),
  link: z.string().trim().optional(),
  ativo: z.boolean().optional(),
  inicioEm: z.coerce.date().optional(),
  fimEm: z.coerce.date().optional(),
});

const atualizarSchema = z.object({
  titulo: tituloSchema.optional(),
  textoAlternativo: textoAlternativoSchema.optional(),
  imagem: imagemSchema.optional(),
  imagemMobile: z.null().or(imagemSchema).optional(),
  link: z.null().or(z.string().trim()).optional(),
  ativo: z.boolean().optional(),
  inicioEm: nullableDate.optional(),
  fimEm: nullableDate.optional(),
});

const ativoSchema = z.object({ ativo: z.boolean() });

const ordemSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, "Informe a nova ordem"),
});

const imagemQuerySchema = z.object({
  variante: z.enum(BANNER_VARIANTES).optional(),
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

export interface CreateBannerControllerOptions {
  bannerService: IBannerService;
  jwtSecret: string;
}

export function createBannerController(
  options: CreateBannerControllerOptions,
): Router {
  const router = Router();
  const { bannerService, jwtSecret } = options;
  const requireAdmin = createRequireAdmin(jwtSecret);

  router.get(
    "/catalogo",
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json(await bannerService.listCatalogo());
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/:id/imagem",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { variante } = parseOrThrow(imagemQuerySchema, request.query);
        const arquivo = await bannerService.getImagem(
          getRouteId(request),
          variante ?? "desktop",
        );

        // A URL pública leva a versão (?v=updatedAt), então pode ser cacheada.
        response.setHeader("Content-Type", arquivo.contentType);
        response.setHeader(
          "Cache-Control",
          request.query.v
            ? "public, max-age=31536000, immutable"
            : "public, max-age=300",
        );
        response.status(200).send(arquivo.buffer);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/",
    requireAdmin,
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json(await bannerService.list());
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/",
    requireAdmin,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(cadastrarSchema, request.body);
        response.status(201).json(await bannerService.cadastrar(body));
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    "/ordem",
    requireAdmin,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = parseOrThrow(ordemSchema, request.body);
        response.status(200).json(await bannerService.reordenar(ids));
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
        response.status(200).json(await bannerService.getById(getRouteId(request)));
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
        response
          .status(200)
          .json(await bannerService.update(getRouteId(request), body));
      } catch (error) {
        next(error);
      }
    },
  );

  router.patch(
    "/:id/ativo",
    requireAdmin,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ativo } = parseOrThrow(ativoSchema, request.body);
        response
          .status(200)
          .json(await bannerService.setAtivo(getRouteId(request), ativo));
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
        await bannerService.remove(getRouteId(request));
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
