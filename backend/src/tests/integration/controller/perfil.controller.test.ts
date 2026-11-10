import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createContaController } from "../../../application/controllers/conta.controller";
import { errorHandler } from "../../../application/middleware/error-handler.middleware";
import { UsuarioModel } from "../../../infraestructure/db/mongo/models/usuario.model";
import { ProdutorModel } from "../../../infraestructure/db/mongo/models/produtor.model";
import type { IProdutoService } from "../../../domain/produto/entity/interfaces/produto.service.interface";
import type { IProdutorService } from "../../../domain/produtor/entity/interfaces/produtor.service.interface";
const userId = "507f1f77bcf86cd799439011",
  producerId = "507f1f77bcf86cd799439012";
const producerUpdate = jest.fn();
const token = (role = "usuario") =>
  `Bearer ${jwt.sign({ sub: userId, role }, "secret")}`;
function app() {
  const a = express();
  a.use(express.json());
  a.use(
    "/api",
    createContaController(
      "secret",
      {} as IProdutoService,
      { update: producerUpdate } as unknown as IProdutorService,
    ),
  );
  a.use(errorHandler);
  return a;
}
function producer() {
  return ProdutorModel.hydrate({
    _id: producerId,
    nomeEmpresa: "Fazenda",
    municipioId: "pg",
    documento: { tipo: "CPF", numero: "12345678901" },
    contato: { telefone: "+5542999999999", email: "contato@example.com" },
    endereco: {
      cidade: "Ponta Grossa",
      estado: "PR",
      rua: "Rua",
      bairro: "Centro",
      cep: "84010000",
    },
    historia: "História",
    status: "PENDENTE",
    ativo: false,
    revisao: 3,
    origemPendencia: "ALTERACAO",
    camposAlterados: ["historia"],
    updatedAt: new Date(),
    createdAt: new Date(),
  });
}
afterEach(() => {
  jest.restoreAllMocks();
  producerUpdate.mockReset();
});
it("Retorna somente o perfil vinculado à conta autenticada", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  const read = jest
    .spyOn(ProdutorModel, "findById")
    .mockResolvedValue(producer());
  const result = await request(app())
    .get("/api/minha-conta/perfil")
    .set("Authorization", token());
  expect(result.status).toBe(200);
  expect(read).toHaveBeenCalledWith(producerId);
  expect(result.body).toMatchObject({
    vinculado: true,
    produtor: {
      id: producerId,
      nomeEmpresa: "Fazenda",
      revisao: 3,
      status: "ALTERADO",
    },
  });
});
it("Conta sem vínculo pode iniciar a identificação do pré-cadastro", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId } as never);
  const result = await request(app())
    .get("/api/minha-conta/perfil")
    .set("Authorization", token());
  expect(result.body).toEqual({ vinculado: false, produtor: null });
});
it("Permite alterar perfil próprio com revisão e autoria", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  producerUpdate.mockResolvedValue({
    id: producerId,
    status: "PENDENTE",
    ativo: false,
  });
  const result = await request(app())
    .patch("/api/minha-conta/perfil")
    .set("Authorization", token())
    .send({ nomeEmpresa: "Novo nome", historia: "Nova história", revisao: 3 });
  expect(result.status).toBe(200);
  expect(producerUpdate).toHaveBeenCalledWith(producerId, {
    nomeEmpresa: "Novo nome",
    historia: "Nova história",
    revisao: 3,
    autorId: userId,
  });
});
it.each([
  { status: "APROVADO", revisao: 3 },
  { produtorId: "outro", revisao: 3 },
  { documento: { tipo: "CPF", numero: "12345678901" }, revisao: 3 },
  { nomeEmpresa: "Sem revisão" },
])("Rejeita alteração indevida: %j", async (body) => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  const result = await request(app())
    .patch("/api/minha-conta/perfil")
    .set("Authorization", token())
    .send(body);
  expect(result.status).toBe(400);
  expect(producerUpdate).not.toHaveBeenCalled();
});
it("Não permite edição sem vínculo", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId } as never);
  expect(
    (
      await request(app())
        .patch("/api/minha-conta/perfil")
        .set("Authorization", token())
        .send({ nomeEmpresa: "Outro", revisao: 0 })
    ).status,
  ).toBe(404);
});
it("Lista produtores pendentes inativos com paginação e total", async () => {
  const limit = jest.fn().mockResolvedValue([producer()]);
  const find = jest
    .spyOn(ProdutorModel, "find")
    .mockReturnValue({ sort: jest.fn().mockReturnValue({ limit }) } as never);
  jest.spyOn(ProdutorModel, "countDocuments").mockResolvedValue(10);
  const result = await request(app())
    .get("/api/gestao/aprovacoes/produtores")
    .set("Authorization", token("admin"));
  expect(result.status).toBe(200);
  expect(result.body).toMatchObject({
    total: 10,
    items: [{ id: producerId, ativo: false, revisao: 3 }],
  });
  expect(find).toHaveBeenCalledWith({ status: { $in: ["PENDENTE", "ALTERADO"] } });
  expect(limit).toHaveBeenCalledWith(13);
});
it("Restringe aprovação de perfis a administradores", async () => {
  expect(
    (
      await request(app())
        .get("/api/gestao/aprovacoes/produtores")
        .set("Authorization", token())
    ).status,
  ).toBe(403);
});
it("Exige autenticação para consultar pré-cadastro ou perfil", async () => {
  expect((await request(app()).get("/api/minha-conta/perfil")).status).toBe(
    401,
  );
  expect(
    (
      await request(app())
        .post("/api/minha-conta/pre-cadastro/consultar")
        .send({ tipo: "CPF", numero: "12345678901" })
    ).status,
  ).toBe(401);
});

it("Aceita salvar perfil sem logo e sem fotos", async () => {
  jest.spyOn(UsuarioModel, "findById").mockResolvedValue({ id: userId, produtorId: producerId } as never);
  producerUpdate.mockResolvedValue({ id: producerId, fotos: [], status: "PENDENTE" });
  const response = await request(app()).patch("/api/minha-conta/perfil").set("Authorization", token()).send({ logo: null, fotos: [], revisao: 3 });
  expect(response.status).toBe(200);
  expect(producerUpdate).toHaveBeenCalledWith(producerId, { logo: null, fotos: [], revisao: 3, autorId: userId });
});


it.each([
  ["PENDENTE", { status: "PENDENTE", origemPendencia: { $ne: "ALTERACAO" } }],
  ["ALTERADO", { $or: [{ status: "ALTERADO" }, { status: "PENDENTE", origemPendencia: "ALTERACAO" }] }],
])("Separa a fila de produtores por status %s antes de paginar", async (status, filter) => {
  const limit = jest.fn().mockResolvedValue([]);
  const find = jest.spyOn(ProdutorModel, "find").mockReturnValue({ sort: jest.fn().mockReturnValue({ limit }) } as never);
  const count = jest.spyOn(ProdutorModel, "countDocuments").mockResolvedValue(0);
  const result = await request(app()).get("/api/gestao/aprovacoes/produtores")
    .query({ status }).set("Authorization", token("admin"));
  expect(result.status).toBe(200);
  expect(find).toHaveBeenCalledWith(filter);
  expect(count).toHaveBeenCalledWith(filter);
});


it("Rejeita status inválido na fila de aprovação", async () => {
  const result = await request(app()).get("/api/gestao/aprovacoes/produtores")
    .query({ status: "INVALIDO" }).set("Authorization", token("admin"));
  expect(result.status).toBe(400);
});
