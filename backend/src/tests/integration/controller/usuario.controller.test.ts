import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../../app";
import { UsuarioService } from "../../../domain/usuario/service/usuario.service";
import { InMemoryUsuarioRepository } from "../../mocks/usuario.repository.mock";

const JWT_SECRET = "test-secret";

function authHeader(
  sub: string,
  email: string,
  role: "admin" | "usuario" = "admin",
): string {
  const token = jwt.sign({ sub, email, role }, JWT_SECRET, { expiresIn: "1h" });
  return `Bearer ${token}`;
}

describe("Quando usar o UsuarioController (integration)", () => {
  let repository: InMemoryUsuarioRepository;
  let service: UsuarioService;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new InMemoryUsuarioRepository();
    service = new UsuarioService({
      readRepository: repository,
      writeRepository: repository,
      jwtSecret: JWT_SECRET,
    });
    app = createApp({ jwtSecret: JWT_SECRET, usuarioService: service });
  });

  async function cadastrarAdmin() {
    const admin = await service.cadastrar({
      nome: "Admin",
      email: "admin@amcg.org",
      senha: "senha123",
    });
    await repository.update(admin.id, { role: "admin" });
    return admin;
  }

  it("Deve cadastrar e fazer login", async () => {
    const cadastrar = await request(app).post("/api/usuarios/cadastrar").send({
      nome: "Ana",
      email: "ana@amcg.org",
      senha: "senha123",
    });

    expect(cadastrar.status).toBe(201);
    expect(cadastrar.body).toMatchObject({
      nome: "Ana",
      email: "ana@amcg.org",
      role: "usuario",
    });
    expect(cadastrar.body).not.toHaveProperty("senhaHash");

    const login = await request(app).post("/api/usuarios/login").send({
      email: "ana@amcg.org",
      senha: "senha123",
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.usuario.email).toBe("ana@amcg.org");
    expect(login.body.usuario.role).toBe("usuario");

    const payload = jwt.verify(login.body.token, JWT_SECRET) as {
      role: string;
    };
    expect(payload.role).toBe("usuario");
  });

  it("Deve exigir admin para listar usuários", async () => {
    const semToken = await request(app).get("/api/usuarios");
    expect(semToken.status).toBe(401);

    const usuario = await service.cadastrar({
      nome: "Ana",
      email: "ana@amcg.org",
      senha: "senha123",
    });

    const comoUsuario = await request(app)
      .get("/api/usuarios")
      .set(
        "Authorization",
        authHeader(usuario.id, usuario.email, "usuario"),
      );
    expect(comoUsuario.status).toBe(403);

    const admin = await cadastrarAdmin();
    const lista = await request(app)
      .get("/api/usuarios")
      .set("Authorization", authHeader(admin.id, admin.email, "admin"));

    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(2);
  });

  it("Deve atualizar e remover com JWT de admin", async () => {
    const admin = await cadastrarAdmin();
    const cadastrar = await request(app).post("/api/usuarios/cadastrar").send({
      nome: "Ana",
      email: "ana@amcg.org",
      senha: "senha123",
    });

    const token = authHeader(admin.id, admin.email, "admin");

    const atualizar = await request(app)
      .put(`/api/usuarios/${cadastrar.body.id}`)
      .set("Authorization", token)
      .send({ nome: "Ana Silva" });

    expect(atualizar.status).toBe(200);
    expect(atualizar.body.nome).toBe("Ana Silva");

    const remover = await request(app)
      .delete(`/api/usuarios/${cadastrar.body.id}`)
      .set("Authorization", token);

    expect(remover.status).toBe(204);

    const buscar = await request(app)
      .get(`/api/usuarios/${cadastrar.body.id}`)
      .set("Authorization", token);

    expect(buscar.status).toBe(404);
  });

  it("Deve alterar a role de outro usuário", async () => {
    const admin = await cadastrarAdmin();
    const alvo = await service.cadastrar({
      nome: "Ana",
      email: "ana@amcg.org",
      senha: "senha123",
    });

    const response = await request(app)
      .patch(`/api/usuarios/${alvo.id}/role`)
      .set("Authorization", authHeader(admin.id, admin.email, "admin"))
      .send({ role: "admin" });

    expect(response.status).toBe(200);
    expect(response.body.role).toBe("admin");
  });

  it("Deve recusar alterar a própria role", async () => {
    const admin = await cadastrarAdmin();

    const response = await request(app)
      .patch(`/api/usuarios/${admin.id}/role`)
      .set("Authorization", authHeader(admin.id, admin.email, "admin"))
      .send({ role: "usuario" });

    expect(response.status).toBe(403);
  });

  it("Deve retornar 400 para body inválido no cadastro", async () => {
    const response = await request(app).post("/api/usuarios/cadastrar").send({
      nome: "",
      email: "invalido",
      senha: "12",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
