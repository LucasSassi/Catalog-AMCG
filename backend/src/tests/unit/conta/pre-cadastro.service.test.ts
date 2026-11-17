import jwt from "jsonwebtoken";
import {
  CODIGO_VERIFICACAO_MAX_TENTATIVAS,
  mascararEmail,
  PreCadastroService,
} from "../../../application/services/pre-cadastro.service";
import { UsuarioModel } from "../../../infraestructure/db/mongo/models/usuario.model";
import { ProdutorModel } from "../../../infraestructure/db/mongo/models/produtor.model";
import {
  FakeEmailSender,
  InMemoryCodigoVerificacaoRepository,
} from "../../mocks/codigo-verificacao.repository.mock";

const userId = "507f1f77bcf86cd799439011",
  producerId = "507f1f77bcf86cd799439012";
const secret = "pre-cadastro-test";
const CODIGO = "123456";
const producer = {
  _id: producerId,
  nomeEmpresa: "Fazenda",
  documento: { tipo: "CPF", numero: "12345678901" },
  contato: { telefone: "+5542999999999", email: "joao.silva@gmail.com" },
  historia: "História",
  endereco: { cidade: "Ponta Grossa" },
  updatedAt: new Date("2026-01-01"),
  status: "APROVADO",
  ativo: true,
};

let agora: Date;
let emailSender: FakeEmailSender;
let codigos: InMemoryCodigoVerificacaoRepository;
let service: PreCadastroService;

