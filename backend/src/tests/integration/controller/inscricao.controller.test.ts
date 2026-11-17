import { UsuarioModel } from "../../../infraestructure/db/mongo/models/usuario.model";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../../app";
import { ProdutorService } from "../../../domain/produtor/service/produtor.service";
import { ProdutoService } from "../../../domain/produto/service/produto.service";
import { InMemoryProdutorRepository } from "../../mocks/produtor.repository.mock";
import { InMemoryProdutoRepository } from "../../mocks/produto.repository.mock";

const JWT_SECRET = "test-secret";

function authHeader(
  sub = "user-1",
  email = "usuario@amcg.org",
  role: "admin" | "usuario" = "usuario",
): string {
  const token = jwt.sign({ sub, email, role }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
}

const arquivoValido = {
  url: "https://example.com/foto.jpg",
  contentType: "image/jpeg",
  nomeOriginal: "foto.jpg",
};

function buildInscricaoPayload() {
  return {
    produtor: {
      nomeEmpresa: "Fazenda Inscrição",
      municipioId: "Ponta Grossa",
      documento: { tipo: "CNPJ", numero: "12345678000199" },
      registros: [{ tipo: "SIM", numero: "REG-INSCR-001" }],
      contato: {
        telefone: "+5542999999999",
        email: "contato@fazenda.com",
      },
      endereco: {
        cep: "84010000",
        rua: "Rua das Flores, CEP 84010-000",
        bairro: "Ponta Grossa",
        cidade: "Ponta Grossa",
        estado: "PR",
      },
      exibirEndereco: true,
      historia: "Produtor familiar dos Campos Gerais com tradição artesanal.",
      logo: arquivoValido,
      fotos: [arquivoValido],
      redesSociais: [{ tipo: "INSTAGRAM", handle: "fazendainscricao" }],
      site: "https://fazenda.example.com",
    },
    produtos: [
      {
        nome: "Mel Artesanal",
        descricaoBreve: "Produto artesanal dos Campos Gerais",
        descricao: "Mel puro de Campos Gerais",
        categoria: "MEL_E_DERIVADOS",
        unidadeMedida: "UNIDADE",
        registros: [{ tipo: "SELO ARTE", numero: "REG-PROD-INSCR-001" }],
        fotosAvaliacao: [arquivoValido],
        fotosDivulgacao: [arquivoValido],
        premiacoes: [],
        valorCentavos: 3500,
        observacoes: "Produto artesanal",
      },
    ],
  };
}

describe("Quando usar o InscricaoController (integration)", () => {
  let produtorRepository: InMemoryProdutorRepository;
  let produtoRepository: InMemoryProdutoRepository;
  let app: ReturnType<typeof createApp>;

  afterEach(() => jest.restoreAllMocks());
  beforeEach(() => {
    jest
      .spyOn(UsuarioModel, "findById")
      .mockResolvedValue({ id: "user-1" } as never);
    jest
      .spyOn(UsuarioModel, "findOneAndUpdate")
      .mockResolvedValue({ id: "user-1" } as never);
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
  });

  it("Não cria outra inscrição para conta já vinculada", async () => {
    jest
      .spyOn(UsuarioModel, "findById")
      .mockResolvedValue({ id: "user-1", produtorId: "existente" } as never);
    const response = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", authHeader())
      .send(buildInscricaoPayload());
    expect(response.status).toBe(409);
    expect(await produtorRepository.list()).toHaveLength(0);
  });
  it("Desfaz a inscrição se o vínculo mudar durante a criação", async () => {
    jest.spyOn(UsuarioModel, "findOneAndUpdate").mockResolvedValue(null);
    const response = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", authHeader())
      .send(buildInscricaoPayload());
    expect(response.status).toBe(409);
    expect(await produtorRepository.list()).toHaveLength(0);
    expect(await produtoRepository.list()).toHaveLength(0);
  });
  it("Deve exigir JWT para criar inscrição", async () => {
    const response = await request(app)
      .post("/api/inscricoes")
      .send(buildInscricaoPayload());

    expect(response.status).toBe(401);
  });

  it("Deve criar produtor e produtos pendentes com role usuario", async () => {
    const response = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", authHeader())
      .send(buildInscricaoPayload());

    expect(response.status).toBe(201);
    expect(UsuarioModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "user-1", produtorId: null },
      expect.objectContaining({
        $set: { produtorId: response.body.produtor.id },
        $push: {
          historicoVinculos: expect.objectContaining({
            origem: "INSCRICAO",
            usuarioId: "user-1",
          }),
        },
      }),
      { new: true },
    );
    expect(response.body.produtor).toMatchObject({
      nomeEmpresa: "Fazenda Inscrição",
      status: "PENDENTE",
      ativo: true,
    });
    expect(response.body.produtos).toHaveLength(1);
    expect(response.body.produtos[0]).toMatchObject({
      nome: "Mel Artesanal",
      status: "PENDENTE",
      produtorId: response.body.produtor.id,
      unidadeMedida: "UNIDADE",
    });
  });

  it("Deve reverter produtor quando um produto da inscrição falhar", async () => {
    await produtoRepository.create({
      ...buildInscricaoPayload().produtos[0],
      produtorId: "produtor-existente",
      categoria: "MEL_E_DERIVADOS",
      unidadeMedida: "UNIDADE",
      registros: [{ tipo: "SELO ARTE", numero: "REG-JA-USADO" }],
      ativo: true,
      status: "APROVADO",
      destaque: false,
    });

    const payload = buildInscricaoPayload();
    payload.produtos.push({
      ...payload.produtos[0],
      nome: "Produto inválido",
      registros: [{ tipo: "SELO ARTE", numero: "REG-JA-USADO" }],
    });

    const response = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", authHeader())
      .send(payload);

    expect(response.status).toBe(409);

    const produtores = await produtorRepository.list();
    const produtos = await produtoRepository.list();

    expect(produtores).toHaveLength(0);
    expect(produtos).toHaveLength(1);
    expect(produtos[0].produtorId).toBe("produtor-existente");
  });

  it("Deve manter POST /api/produtos restrito a admin", async () => {
    const inscricao = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", authHeader())
      .send(buildInscricaoPayload());

    expect(inscricao.status).toBe(201);

    const adminAprova = await request(app)
      .put(`/api/produtores/${inscricao.body.produtor.id}`)
      .set("Authorization", authHeader("admin-1", "admin@amcg.org", "admin"))
      .send({ status: "APROVADO", revisao: 0 });

    expect(adminAprova.status).toBe(200);

    const produtoUsuario = await request(app)
      .post("/api/produtos")
      .set("Authorization", authHeader())
      .send({
        produtorId: inscricao.body.produtor.id,
        nome: "Queijo",
        descricaoBreve: "Produto artesanal dos Campos Gerais",
        descricao: "Queijo artesanal",
        categoria: "QUEIJOS_E_LACTEOS",
        unidadeMedida: "KG",
        registros: [{ tipo: "SELO ARTE", numero: "REG-ADMIN-ONLY-001" }],
        fotosAvaliacao: [arquivoValido],
        fotosDivulgacao: [arquivoValido],
        premiacoes: [],
        valorCentavos: 5000,
      });

    expect(produtoUsuario.status).toBe(403);
  });
});
