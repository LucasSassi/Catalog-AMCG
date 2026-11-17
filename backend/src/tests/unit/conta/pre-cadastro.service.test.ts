import jwt from "jsonwebtoken";
import { PreCadastroService } from "../../../application/services/pre-cadastro.service";
import { UsuarioModel } from "../../../infraestructure/db/mongo/models/usuario.model";
import { ProdutorModel } from "../../../infraestructure/db/mongo/models/produtor.model";
const userId = "507f1f77bcf86cd799439011",
  producerId = "507f1f77bcf86cd799439012";
const secret = "pre-cadastro-test";
const service = new PreCadastroService(secret);
const producer = {
  _id: producerId,
  nomeEmpresa: "Fazenda",
  documento: { tipo: "CPF", numero: "12345678901" },
  historia: "História",
  endereco: { cidade: "Ponta Grossa" },
  updatedAt: new Date("2026-01-01"),
  status: "APROVADO",
  ativo: true,
};
beforeEach(() => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId } as never);
});
afterEach(() => jest.restoreAllMocks());
function searchResult(items: unknown[]) {
  return jest
    .spyOn(ProdutorModel, "find")
    .mockReturnValue({ limit: jest.fn().mockResolvedValue(items) } as never);
}
it.each([
  [{ tipo: "CPF", numero: "123.456.789-01" }, "12345678901"],
  [{ tipo: "CNPJ", numero: "12.345.678/0001-99" }, "12345678000199"],
  [{ tipo: "CAD_PRO", numero: "CAD/123-45" }, "CAD/123-45"],
])(
  "Busca pelo mesmo tipo e número normalizado: %j",
  async (documento, numero) => {
    const find = searchResult([]);
    const result = await service.consultar(userId, documento);
    expect(result).toEqual({ encontrado: false });
    expect(find).toHaveBeenCalledWith(
      documento.tipo === "CAD_PRO"
        ? {
            "documento.tipo": "CAD_PRO",
            "documento.numero": { $in: [numero, `CAD-${numero}`] },
          }
        : {
            "documento.tipo": documento.tipo,
            "documento.numero": numero,
          },
    );
  },
);
it("Exige confirmação e vincula ao usuário autenticado com auditoria", async () => {
  searchResult([producer]);
  const write = jest
    .spyOn(UsuarioModel, "findOneAndUpdate")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  const preview = await service.consultar(userId, producer.documento);
  expect(write).not.toHaveBeenCalled();
  expect(preview.produtor).toMatchObject({
    nomeEmpresa: "Fazenda",
    municipio: "Ponta Grossa",
  });
  jest.spyOn(ProdutorModel, "findById").mockResolvedValue(producer as never);
  await expect(
    service.confirmar(userId, preview.confirmacaoToken!),
  ).resolves.toEqual({ vinculado: true, revisarPerfil: true });
  expect(write).toHaveBeenCalledWith(
    { _id: userId, produtorId: null },
    {
      $set: { produtorId: producerId },
      $push: {
        historicoVinculos: expect.objectContaining({
          usuarioId: userId,
          novo: producerId,
          origem: "PRE_CADASTRO",
        }),
      },
    },
    { new: true },
  );
});
it("Não aceita confirmação de outra conta ou token de login", async () => {
  searchResult([producer]);
  const preview = await service.consultar(userId, producer.documento);
  const write = jest.spyOn(UsuarioModel, "findOneAndUpdate");
  await expect(
    service.confirmar("outra-conta", preview.confirmacaoToken!),
  ).rejects.toMatchObject({ statusCode: 400 });
  await expect(
    service.confirmar(userId, jwt.sign({ sub: userId }, secret)),
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(write).not.toHaveBeenCalled();
});
it("Rejeita confirmação expirada", async () => {
  const token = jwt.sign({ produtorId: producerId }, secret, {
    subject: userId,
    audience: "vinculo-pre-cadastro",
    expiresIn: -1,
  });
  await expect(service.confirmar(userId, token)).rejects.toMatchObject({
    statusCode: 400,
  });
});
it("Não substitui um vínculo existente", async () => {
  jest
    .spyOn(UsuarioModel, "findById")
    .mockResolvedValue({ id: userId, produtorId: producerId } as never);
  await expect(
    service.consultar(userId, producer.documento),
  ).rejects.toMatchObject({ statusCode: 409 });
  await expect(
    service.confirmar(userId, "qualquer-token"),
  ).rejects.toMatchObject({ statusCode: 409 });
});
it("Exige nova conferência se o pré-cadastro foi alterado", async () => {
  searchResult([producer]);
  const preview = await service.consultar(userId, producer.documento);
  jest.spyOn(ProdutorModel, "findById").mockResolvedValue({
    ...producer,
    updatedAt: new Date("2026-02-01"),
  } as never);
  await expect(
    service.confirmar(userId, preview.confirmacaoToken!),
  ).rejects.toMatchObject({ statusCode: 409 });
});
it("Não sobrescreve vínculo criado enquanto o usuário confirma", async () => {
  searchResult([producer]);
  const preview = await service.consultar(userId, producer.documento);
  jest.spyOn(ProdutorModel, "findById").mockResolvedValue(producer as never);
  jest.spyOn(UsuarioModel, "findOneAndUpdate").mockResolvedValue(null);
  await expect(
    service.confirmar(userId, preview.confirmacaoToken!),
  ).rejects.toMatchObject({ statusCode: 409 });
});
it("Orienta atendimento manual se mais de um pré-cadastro corresponde", async () => {
  searchResult([producer, producer]);
  await expect(
    service.consultar(userId, producer.documento),
  ).rejects.toMatchObject({ statusCode: 409 });
});
it.each([
  { tipo: "CPF", numero: "123" },
  { tipo: "RG", numero: "12345678901" },
  { tipo: "CAD_PRO", numero: " " },
])("Valida documento: %j", async (documento) => {
  await expect(service.consultar(userId, documento)).rejects.toMatchObject({
    statusCode: 400,
  });
});

it("Reconhece pré-cadastro legado sem data de atualização", async () => {
  const legacy = { ...producer, updatedAt: undefined };
  searchResult([legacy]);
  const preview = await service.consultar(userId, producer.documento);
  jest.spyOn(ProdutorModel, "findById").mockResolvedValue(legacy as never);
  jest
    .spyOn(UsuarioModel, "findOneAndUpdate")
    .mockResolvedValue({ id: userId } as never);
  await expect(
    service.confirmar(userId, preview.confirmacaoToken!),
  ).resolves.toMatchObject({ vinculado: true });
});

it("Compara CAD/PRO digitado sem prefixo com registros legados prefixados", async () => {
  const find = searchResult([producer]);
  await service.consultar(userId, { tipo: "CAD_PRO", numero: "12345" });
  expect(find).toHaveBeenCalledWith({
    "documento.tipo": "CAD_PRO",
    "documento.numero": { $in: ["12345", "CAD-12345"] },
  });
});
it("Aceita que a pessoa cole o número CAD/PRO com prefixo sem duplicá-lo", async () => {
  searchResult([]);
  const result = await service.consultar(userId, {
    tipo: "CAD_PRO",
    numero: "CAD-12345",
  });
  expect(result).toEqual({ encontrado: false });
});