beforeEach(() => {
  agora = new Date("2026-11-17T12:00:00Z");
  emailSender = new FakeEmailSender();
  codigos = new InMemoryCodigoVerificacaoRepository(() => agora);
  service = new PreCadastroService(secret, {
    emailSender,
    codigos,
    agora: () => agora,
    gerarCodigo: () => CODIGO,
  });
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

/** Consulta, recebe o código "por e-mail" e verifica: devolve os dados liberados. */
async function consultarEVerificar(item: typeof producer = producer) {
  searchResult([item]);
  jest.spyOn(ProdutorModel, "findById").mockResolvedValue(item as never);
  const consulta = await service.consultar(userId, item.documento);
  if (!consulta.encontrado) throw new Error("pré-cadastro não encontrado");
  return service.verificar(userId, {
    verificacaoId: consulta.verificacaoId,
    codigo: CODIGO,
  });
}

describe("Quando consultar um pré-cadastro pelo documento", () => {
  it.each([
    [{ tipo: "CPF", numero: "123.456.789-01" }, ["12345678901"]],
    [{ tipo: "CNPJ", numero: "12.345.678/0001-99" }, ["12345678000199"]],
    [{ tipo: "CAD_PRO", numero: "CAD/123-45" }, ["CAD/123-45", "CAD-CAD/123-45"]],
  ])(
    "Deve buscar pelo mesmo tipo e número normalizado: %j",
    async (documento, numeros) => {
      const find = searchResult([]);
      const result = await service.consultar(userId, documento);
      expect(result).toEqual({ encontrado: false });
      expect(find).toHaveBeenCalledWith({
        "documento.tipo": documento.tipo,
        "documento.numero": { $in: numeros },
      });
    },
  );

  it("Deve comparar CAD/PRO digitado sem prefixo com registros legados prefixados", async () => {
    const find = searchResult([]);
    await service.consultar(userId, { tipo: "CAD_PRO", numero: "12345" });
    expect(find).toHaveBeenCalledWith({
      "documento.tipo": "CAD_PRO",
      "documento.numero": { $in: ["12345", "CAD-12345"] },
    });
  });

  it("Deve aceitar o número CAD/PRO colado com prefixo sem duplicá-lo", async () => {
    searchResult([]);
    const result = await service.consultar(userId, {
      tipo: "CAD_PRO",
      numero: "CAD-12345",
    });
    expect(result).toEqual({ encontrado: false });
  });

  it.each([
    { tipo: "CPF", numero: "123" },
    { tipo: "RG", numero: "12345678901" },
    { tipo: "CAD_PRO", numero: " " },
  ])("Deve validar o documento: %j", async (documento) => {
    await expect(service.consultar(userId, documento)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("Deve orientar atendimento manual se mais de um pré-cadastro corresponde", async () => {
    searchResult([producer, producer]);
    await expect(
      service.consultar(userId, producer.documento),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("Deve enviar um código para o e-mail do pré-cadastro sem revelar os dados do produtor", async () => {
    searchResult([producer]);
    const result = await service.consultar(userId, producer.documento);

    expect(result).toEqual({
      encontrado: true,
      verificacaoId: expect.any(String),
      emailMascarado: "jo***@g***.com",
      reenvioEmSegundos: 60,
    });
    expect(result).not.toHaveProperty("produtor");
    expect(result).not.toHaveProperty("confirmacaoToken");
    expect(emailSender.enviados).toHaveLength(1);
    expect(emailSender.enviados[0]).toMatchObject({
      to: "joao.silva@gmail.com",
    });
    expect(emailSender.enviados[0]?.text).toContain(CODIGO);
    expect(
      [...codigos.items.values()][0]?.codigoHash,
    ).not.toContain(CODIGO);
  });

  it("Deve reaproveitar o código recente em vez de enviar outro e-mail", async () => {
    searchResult([producer]);
    const primeira = await service.consultar(userId, producer.documento);
    agora = new Date(agora.getTime() + 20_000);
    const segunda = await service.consultar(userId, producer.documento);

    expect(emailSender.enviados).toHaveLength(1);
    expect(segunda).toMatchObject({
      verificacaoId: primeira.encontrado ? primeira.verificacaoId : "",
      reenvioEmSegundos: 40,
    });
  });

  it("Deve enviar um novo código depois do intervalo de reenvio", async () => {
    searchResult([producer]);
    const primeira = await service.consultar(userId, producer.documento);
    agora = new Date(agora.getTime() + 61_000);
    const segunda = await service.consultar(userId, producer.documento);

    expect(emailSender.enviados).toHaveLength(2);
    expect(segunda.encontrado && segunda.verificacaoId).not.toBe(
      primeira.encontrado && primeira.verificacaoId,
    );
  });

  it("Deve recusar pré-cadastro sem e-mail cadastrado", async () => {
    searchResult([{ ...producer, contato: { telefone: "+5542999999999", email: "" } }]);
    await expect(
      service.consultar(userId, producer.documento),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(emailSender.enviados).toHaveLength(0);
  });

  it("Deve descartar o código e avisar quando o e-mail não puder ser enviado", async () => {
    searchResult([producer]);
    emailSender.falhar = true;
    await expect(
      service.consultar(userId, producer.documento),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(codigos.items.size).toBe(0);
  });

  it("Deve recusar consulta de conta que já tem vínculo", async () => {
    jest
      .spyOn(UsuarioModel, "findById")
      .mockResolvedValue({ id: userId, produtorId: producerId } as never);
    await expect(
      service.consultar(userId, producer.documento),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("Quando verificar o código enviado por e-mail", () => {
  it("Deve liberar os dados do pré-cadastro com o código correto", async () => {
    const liberado = await consultarEVerificar();

    expect(liberado.confirmacaoToken).toEqual(expect.any(String));
    expect(liberado.produtor).toMatchObject({
      nomeEmpresa: "Fazenda",
      municipio: "Ponta Grossa",
      contato: { email: "joao.silva@gmail.com" },
    });
  });

  it("Deve aceitar o código só uma vez", async () => {
    searchResult([producer]);
    jest.spyOn(ProdutorModel, "findById").mockResolvedValue(producer as never);
    const consulta = await service.consultar(userId, producer.documento);
    const input = {
      verificacaoId: consulta.encontrado ? consulta.verificacaoId : "",
      codigo: CODIGO,
    };
    await service.verificar(userId, input);
    await expect(service.verificar(userId, input)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("Deve informar as tentativas restantes e bloquear depois do limite", async () => {
    searchResult([producer]);
    const consulta = await service.consultar(userId, producer.documento);
    const verificacaoId = consulta.encontrado ? consulta.verificacaoId : "";

    await expect(
      service.verificar(userId, { verificacaoId, codigo: "000000" }),
    ).rejects.toThrow(
      `mais ${CODIGO_VERIFICACAO_MAX_TENTATIVAS - 1} tentativas`,
    );
    for (let i = 1; i < CODIGO_VERIFICACAO_MAX_TENTATIVAS; i += 1) {
      await expect(
        service.verificar(userId, { verificacaoId, codigo: "000000" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    }

    // Mesmo o código certo não vale mais: é preciso pedir outro.
    await expect(
      service.verificar(userId, { verificacaoId, codigo: CODIGO }),
    ).rejects.toThrow("novo código");
  });

  it("Deve recusar código expirado", async () => {
    searchResult([producer]);
    const consulta = await service.consultar(userId, producer.documento);
    agora = new Date(agora.getTime() + 11 * 60 * 1000);
    await expect(
      service.verificar(userId, {
        verificacaoId: consulta.encontrado ? consulta.verificacaoId : "",
        codigo: CODIGO,
      }),
    ).rejects.toThrow("expirado");
  });

  it("Deve validar o formato do código", async () => {
    await expect(
      service.verificar(userId, { verificacaoId: "x", codigo: "12ab" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("Quando mascarar o e-mail do pré-cadastro", () => {
  it("Deve mostrar só o começo do usuário e do domínio", () => {
    expect(mascararEmail("joao.silva@gmail.com")).toBe("jo***@g***.com");
    expect(mascararEmail("a@empresa.com.br")).toBe("a***@e***.br");
  });
});

describe("Quando confirmar o vínculo com o pré-cadastro", () => {
  it("Deve vincular ao usuário autenticado com auditoria", async () => {
    const write = jest
      .spyOn(UsuarioModel, "findOneAndUpdate")
      .mockResolvedValue({ id: userId, produtorId: producerId } as never);
    const liberado = await consultarEVerificar();
    expect(write).not.toHaveBeenCalled();

    await expect(
      service.confirmar(userId, liberado.confirmacaoToken),
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

  it("Deve recusar confirmação de outra conta ou token de login", async () => {
    const liberado = await consultarEVerificar();
    const write = jest.spyOn(UsuarioModel, "findOneAndUpdate");
    await expect(
      service.confirmar("outra-conta", liberado.confirmacaoToken),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.confirmar(userId, jwt.sign({ sub: userId }, secret)),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(write).not.toHaveBeenCalled();
  });

  it("Deve recusar confirmação expirada", async () => {
    const token = jwt.sign({ produtorId: producerId }, secret, {
      subject: userId,
      audience: "vinculo-pre-cadastro",
      expiresIn: -1,
    });
    await expect(service.confirmar(userId, token)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("Deve não substituir um vínculo existente", async () => {
    jest
      .spyOn(UsuarioModel, "findById")
      .mockResolvedValue({ id: userId, produtorId: producerId } as never);
    await expect(
      service.confirmar(userId, "qualquer-token"),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("Deve exigir nova conferência se o pré-cadastro foi alterado", async () => {
    const liberado = await consultarEVerificar();
    jest.spyOn(ProdutorModel, "findById").mockResolvedValue({
      ...producer,
      updatedAt: new Date("2026-02-01"),
    } as never);
    await expect(
      service.confirmar(userId, liberado.confirmacaoToken),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("Deve não sobrescrever vínculo criado enquanto o usuário confirma", async () => {
    const liberado = await consultarEVerificar();
    jest.spyOn(UsuarioModel, "findOneAndUpdate").mockResolvedValue(null);
    await expect(
      service.confirmar(userId, liberado.confirmacaoToken),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("Deve reconhecer pré-cadastro legado sem data de atualização", async () => {
    const legacy = { ...producer, updatedAt: undefined } as unknown as typeof producer;
    const liberado = await consultarEVerificar(legacy);
    jest
      .spyOn(UsuarioModel, "findOneAndUpdate")
      .mockResolvedValue({ id: userId } as never);
    await expect(
      service.confirmar(userId, liberado.confirmacaoToken),
    ).resolves.toMatchObject({ vinculado: true });
  });
});
