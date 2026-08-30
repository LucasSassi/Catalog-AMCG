import cors from "cors";
import express, { type Express } from "express";
import { createProdutorController } from "./application/controllers/produtor.controller";
import { createUsuarioController } from "./application/controllers/usuario.controller";
import { errorHandler } from "./application/middleware/error-handler.middleware";
import { createProdutorService } from "./configuration/factory/produtor.factory";
import { createUsuarioService } from "./configuration/factory/usuario.factory";
import type { IProdutorService } from "./domain/produtor/entity/interfaces/produtor.service.interface";
import type { IUsuarioService } from "./domain/usuario/entity/interfaces/usuario.service.interface";

export interface CreateAppOptions {
  jwtSecret: string;
  usuarioService?: IUsuarioService;
  produtorService?: IProdutorService;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const usuarioService =
    options.usuarioService ?? createUsuarioService(options.jwtSecret);
  const produtorService =
    options.produtorService ?? createProdutorService();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use(
    "/api/usuarios",
    createUsuarioController({
      usuarioService,
      jwtSecret: options.jwtSecret,
    }),
  );

  app.use(
    "/api/produtores",
    createProdutorController({
      produtorService,
      jwtSecret: options.jwtSecret,
    }),
  );

  app.use(errorHandler);

  return app;
}
