import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../../app";
import { ProdutorService } from "../../../domain/produtor/service/produtor.service";
import { InMemoryProdutorRepository } from "../../mocks/produtor.repository.mock";

const JWT_SECRET = "test-secret";

function authHeader(sub = "user-1", email = "admin@amcg.org"): string {
  const token = jwt.sign({ sub, email }, JWT_SECRET, { expiresIn: "1h" });
  return `Bearer ${token}`;
}

const payloadBase = {
  nomeEmpresa: "Fazenda Campos Gerais",
  municipioId: "municipio-1",
  documento: { tipo: "CNPJ", numero: "12345678000199" },
  registros: [{ tipo: "SIM", numero: "REG-001" }],
  contato: {
    telefone: "+5542999999999",
    email: "contato@fazenda.com",
  },
  endereco: {
    rua: "Rua das Flores",
    bairro: "Centro",
    cidade: "Ponta Grossa",
    estado: "PR",
  },
};

describe("Quando usar o ProdutorController (integration)", () => {
  let repository: InMemoryProdutorRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new InMemoryProdutorRepository();
    const produtorService = new ProdutorService({
      readRepository: repository,
      writeRepository: repository,
    });
    app = createApp({ jwtSecret: JWT_SECRET, produtorService });
  });

  it("Deve exigir JWT para as rotas de produtores", async () => {
    const semToken = await request(app).get("/api/produtores");
    expect(semToken.status).toBe(401);

    const ufsSemToken = await request(app).get("/api/produtores/ufs");
    expect(ufsSemToken.status).toBe(401);

    const criarSemToken = await request(app)
      .post("/api/produtores")
      .send(payloadBase);
    expect(criarSemToken.status).toBe(401);
  });

  it("Deve retornar a lista de UFs brasileiras", async () => {
    const response = await request(app)
      .get("/api/produtores/ufs")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(27);
    expect(response.body).toEqual(expect.arrayContaining(["PR", "SP"]));
  });

  it("Deve cadastrar, listar, buscar, atualizar e soft-deletar", async () => {
    const auth = authHeader();

    const cadastrar = await request(app)
      .post("/api/produtores")
      .set("Authorization", auth)
      .send(payloadBase);

    expect(cadastrar.status).toBe(201);
    expect(cadastrar.body).toMatchObject({
      nomeEmpresa: "Fazenda Campos Gerais",
      status: "PENDENTE",
      ativo: true,
    });

    const listar = await request(app)
      .get("/api/produtores")
      .set("Authorization", auth);
    expect(listar.status).toBe(200);
    expect(listar.body).toHaveLength(1);

    const buscar = await request(app)
      .get(`/api/produtores/${cadastrar.body.id}`)
      .set("Authorization", auth);
    expect(buscar.status).toBe(200);
    expect(buscar.body.id).toBe(cadastrar.body.id);

    const atualizar = await request(app)
      .put(`/api/produtores/${cadastrar.body.id}`)
      .set("Authorization", auth)
      .send({ nomeEmpresa: "Fazenda Atualizada" });
    expect(atualizar.status).toBe(200);
    expect(atualizar.body.nomeEmpresa).toBe("Fazenda Atualizada");
    expect(atualizar.body.status).toBe("PENDENTE");

    const remover = await request(app)
      .delete(`/api/produtores/${cadastrar.body.id}`)
      .set("Authorization", auth);
    expect(remover.status).toBe(204);

    const aposDelete = await request(app)
      .get(`/api/produtores/${cadastrar.body.id}`)
      .set("Authorization", auth);
    expect(aposDelete.status).toBe(200);
    expect(aposDelete.body.ativo).toBe(false);
  });

  it("Deve retornar 400 para body inválido no cadastro", async () => {
    const response = await request(app)
      .post("/api/produtores")
      .set("Authorization", authHeader())
      .send({
        nomeEmpresa: "",
        municipioId: "m1",
        documento: { tipo: "CNPJ", numero: "123" },
        registros: [],
        contato: { telefone: "123", email: "invalido" },
        endereco: {
          rua: "",
          bairro: "",
          cidade: "",
          estado: "XX",
        },
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Deve filtrar listagem por query ativo", async () => {
    const auth = authHeader();

    const criado = await request(app)
      .post("/api/produtores")
      .set("Authorization", auth)
      .send(payloadBase);

    await request(app)
      .delete(`/api/produtores/${criado.body.id}`)
      .set("Authorization", auth);

    const ativos = await request(app)
      .get("/api/produtores")
      .query({ ativo: "true" })
      .set("Authorization", auth);

    expect(ativos.status).toBe(200);
    expect(ativos.body).toHaveLength(0);

    const inativos = await request(app)
      .get("/api/produtores")
      .query({ ativo: "false" })
      .set("Authorization", auth);

    expect(inativos.status).toBe(200);
    expect(inativos.body).toHaveLength(1);
  });
});
