import { ProdutorService } from "../../../../domain/produtor/service/produtor.service";
import type { CadastrarProdutorInput } from "../../../../domain/produtor/entity/produtor.entity";
import { ProdutoService } from "../../../../domain/produto/service/produto.service";
import type { CadastrarProdutoInput } from "../../../../domain/produto/entity/produto.entity";
import { InMemoryProdutorRepository } from "../../../mocks/produtor.repository.mock";
import { InMemoryProdutoRepository } from "../../../mocks/produto.repository.mock";

const arquivoValido = {
  url: "https://example.com/foto.jpg",
  contentType: "image/jpeg",
  nomeOriginal: "foto.jpg",
};

function buildProdutorInput(
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

function buildInput(
  produtorId: string,
  overrides: Partial<CadastrarProdutoInput> = {},
): CadastrarProdutoInput {
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
    ...overrides,
  };
}

async function seedProdutorAprovado(
  produtorRepository: InMemoryProdutorRepository,
  produtorService: ProdutorService,
): Promise<string> {
  const produtor = await produtorService.create(buildProdutorInput());
  const aprovado = await produtorService.update(produtor.id, {
    status: "APROVADO",
  });
  return aprovado.id;
}

describe("Quando usar o ProdutoService", () => {
  let produtorRepository: InMemoryProdutorRepository;
  let produtoRepository: InMemoryProdutoRepository;
  let produtorService: ProdutorService;
  let service: ProdutoService;
  let produtorAprovadoId: string;

  beforeEach(async () => {
    produtorRepository = new InMemoryProdutorRepository();
    produtoRepository = new InMemoryProdutoRepository();
    produtorService = new ProdutorService({
      readRepository: produtorRepository,
      writeRepository: produtorRepository,
    });
    service = new ProdutoService({
      readRepository: produtoRepository,
      writeRepository: produtoRepository,
      produtorReadRepository: produtorRepository,
    });
    produtorAprovadoId = await seedProdutorAprovado(
      produtorRepository,
      produtorService,
    );
  });

  describe("Quando cadastrar um produto", () => {
    it("Deve criar o produto com status PENDENTE e ativo true", async () => {
      const produto = await service.create(buildInput(produtorAprovadoId));

      expect(produto).toMatchObject({
        nome: "Mel Artesanal",
        status: "PENDENTE",
        ativo: true,
        valorCentavos: 3500,
        categoria: "MEL",
      });
      expect(produto.id).toEqual(expect.any(String));
    });

    it("Deve rejeitar quando o produtor não existe", async () => {
      await expect(
        service.create(buildInput("inexistente")),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("Deve rejeitar quando o produtor não está aprovado", async () => {
      const pendente = await produtorService.create(
        buildProdutorInput({
          documento: { tipo: "CPF", numero: "12345678901" },
          registros: [{ tipo: "SIF", numero: "REG-002" }],
        }),
      );

      await expect(
        service.create(buildInput(pendente.id)),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve rejeitar valorCentavos negativo", async () => {
      await expect(
        service.create(
          buildInput(produtorAprovadoId, { valorCentavos: -100 }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve rejeitar fotosAvaliacao vazias", async () => {
      await expect(
        service.create(
          buildInput(produtorAprovadoId, { fotosAvaliacao: [] }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve rejeitar fotosDivulgacao vazias", async () => {
      await expect(
        service.create(
          buildInput(produtorAprovadoId, { fotosDivulgacao: [] }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve rejeitar registros vazios", async () => {
      await expect(
        service.create(buildInput(produtorAprovadoId, { registros: [] })),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve exigir tipoOutros quando o tipo for Outro", async () => {
      await expect(
        service.create(
          buildInput(produtorAprovadoId, {
            registros: [{ tipo: "Outro", numero: "REG-OUTRO" }],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve lançar conflito quando o número de registro já existe", async () => {
      await service.create(buildInput(produtorAprovadoId));

      await expect(
        service.create(
          buildInput(produtorAprovadoId, {
            registros: [{ tipo: "MAPA", numero: "REG-PROD-001" }],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("Deve aceitar premiacoes vazio", async () => {
      const produto = await service.create(
        buildInput(produtorAprovadoId, { premiacoes: [] }),
      );

      expect(produto.premiacoes).toEqual([]);
    });

    it("Deve rejeitar premiação com ano inválido", async () => {
      await expect(
        service.create(
          buildInput(produtorAprovadoId, {
            premiacoes: [
              {
                nome: "Prêmio",
                descricao: "Melhor mel",
                ano: 3000,
                comprovante: arquivoValido,
              },
            ],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("Quando listar produtos", () => {
    it("Deve filtrar por produtorId e categoria", async () => {
      await service.create(buildInput(produtorAprovadoId));
      await service.create(
        buildInput(produtorAprovadoId, {
          nome: "Queijo Artesanal",
          categoria: "QUEIJO",
          registros: [{ tipo: "MAPA", numero: "REG-PROD-002" }],
        }),
      );

      const porProdutor = await service.list({ produtorId: produtorAprovadoId });
      expect(porProdutor).toHaveLength(2);

      const porCategoria = await service.list({ categoria: "MEL" });
      expect(porCategoria).toHaveLength(1);
      expect(porCategoria[0].categoria).toBe("MEL");
    });
  });

  describe("Quando buscar produto por id", () => {
    it("Deve retornar o produto existente", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      const encontrado = await service.getById(criado.id);
      expect(encontrado.nome).toBe("Mel Artesanal");
    });

    it("Deve lançar not found quando o id não existe", async () => {
      await expect(service.getById("inexistente")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("Quando atualizar um produto", () => {
    it("Deve voltar o status para PENDENTE quando estava APROVADO", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.update(criado.id, { status: "APROVADO" });

      const atualizado = await service.update(criado.id, {
        nome: "Mel Premium",
      });

      expect(atualizado.nome).toBe("Mel Premium");
      expect(atualizado.status).toBe("PENDENTE");
    });

    it("Deve rejeitar body vazio", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));

      await expect(service.update(criado.id, {})).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("Deve aprovar produto via status APROVADO", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      const aprovado = await service.update(criado.id, {
        status: "APROVADO",
      });

      expect(aprovado.status).toBe("APROVADO");
      expect(aprovado.motivoRejeicao).toBeUndefined();
    });

    it("Deve rejeitar produto com motivo via status REJEITADO", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      const rejeitado = await service.update(criado.id, {
        status: "REJEITADO",
        motivoRejeicao: "Documentação incompleta",
      });

      expect(rejeitado.status).toBe("REJEITADO");
      expect(rejeitado.motivoRejeicao).toBe("Documentação incompleta");
    });

    it("Deve exigir motivo quando o status for REJEITADO", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));

      await expect(
        service.update(criado.id, { status: "REJEITADO" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve impedir motivoRejeicao sem status REJEITADO", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));

      await expect(
        service.update(criado.id, { motivoRejeicao: "Motivo inválido" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("Quando remover um produto", () => {
    it("Deve marcar ativo como false", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.remove(criado.id);

      const encontrado = await service.getById(criado.id);
      expect(encontrado.ativo).toBe(false);
    });

    it("Deve ser idempotente quando já estiver inativo", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.remove(criado.id);
      await expect(service.remove(criado.id)).resolves.toBeUndefined();
    });
  });
});
