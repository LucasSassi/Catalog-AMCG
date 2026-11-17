import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createContaController } from "../../../application/controllers/conta.controller";
import { errorHandler } from "../../../application/middleware/error-handler.middleware";
import { UsuarioModel } from "../../../infraestructure/db/mongo/models/usuario.model";
import { ProdutoModel } from "../../../infraestructure/db/mongo/models/produto.model";
import { ProdutorModel } from "../../../infraestructure/db/mongo/models/produtor.model";
import type { IProdutoService } from "../../../domain/produto/entity/interfaces/produto.service.interface";
const userId = "507f1f77bcf86cd799439011",
  producerId = "507f1f77bcf86cd799439012",
  productId = "507f1f77bcf86cd799439013";
const auth = (role = "usuario") =>
  `Bearer ${jwt.sign({ sub: userId, role }, "secret")}`;
const update = jest.fn();
function app() {
  const a = express();
  a.use(express.json());
  a.use(
    "/api",
    createContaController("secret", { update } as unknown as IProdutoService),
  );
  a.use(errorHandler);
  return a;
}
afterEach(() => {
  jest.restoreAllMocks();
  update.mockReset();
});
it("Exige autenticação e restringe gestão a administradores", async () => {
  expect((await request(app()).get("/api/minha-conta/produtos")).status).toBe(
    401,
  );
  expect(
    (
      await request(app())
        .get("/api/gestao/usuarios")
        .set("Authorization", auth())
    ).status,
  ).toBe(403);
});
it("Resolve a conta pelo sub do token e aceita conta sem vínculo", async () => {
  const lookup = jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId } as never);
  const result = await request(app())
    .get("/api/minha-conta/produtos")
    .set("Authorization", auth());
  expect(lookup).toHaveBeenCalledWith(userId);
  expect(result.body).toMatchObject({
    items: [],
    vinculado: false,
    hasNext: false,
  });
});
it.each(["CPF", "CNPJ"])(
  "Edita produtos pelo vínculo, independentemente de documento %s",
  async () => {
    jest
      .spyOn(UsuarioModel, "findById")
      .mockResolvedValue({ id: userId, produtorId: producerId } as never);
    const find = jest
      .spyOn(ProdutoModel, "findOne")
      .mockResolvedValue({ _id: productId, produtorId: producerId } as never);
    update.mockResolvedValue({
      id: productId,
      status: "PENDENTE",
      ativo: false,
    });
    const result = await request(app())
      .patch(`/api/minha-conta/produtos/${productId}`)
      .set("Authorization", auth())
      .send({ nome: "Produto atualizado", revisao: 2 });
    expect(result.status).toBe(200);
    expect(find).toHaveBeenCalledWith({
      _id: productId,
      produtorId: producerId,
    });
    expect(update).toHaveBeenCalledWith(productId, {
      nome: "Produto atualizado",
      revisao: 2,
      autorId: userId,
    });
  },
);
it("Não permite editar produto de outro produtor", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  jest.spyOn(ProdutoModel, "findOne").mockResolvedValue(null);
  const result = await request(app())
    .patch(`/api/minha-conta/produtos/${productId}`)
    .set("Authorization", auth())
    .send({ nome: "Outro", revisao: 0 });
  expect(result.status).toBe(404);
  expect(update).not.toHaveBeenCalled();
});
it("Rejeita campos de aprovação e transferência no endpoint do usuário", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  jest
    .spyOn(ProdutoModel, "findOne")
    .mockResolvedValue({ _id: productId } as never);
  const result = await request(app())
    .patch(`/api/minha-conta/produtos/${productId}`)
    .set("Authorization", auth())
    .send({ status: "APROVADO", produtorId: producerId, revisao: 0 });
  expect(result.status).toBe(400);
  expect(update).not.toHaveBeenCalled();
});
it.each([
  "Fazenda Campos",
  "123.456.789-01",
  "12.345.678/0001-99",
  "+55 (42) 99999-9999",
])("Lista produtores por nome, WhatsApp ou documento: %s", async (busca) => {
  jest
    .spyOn(UsuarioModel, "find")
    .mockReturnValue({ select: jest.fn().mockResolvedValue([]) } as never);
  const producer = {
    _id: producerId,
    nomeEmpresa: "Fazenda Campos",
    documento: { tipo: "CPF", numero: "12345678901" },
    contato: { telefone: "+5542999999999" },
  };
  const limit = jest.fn().mockResolvedValue([producer]);
  const sort = jest.fn().mockReturnValue({ limit });
  const select = jest.fn().mockReturnValue({ sort });
  const find = jest
    .spyOn(ProdutorModel, "find")
    .mockReturnValue({ select } as never);
  const result = await request(app())
    .get("/api/gestao/produtores")
    .query({ busca })
    .set("Authorization", auth("admin"));
  expect(result.status).toBe(200);
  expect(result.body).toMatchObject({ items: [producer], hasNext: false });
  const digits = busca.replace(/\D/g, "");
  const numeric = digits.length > 0;
  const pattern = numeric ? digits.split("").join("\\D*") : busca;
  expect(find).toHaveBeenCalledWith({
    $or: [
      {
        nomeEmpresa: {
          $regex: busca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        },
      },
      { "documento.numero": { $regex: pattern, $options: "i" } },
      ...(numeric ? [{ "contato.telefone": { $regex: pattern } }] : []),
    ],
  });
  if (numeric) {
    expect(new RegExp(pattern).test(busca)).toBe(true);
    expect(new RegExp(pattern).test(digits)).toBe(true);
  }
  expect(select).toHaveBeenCalledWith("nomeEmpresa documento contato.telefone");
});
it("Pagina resultados homônimos para permitir escolher o produtor correto", async () => {
  jest
    .spyOn(UsuarioModel, "find")
    .mockReturnValue({ select: jest.fn().mockResolvedValue([]) } as never);
  const limit = jest.fn().mockResolvedValue([
    { _id: producerId, nomeEmpresa: "Fazenda" },
    { _id: userId, nomeEmpresa: "Fazenda" },
  ]);
  const sort = jest.fn().mockReturnValue({ limit });
  const find = jest
    .spyOn(ProdutorModel, "find")
    .mockReturnValue({ select: jest.fn().mockReturnValue({ sort }) } as never);
  const result = await request(app())
    .get("/api/gestao/produtores")
    .query({ busca: "Fazenda", pageSize: 1, lastItemId: productId })
    .set("Authorization", auth("admin"));
  expect(result.body).toMatchObject({
    items: [{ _id: producerId }],
    nextLastItemId: producerId,
    hasNext: true,
  });
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({ _id: { $lt: productId } }),
  );
  expect(sort).toHaveBeenCalledWith({ _id: -1 });
  expect(limit).toHaveBeenCalledWith(2);
});
it("Retorna lista vazia quando não há produtores correspondentes", async () => {
  jest.spyOn(ProdutorModel, "find").mockReturnValue({
    select: jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
    }),
  } as never);
  const result = await request(app())
    .get("/api/gestao/produtores")
    .query({ busca: "Inexistente" })
    .set("Authorization", auth("admin"));
  expect(result.status).toBe(200);
  expect(result.body).toMatchObject({
    items: [],
    hasNext: false,
    nextLastItemId: null,
  });
});
it("Restringe a busca de produtores a administradores", async () => {
  expect(
    (
      await request(app())
        .get("/api/gestao/produtores")
        .set("Authorization", auth())
    ).status,
  ).toBe(403);
});
it("Paginação de contas aplica cursor e não expõe senhas", async () => {
  const limit = jest
    .fn()
    .mockResolvedValue([{ _id: userId }, { _id: producerId }]);
  const sort = jest.fn().mockReturnValue({ limit });
  const select = jest.fn().mockReturnValue({ sort });
  const find = jest
    .spyOn(UsuarioModel, "find")
    .mockReturnValue({ select } as never);
  const result = await request(app())
    .get("/api/gestao/usuarios")
    .query({ pageSize: 1, lastItemId: productId })
    .set("Authorization", auth("admin"));
  expect(result.body).toMatchObject({
    items: [{ _id: userId }],
    hasNext: true,
    nextLastItemId: userId,
  });
  expect(find).toHaveBeenCalledWith({ _id: { $lt: productId } });
  expect(select).toHaveBeenCalledWith(
    "nome email produtorId historicoVinculos",
  );
});
it("Registra associação administrativa e o vínculo anterior", async () => {
  jest
    .spyOn(ProdutorModel, "exists")
    .mockResolvedValue({ _id: producerId } as never);
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ _id: userId } as never);
  const select = jest
    .fn()
    .mockResolvedValue({ _id: userId, produtorId: producerId });
  const write = jest
    .spyOn(UsuarioModel, "findOneAndUpdate")
    .mockReturnValue({ select } as never);
  const result = await request(app())
    .put(`/api/gestao/usuarios/${userId}/vinculo`)
    .set("Authorization", auth("admin"))
    .send({ produtorId: producerId });
  expect(result.status).toBe(200);
  expect(write).toHaveBeenCalledWith(
    { _id: userId, produtorId: null },
    expect.objectContaining({
      $set: { produtorId: producerId },
      $push: {
        historicoVinculos: expect.objectContaining({
          administradorId: userId,
          novo: producerId,
        }),
      },
    }),
    { new: true },
  );
});
it("Remove vínculo com auditoria e reflete na próxima requisição do mesmo token", async () => {
  const lookup = jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValueOnce({ id: userId, produtorId: producerId } as never)
    .mockResolvedValueOnce({ id: userId } as never);
  const select = jest.fn().mockResolvedValue({ _id: userId });
  const write = jest
    .spyOn(UsuarioModel, "findOneAndUpdate")
    .mockReturnValue({ select } as never);
  const token = auth("admin");
  const removed = await request(app())
    .put(`/api/gestao/usuarios/${userId}/vinculo`)
    .set("Authorization", token)
    .send({ produtorId: null });
  expect(removed.status).toBe(200);
  expect(write).toHaveBeenCalledWith(
    { _id: userId, produtorId: producerId },
    expect.objectContaining({
      $unset: { produtorId: "" },
      $push: {
        historicoVinculos: expect.objectContaining({
          anterior: producerId,
          administradorId: userId,
        }),
      },
    }),
    { new: true },
  );
  const products = await request(app())
    .get("/api/minha-conta/produtos")
    .set("Authorization", token);
  expect(products.body.vinculado).toBe(false);
  expect(lookup).toHaveBeenCalledTimes(2);
});
it("Inclui pendentes inativos na fila e informa o total do servidor", async () => {
  const product = {
    _id: productId,
    produtorId: producerId,
    nome: "Mel",
    descricao: "Descrição",
    fotosAvaliacao: [],
    fotosDivulgacao: [],
    registros: [],
    premiacoes: [],
    ativo: false,
    status: "PENDENTE",
    origemPendencia: "ALTERACAO",
  };
  const limit = jest.fn().mockResolvedValue([product]);
  const sort = jest.fn().mockReturnValue({ limit });
  const find = jest
    .spyOn(ProdutoModel, "find")
    .mockReturnValue({ sort } as never);
  jest.spyOn(ProdutoModel, "countDocuments").mockResolvedValue(23);
  jest
    .spyOn(ProdutorModel, "find")
    .mockReturnValue({ select: jest.fn().mockResolvedValue([]) } as never);
  const result = await request(app())
    .get("/api/gestao/aprovacoes")
    .set("Authorization", auth("admin"));
  expect(result.status).toBe(200);
  expect(find).toHaveBeenCalledWith({ status: { $in: ["PENDENTE", "ALTERADO"] } });
  expect(result.body).toMatchObject({
    total: 23,
    items: [{ id: productId, ativo: false, origemPendencia: "ALTERACAO" }],
  });
});
it.each([{ pageSize: 21 }, { lastItemId: "invalido" }])(
  "Valida a paginação: %j",
  async (query) => {
    const result = await request(app())
      .get("/api/gestao/usuarios")
      .query(query)
      .set("Authorization", auth("admin"));
    expect(result.status).toBe(400);
  },
);
it("Mostra os dados do produtor vinculado na listagem administrativa de contas", async () => {
  const account = {
    _id: userId,
    nome: "Maria",
    email: "maria@example.com",
    produtorId: producerId,
    senhaHash: "nao-expor",
  };
  const producer = {
    _id: producerId,
    nomeEmpresa: "Fazenda Campos",
    documento: { tipo: "CPF", numero: "12345678901" },
    contato: { telefone: "42999999999" },
  };
  jest.spyOn(UsuarioModel, "find").mockReturnValue({
    select: jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ limit: jest.fn().mockResolvedValue([account]) }),
    }),
  } as never);
  const producerSelect = jest.fn().mockResolvedValue([producer]);
  const producerFind = jest
    .spyOn(ProdutorModel, "find")
    .mockReturnValue({ select: producerSelect } as never);
  const result = await request(app())
    .get("/api/gestao/usuarios")
    .set("Authorization", auth("admin"));
  expect(result.status).toBe(200);
  expect(result.body.items[0]).toMatchObject({
    nome: "Maria",
    email: "maria@example.com",
    produtorVinculado: producer,
  });
  expect(result.body.items[0]).not.toHaveProperty("senhaHash");
  expect(producerFind).toHaveBeenCalledWith({ _id: { $in: [producerId] } });
  expect(producerSelect).toHaveBeenCalledWith(
    "nomeEmpresa documento contato.telefone",
  );
});
it("Mostra todas as contas vinculadas a cada produtor somente na busca administrativa", async () => {
  const producers = [
    { _id: producerId, nomeEmpresa: "Fazenda" },
    { _id: productId, nomeEmpresa: "Sem vínculo" },
  ];
  jest.spyOn(ProdutorModel, "find").mockReturnValue({
    select: jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ limit: jest.fn().mockResolvedValue(producers) }),
    }),
  } as never);
  const select = jest.fn().mockResolvedValue([
    {
      _id: userId,
      nome: "Maria",
      email: "maria@example.com",
      produtorId: producerId,
      senhaHash: "nao-expor",
    },
    {
      _id: productId,
      nome: "João",
      email: "joao@example.com",
      produtorId: producerId,
    },
  ]);
  const accounts = jest
    .spyOn(UsuarioModel, "find")
    .mockReturnValue({ select } as never);
  const result = await request(app())
    .get("/api/gestao/produtores")
    .set("Authorization", auth("admin"));
  expect(result.status).toBe(200);
  expect(result.body.items[0].contasVinculadas).toEqual([
    { id: userId, nome: "Maria", email: "maria@example.com" },
    { id: productId, nome: "João", email: "joao@example.com" },
  ]);
  expect(result.body.items[1].contasVinculadas).toEqual([]);
  expect(accounts).toHaveBeenCalledWith({
    produtorId: { $in: [producerId, productId] },
  });
  expect(select).toHaveBeenCalledWith("nome email produtorId");
});
it.each([
  { descricaoBreve: "Descrição breve atualizada" },
  { descricao: "Descrição completa atualizada do produto" },
])("Permite editar descrições pelo endpoint do usuário: %j", async (input) => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  jest
    .spyOn(ProdutoModel, "findOne")
    .mockResolvedValue({ _id: productId, produtorId: producerId } as never);
  update.mockResolvedValue({
    id: productId,
    status: "PENDENTE",
    ativo: false,
    ...input,
  });
  const result = await request(app())
    .patch(`/api/minha-conta/produtos/${productId}`)
    .set("Authorization", auth())
    .send({ ...input, revisao: 2 });
  expect(result.status).toBe(200);
  expect(result.body).toMatchObject({
    status: "PENDENTE",
    ativo: false,
    ...input,
  });
  expect(update).toHaveBeenCalledWith(productId, {
    ...input,
    revisao: 2,
    autorId: userId,
  });
});


it.each([
  ["PENDENTE", { status: "PENDENTE", origemPendencia: { $ne: "ALTERACAO" } }],
  ["ALTERADO", { $or: [{ status: "ALTERADO" }, { status: "PENDENTE", origemPendencia: "ALTERACAO" }] }],
])("Separa a fila de produtos por status %s antes de paginar", async (status, filter) => {
  const find = jest.spyOn(ProdutoModel, "find").mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) } as never);
  const count = jest.spyOn(ProdutoModel, "countDocuments").mockResolvedValue(0);
  jest.spyOn(ProdutorModel, "find").mockReturnValue({ select: jest.fn().mockResolvedValue([]) } as never);
  const result = await request(app()).get("/api/gestao/aprovacoes")
    .query({ status }).set("Authorization", auth("admin"));
  expect(result.status).toBe(200);
  expect(find).toHaveBeenCalledWith(filter);
  expect(count).toHaveBeenCalledWith(filter);
});
