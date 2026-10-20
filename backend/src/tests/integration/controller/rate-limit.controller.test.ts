import request from "supertest";
import { createApp, type CreateAppOptions } from "../../../app";
import {
  CADASTRAR_RATE_LIMIT,
  LOGIN_RATE_LIMIT,
  RATE_LIMIT_MESSAGE,
} from "../../../application/middleware/rate-limit.middleware";
import { ProdutorService } from "../../../domain/produtor/service/produtor.service";
import { ProdutoService } from "../../../domain/produto/service/produto.service";
import { UsuarioService } from "../../../domain/usuario/service/usuario.service";
import { InMemoryProdutorRepository } from "../../mocks/produtor.repository.mock";
import { InMemoryProdutoRepository } from "../../mocks/produto.repository.mock";
import { InMemoryUsuarioRepository } from "../../mocks/usuario.repository.mock";

const JWT_SECRET = "test-secret";

function createTestApp(overrides: Partial<CreateAppOptions> = {}) {
  const usuarioRepository = new InMemoryUsuarioRepository();
  const produtoRepository = new InMemoryProdutoRepository();
  const produtorRepository = new InMemoryProdutorRepository();

  return createApp({
    jwtSecret: JWT_SECRET,
    usuarioService: new UsuarioService({
      readRepository: usuarioRepository,
      writeRepository: usuarioRepository,
      jwtSecret: JWT_SECRET,
    }),
    produtorService: new ProdutorService({
      readRepository: produtorRepository,
      writeRepository: produtorRepository,
    }),
    produtoService: new ProdutoService({
      readRepository: produtoRepository,
      writeRepository: produtoRepository,
      produtorReadRepository: produtorRepository,
    }),
    ...overrides,
  });
}

describe("Quando o rate limit protege as rotas públicas", () => {
  it("Deve responder 429 na 11ª tentativa de login", async () => {
    const app = createTestApp();
    const credentials = {
      email: "inexistente@amcg.org",
      senha: "senha123",
    };

    for (let attempt = 0; attempt < LOGIN_RATE_LIMIT.limit; attempt += 1) {
      const response = await request(app)
        .post("/api/usuarios/login")
        .send(credentials);

      expect(response.status).toBe(401);
    }

    const blocked = await request(app)
      .post("/api/usuarios/login")
      .send(credentials);

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: RATE_LIMIT_MESSAGE });
  });

  it("Deve responder 429 na 6ª tentativa de cadastro", async () => {
    const app = createTestApp();

    for (let attempt = 0; attempt < CADASTRAR_RATE_LIMIT.limit; attempt += 1) {
      const response = await request(app)
        .post("/api/usuarios/cadastrar")
        .send({
          nome: `Usuario ${attempt}`,
          email: `usuario${attempt}@amcg.org`,
          senha: "senha123",
        });

      expect(response.status).toBe(201);
    }

    const blocked = await request(app)
      .post("/api/usuarios/cadastrar")
      .send({
        nome: "Usuario Extra",
        email: "extra@amcg.org",
        senha: "senha123",
      });

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: RATE_LIMIT_MESSAGE });
  });

  it("Deve responder 429 quando o catálogo excede o limite injetado", async () => {
    const app = createTestApp({
      rateLimits: {
        catalog: { windowMs: 60_000, limit: 2 },
      },
    });

    const first = await request(app).get("/api/produtos/catalogo");
    const second = await request(app).get("/api/produtos/catalogo");
    const blocked = await request(app).get("/api/produtos/catalogo");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: RATE_LIMIT_MESSAGE });
  });
});
