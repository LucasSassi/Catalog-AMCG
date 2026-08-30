import { ProdutorService } from "../../../../domain/produtor/service/produtor.service";
import type { CadastrarProdutorInput } from "../../../../domain/produtor/entity/produtor.entity";
import { InMemoryProdutorRepository } from "../../../mocks/produtor.repository.mock";

function buildInput(
  overrides: Partial<CadastrarProdutorInput> = {},
): CadastrarProdutorInput {
  return {
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
    ...overrides,
  };
}

describe("Quando usar o ProdutorService", () => {
  let repository: InMemoryProdutorRepository;
  let service: ProdutorService;

  beforeEach(() => {
    repository = new InMemoryProdutorRepository();
    service = new ProdutorService({
      readRepository: repository,
      writeRepository: repository,
    });
  });

  describe("Quando cadastrar um produtor", () => {
    it("Deve criar o produtor com status PENDENTE e ativo true", async () => {
      const produtor = await service.create(buildInput());

      expect(produtor).toMatchObject({
        nomeEmpresa: "Fazenda Campos Gerais",
        status: "PENDENTE",
        ativo: true,
        documento: { tipo: "CNPJ", numero: "12345678000199" },
      });
      expect(produtor.id).toEqual(expect.any(String));
    });

    it("Deve lançar conflito quando o documento já existe", async () => {
      await service.create(buildInput());

      await expect(
        service.create(
          buildInput({
            registros: [{ tipo: "SIF", numero: "REG-002" }],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("Deve lançar conflito quando o número de registro já existe", async () => {
      await service.create(buildInput());

      await expect(
        service.create(
          buildInput({
            documento: { tipo: "CPF", numero: "12345678901" },
            registros: [{ tipo: "SUSAF", numero: "REG-001" }],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("Deve exigir tipoOutros quando o tipo for Outro", async () => {
      await expect(
        service.create(
          buildInput({
            registros: [{ tipo: "Outro", numero: "REG-OUTRO" }],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve criar quando tipo Outro com tipoOutros informado", async () => {
      const produtor = await service.create(
        buildInput({
          registros: [
            { tipo: "Outro", tipoOutros: "Certificado local", numero: "REG-X" },
          ],
        }),
      );

      expect(produtor.registros[0]).toMatchObject({
        tipo: "Outro",
        tipoOutros: "Certificado local",
      });
    });

    it("Deve rejeitar telefone que não está em E.164", async () => {
      await expect(
        service.create(
          buildInput({
            contato: {
              telefone: "42999999999",
              email: "contato@fazenda.com",
            },
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve rejeitar UF inválida no endereço", async () => {
      await expect(
        service.create(
          buildInput({
            endereco: {
              rua: "Rua das Flores",
              bairro: "Centro",
              cidade: "Ponta Grossa",
              estado: "XX" as "PR",
            },
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("Quando listar produtores", () => {
    it("Deve retornar produtores e filtrar por ativo", async () => {
      const primeiro = await service.create(buildInput());
      await service.create(
        buildInput({
          documento: { tipo: "CPF", numero: "12345678901" },
          registros: [{ tipo: "SIF", numero: "REG-002" }],
        }),
      );
      await service.remove(primeiro.id);

      const todos = await service.list();
      expect(todos).toHaveLength(2);

      const ativos = await service.list({ ativo: true });
      expect(ativos).toHaveLength(1);
      expect(ativos[0].ativo).toBe(true);
    });
  });

  describe("Quando buscar produtor por id", () => {
    it("Deve retornar o produtor existente", async () => {
      const criado = await service.create(buildInput());
      const encontrado = await service.getById(criado.id);
      expect(encontrado.nomeEmpresa).toBe("Fazenda Campos Gerais");
    });

    it("Deve lançar not found quando o id não existe", async () => {
      await expect(service.getById("inexistente")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("Quando atualizar um produtor", () => {
    it("Deve atualizar o nome sem alterar o status", async () => {
      const criado = await service.create(buildInput());
      const atualizado = await service.update(criado.id, {
        nomeEmpresa: "Fazenda Nova",
      });

      expect(atualizado.nomeEmpresa).toBe("Fazenda Nova");
      expect(atualizado.status).toBe("PENDENTE");
    });

    it("Deve impedir atualizar para documento já usado", async () => {
      const primeiro = await service.create(buildInput());
      await service.create(
        buildInput({
          documento: { tipo: "CPF", numero: "12345678901" },
          registros: [{ tipo: "SIF", numero: "REG-002" }],
        }),
      );

      await expect(
        service.update(primeiro.id, {
          documento: { tipo: "CPF", numero: "12345678901" },
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("Quando remover um produtor", () => {
    it("Deve marcar ativo como false", async () => {
      const criado = await service.create(buildInput());
      await service.remove(criado.id);

      const encontrado = await service.getById(criado.id);
      expect(encontrado.ativo).toBe(false);
    });

    it("Deve ser idempotente quando já estiver inativo", async () => {
      const criado = await service.create(buildInput());
      await service.remove(criado.id);
      await expect(service.remove(criado.id)).resolves.toBeUndefined();
    });
  });
});
