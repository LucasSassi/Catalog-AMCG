import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../../app";
import { ProdutorService } from "../../../domain/produtor/service/produtor.service";
import { ProdutoService } from "../../../domain/produto/service/produto.service";
import { InMemoryProdutorRepository } from "../../mocks/produtor.repository.mock";
import { InMemoryProdutoRepository } from "../../mocks/produto.repository.mock";

const JWT_SECRET = "test-secret";

function authHeader(sub = "user-1", email = "admin@amcg.org"): string {
  const token = jwt.sign({ sub, email }, JWT_SECRET, { expiresIn: "1h" });
  return `Bearer ${token}`;
}

const arquivoValido = {
  url: "https://example.com/foto.jpg",
  contentType: "image/jpeg",
  nomeOriginal: "foto.jpg",
};

const produtorPayload = {
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

function buildProdutoPayload(produtorId: string) {
  return {
    produtorId,
    nome: "Mel Artesanal",
    descricao: "Mel puro de Campos Gerais",
    categoria: "MEL",
    unidadeMedida: "KG",
    registros: [{ tipo: "SELO ARTE", numero: "REG-PROD-001" }],
    fotosAvaliacao: [arquivoValido],
    fotosDivulgacao: [arquivoValido],
    premiacoes: [],
    valorCentavos: 3500,
  };
}

describe("Quando usar o ProdutoController (integration)", () => {
  let produtorRepository: InMemoryProdutorRepository;
  let produtoRepository: InMemoryProdutoRepository;
  let app: ReturnType<typeof createApp>;
  let produtorAprovadoId: string;

  beforeEach(async () => {
    produtorRepository = new InMemoryProdutorRepository();
    produtoRepository = new InMemoryProdutoRepository();

    const produtorService = new ProdutorService({
      readRepository: produtorRepository,
      writeRepository: produtorRepository,
    });
    const produtoService = new ProdutoService({
      readRepository: produtoRepository,
      writeRepository: produtoRepository,
      produtorReadRepository: produtorRepository,
    });

    app = createApp({
      jwtSecret: JWT_SECRET,
      produtorService,
      produtoService,
    });

    const auth = authHeader();
    const cadastrarProdutor = await request(app)
      .post("/api/produtores")
      .set("Authorization", auth)
      .send(produtorPayload);

    const aprovarProdutor = await request(app)
      .put(`/api/produtores/${cadastrarProdutor.body.id}`)
      .set("Authorization", auth)
      .send({ status: "APROVADO" });

    produtorAprovadoId = aprovarProdutor.body.id;
  });

  it("Deve exigir JWT para as rotas de produtos", async () => {
    const semToken = await request(app).get("/api/produtos");
    expect(semToken.status).toBe(401);

    const criarSemToken = await request(app)
      .post("/api/produtos")
      .send(buildProdutoPayload(produtorAprovadoId));
    expect(criarSemToken.status).toBe(401);
  });

  it("Deve disponibilizar o catálogo sem exigir JWT", async () => {
    const auth = authHeader();
    const cadastrar = await request(app)
      .post("/api/produtos")
      .set("Authorization", auth)
      .send(buildProdutoPayload(produtorAprovadoId));

    await request(app)
      .put(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth)
      .send({ status: "APROVADO" });

    const response = await request(app).get(
      "/api/produtos/catalogo?categoria=MEL&municipio=Ponta%20Grossa",
    );

    expect(response.status).toBe(200);
    expect(response.body.produtos).toHaveLength(1);
    expect(response.body.produtos[0]).toMatchObject({
      nome: "Mel Artesanal",
      produtor: {
        nome: "Fazenda Campos Gerais",
        municipio: "Ponta Grossa",
      },
    });
    expect(response.body.produtos[0].fotosAvaliacao).toBeUndefined();
  });

  it("Deve retornar a lista de categorias", async () => {
    const response = await request(app)
      .get("/api/produtos/categorias")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(8);
    expect(response.body).toEqual(
      expect.arrayContaining(["MEL", "QUEIJO", "OUTROS"]),
    );
  });

  it("Deve retornar a lista de unidades de medida", async () => {
    const response = await request(app)
      .get("/api/produtos/unidades-medida")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining(["KG", "UNIDADE", "PACOTE"]),
    );
  });

  it("Deve cadastrar, listar, buscar, atualizar, aprovar e soft-deletar", async () => {
    const auth = authHeader();

    const cadastrar = await request(app)
      .post("/api/produtos")
      .set("Authorization", auth)
      .send(buildProdutoPayload(produtorAprovadoId));

    expect(cadastrar.status).toBe(201);
    expect(cadastrar.body).toMatchObject({
      nome: "Mel Artesanal",
      status: "PENDENTE",
      ativo: true,
    });

    const listar = await request(app)
      .get("/api/produtos")
      .set("Authorization", auth);
    expect(listar.status).toBe(200);
    expect(listar.body).toHaveLength(1);

    const buscar = await request(app)
      .get(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth);
    expect(buscar.status).toBe(200);
    expect(buscar.body.id).toBe(cadastrar.body.id);

    const aprovar = await request(app)
      .put(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth)
      .send({ status: "APROVADO" });
    expect(aprovar.status).toBe(200);
    expect(aprovar.body.status).toBe("APROVADO");

    const atualizar = await request(app)
      .put(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth)
      .send({ nome: "Mel Premium" });
    expect(atualizar.status).toBe(200);
    expect(atualizar.body.nome).toBe("Mel Premium");
    expect(atualizar.body.status).toBe("PENDENTE");

    const remover = await request(app)
      .delete(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth);
    expect(remover.status).toBe(204);

    const aposDelete = await request(app)
      .get(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth);
    expect(aposDelete.status).toBe(200);
    expect(aposDelete.body.ativo).toBe(false);
  });

  it("Deve retornar 400 para body inválido no cadastro", async () => {
    const response = await request(app)
      .post("/api/produtos")
      .set("Authorization", authHeader())
      .send({
        produtorId: "",
        nome: "",
        descricao: "",
        categoria: "INVALIDO",
        unidadeMedida: "INVALIDO",
        registros: [],
        fotosAvaliacao: [],
        fotosDivulgacao: [],
        premiacoes: [],
        valorCentavos: -1,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Deve filtrar listagem por produtorId e categoria", async () => {
    const auth = authHeader();

    await request(app)
      .post("/api/produtos")
      .set("Authorization", auth)
      .send(buildProdutoPayload(produtorAprovadoId));

    await request(app)
      .post("/api/produtos")
      .set("Authorization", auth)
      .send({
        ...buildProdutoPayload(produtorAprovadoId),
        nome: "Queijo Artesanal",
        categoria: "QUEIJO",
        registros: [{ tipo: "MAPA", numero: "REG-PROD-002" }],
      });

    const porCategoria = await request(app)
      .get("/api/produtos")
      .query({ categoria: "MEL" })
      .set("Authorization", auth);

    expect(porCategoria.status).toBe(200);
    expect(porCategoria.body).toHaveLength(1);
    expect(porCategoria.body[0].categoria).toBe("MEL");

    const porProdutor = await request(app)
      .get("/api/produtos")
      .query({ produtorId: produtorAprovadoId })
      .set("Authorization", auth);

    expect(porProdutor.status).toBe(200);
    expect(porProdutor.body).toHaveLength(2);
  });

  it("Deve rejeitar produto via PUT", async () => {
    const auth = authHeader();

    const cadastrar = await request(app)
      .post("/api/produtos")
      .set("Authorization", auth)
      .send(buildProdutoPayload(produtorAprovadoId));

    const rejeitar = await request(app)
      .put(`/api/produtos/${cadastrar.body.id}`)
      .set("Authorization", auth)
      .send({
        status: "REJEITADO",
        motivoRejeicao: "Fotos insuficientes",
      });

    expect(rejeitar.status).toBe(200);
    expect(rejeitar.body.status).toBe("REJEITADO");
    expect(rejeitar.body.motivoRejeicao).toBe("Fotos insuficientes");
  });

  it("Deve retornar 404 para rotas PATCH de aprovar e rejeitar removidas", async () => {
    const auth = authHeader();

    const cadastrar = await request(app)
      .post("/api/produtos")
      .set("Authorization", auth)
      .send(buildProdutoPayload(produtorAprovadoId));

    const aprovar = await request(app)
      .patch(`/api/produtos/${cadastrar.body.id}/aprovar`)
      .set("Authorization", auth);

    const rejeitar = await request(app)
      .patch(`/api/produtos/${cadastrar.body.id}/rejeitar`)
      .set("Authorization", auth)
      .send({ motivoRejeicao: "Motivo" });

    expect(aprovar.status).toBe(404);
    expect(rejeitar.status).toBe(404);
  });
});
