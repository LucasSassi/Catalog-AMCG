import cors from "cors";
import express, { type Express } from "express";
import { createProdutorController } from "./application/controllers/produtor.controller";
import { createProdutoController } from "./application/controllers/produto.controller";
import { createUsuarioController } from "./application/controllers/usuario.controller";
import { errorHandler } from "./application/middleware/error-handler.middleware";
import {
  CADASTRAR_RATE_LIMIT,
  CATALOG_RATE_LIMIT,
  createRateLimiter,
  LOGIN_RATE_LIMIT,
  type RateLimitPreset,
} from "./application/middleware/rate-limit.middleware";
import { createProdutorService } from "./configuration/factory/produtor.factory";
import { createProdutoService } from "./configuration/factory/produto.factory";
import { createUsuarioService } from "./configuration/factory/usuario.factory";
import type { IProdutorService } from "./domain/produtor/entity/interfaces/produtor.service.interface";
import type { IProdutoService } from "./domain/produto/entity/interfaces/produto.service.interface";
import type { IUsuarioService } from "./domain/usuario/entity/interfaces/usuario.service.interface";

export interface CreateAppRateLimits {
  login?: RateLimitPreset;
  cadastrar?: RateLimitPreset;
  catalog?: RateLimitPreset;
}

export interface CreateAppOptions {
  jwtSecret: string;
  usuarioService?: IUsuarioService;
  produtorService?: IProdutorService;
  produtoService?: IProdutoService;
  rateLimits?: CreateAppRateLimits;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const usuarioService =
    options.usuarioService ?? createUsuarioService(options.jwtSecret);
  const produtorService =
    options.produtorService ?? createProdutorService();
  const produtoService =
    options.produtoService ?? createProdutoService();
  const rateLimits = options.rateLimits ?? {};
  const catalogLimiter = createRateLimiter(
    rateLimits.catalog ?? CATALOG_RATE_LIMIT,
  );

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/produtos/catalogo", catalogLimiter);
  app.use("/api/produtores/catalogo", catalogLimiter);

  app.use(
    "/api/usuarios",
    createUsuarioController({
      usuarioService,
      jwtSecret: options.jwtSecret,
      loginLimiter: createRateLimiter(rateLimits.login ?? LOGIN_RATE_LIMIT),
      cadastrarLimiter: createRateLimiter(
        rateLimits.cadastrar ?? CADASTRAR_RATE_LIMIT,
      ),
    }),
  );

  app.use(
    "/api/produtores",
    createProdutorController({
      produtorService,
      jwtSecret: options.jwtSecret,
    }),
  );

  app.use(
    "/api/produtos",
    createProdutoController({
      produtoService,
      jwtSecret: options.jwtSecret,
    }),
  );

  app.use(errorHandler);

  return app;
}
