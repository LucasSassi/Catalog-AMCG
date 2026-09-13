import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../../app";
import { UsuarioService } from "../../../domain/usuario/service/usuario.service";
import { InMemoryUsuarioRepository } from "../../mocks/usuario.repository.mock";

const JWT_SECRET = "test-secret";

describe("Quando usar o UsuarioController (integration)", () => {
  let repository: InMemoryUsuarioRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new InMemoryUsuarioRepository();
    const usuarioService = new UsuarioService({
      readRepository: repository,
      writeRepository: repository,
      jwtSecret: JWT_SECRET,
    });
    app = createApp({ jwtSecret: JWT_SECRET, usuarioService });
  });

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
    });
    expect(cadastrar.body).not.toHaveProperty("senhaHash");

    const login = await request(app).post("/api/usuarios/login").send({
      email: "ana@amcg.org",
      senha: "senha123",
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.usuario.email).toBe("ana@amcg.org");
  });

  it("Deve exigir JWT para listar usuários", async () => {
    const semToken = await request(app).get("/api/usuarios");
    expect(semToken.status).toBe(401);

    await request(app).post("/api/usuarios/cadastrar").send({
      nome: "Ana",
      email: "ana@amcg.org",
      senha: "senha123",
    });

    const login = await request(app).post("/api/usuarios/login").send({
      email: "ana@amcg.org",
      senha: "senha123",
    });

    const lista = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);
  });

  it("Deve atualizar e remover com JWT", async () => {
    const cadastrar = await request(app).post("/api/usuarios/cadastrar").send({
      nome: "Ana",
      email: "ana@amcg.org",
      senha: "senha123",
    });

    const token = jwt.sign(
      { sub: cadastrar.body.id, email: cadastrar.body.email },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    const atualizar = await request(app)
      .put(`/api/usuarios/${cadastrar.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Ana Silva" });

    expect(atualizar.status).toBe(200);
    expect(atualizar.body.nome).toBe("Ana Silva");

    const remover = await request(app)
      .delete(`/api/usuarios/${cadastrar.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(remover.status).toBe(204);

    const buscar = await request(app)
      .get(`/api/usuarios/${cadastrar.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(buscar.status).toBe(404);
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
