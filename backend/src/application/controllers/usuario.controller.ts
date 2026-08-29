import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../domain/common/errors/app-error";
import { MIN_SENHA_LENGTH } from "../../domain/usuario/entity/usuario.constants";
import type { IUsuarioService } from "../../domain/usuario/entity/interfaces/usuario.service.interface";
import { createAuthMiddleware } from "../middleware/auth.middleware";

const cadastrarSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("E-mail inválido"),
  senha: z
    .string()
    .min(MIN_SENHA_LENGTH, `Senha deve ter no mínimo ${MIN_SENHA_LENGTH} caracteres`),
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

const atualizarSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome é obrigatório").optional(),
    email: z.string().trim().email("E-mail inválido").optional(),
    senha: z
      .string()
      .min(
        MIN_SENHA_LENGTH,
        `Senha deve ter no mínimo ${MIN_SENHA_LENGTH} caracteres`,
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.nome !== undefined ||
      data.email !== undefined ||
      data.senha !== undefined,
    { message: "Nenhum campo para atualizar" },
  );

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

export interface CreateUsuarioControllerOptions {
  usuarioService: IUsuarioService;
  jwtSecret: string;
}

export function createUsuarioController(
  options: CreateUsuarioControllerOptions,
): Router {
  const router = Router();
  const { usuarioService, jwtSecret } = options;
  const requireAuth = createAuthMiddleware(jwtSecret);

  router.post(
    "/cadastrar",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(cadastrarSchema, request.body);
        const usuario = await usuarioService.cadastrar(body);
        response.status(201).json(usuario);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/login",
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = parseOrThrow(loginSchema, request.body);
        const result = await usuarioService.login(body);
        response.status(200).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/",
    requireAuth,
    async (_request: Request, response: Response, next: NextFunction) => {
      try {
        const usuarios = await usuarioService.list();
        response.status(200).json(usuarios);
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
        const usuario = await usuarioService.getById(getRouteId(request));
        response.status(200).json(usuario);
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
        const usuario = await usuarioService.update(getRouteId(request), body);
        response.status(200).json(usuario);
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
        await usuarioService.remove(getRouteId(request));
        response.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
