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
      cep: "84010000",
      rua: "Rua das Flores",
      bairro: "Centro",
      cidade: "Ponta Grossa",
      estado: "PR",
    },
    exibirEndereco: true,
    historia: "Produtor familiar dos Campos Gerais com tradição artesanal.",
    logo: arquivoValido,
    fotos: [arquivoValido],
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
    descricaoBreve: "Produto artesanal dos Campos Gerais",
    descricao: "Mel puro de Campos Gerais",
    categoria: "MEL_E_DERIVADOS",
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


  it("Oculta produtos públicos enquanto o perfil do produtor aguarda reaprovação", async () => {
    const product = await service.create(buildInput(produtorAprovadoId));
    await service.update(product.id, { status: "APROVADO" });
    await produtorService.update(produtorAprovadoId, { historia: "História atualizada" });
    expect((await service.listCatalog()).produtos).toHaveLength(0);
    await expect(service.getCatalogById(product.id)).rejects.toMatchObject({ statusCode: 404 });
    await produtorService.update(produtorAprovadoId, { status: "APROVADO" });
    expect((await service.listCatalog()).produtos).toHaveLength(1);
  });
  describe("Quando cadastrar um produto", () => {
    it("Deve criar o produto com status PENDENTE e ativo true", async () => {
      const produto = await service.create(buildInput(produtorAprovadoId));

      expect(produto).toMatchObject({
        nome: "Mel Artesanal",
        status: "PENDENTE",
        ativo: true,
        valorCentavos: 3500,
        categoria: "MEL_E_DERIVADOS",
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
          registros: [{ tipo: "SIM", numero: "REG-002" }],
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

    it("Deve lançar conflito quando o número de registro já é de outro produtor", async () => {
      await service.create(buildInput(produtorAprovadoId));

      const outroProdutor = await produtorService.create(
        buildProdutorInput({
          documento: { tipo: "CNPJ", numero: "98765432000155" },
          registros: [{ tipo: "SIM", numero: "REG-OUTRO-PRODUTOR" }],
        }),
      );
      await produtorService.update(outroProdutor.id, { status: "APROVADO" });

      await expect(
        service.create(
          buildInput(outroProdutor.id, {
            registros: [{ tipo: "MAPA", numero: "REG-PROD-001" }],
          }),
        ),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("Deve permitir o mesmo número de registro em produtos do mesmo produtor", async () => {
      await service.create(buildInput(produtorAprovadoId));

      const segundo = await service.create(
        buildInput(produtorAprovadoId, { nome: "Mel Silvestre" }),
      );

      expect(segundo.registros[0].numero).toBe("REG-PROD-001");
    });

    it("Deve exigir descrição breve", async () => {
      await expect(
        service.create(buildInput(produtorAprovadoId, { descricaoBreve: "  " })),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("Deve rejeitar descrição breve acima do limite", async () => {
      await expect(
        service.create(
          buildInput(produtorAprovadoId, { descricaoBreve: "a".repeat(201) }),
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
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

  describe("Quando listar o catálogo público", () => {
    it("Deve retornar apenas produtos publicáveis com dados do produtor", async () => {
      const produto = await service.create(buildInput(produtorAprovadoId));
      await service.update(produto.id, { status: "APROVADO" });
      await service.create(
        buildInput(produtorAprovadoId, {
          nome: "Queijo pendente",
          categoria: "QUEIJOS_E_LACTEOS",
          registros: [{ tipo: "MAPA", numero: "REG-PROD-002" }],
        }),
      );

      const catalogo = await service.listCatalog({
        busca: "Mel",
        categoria: "MEL_E_DERIVADOS",
      });

      expect(catalogo.produtos).toHaveLength(1);
      expect(catalogo.produtos[0]).toMatchObject({
        nome: "Mel Artesanal",
        produtor: {
          nome: "Fazenda Campos Gerais",
          municipio: "Ponta Grossa",
          telefone: "+5542999999999",
        },
      });
      expect(catalogo.categorias).toContain("MEL_E_DERIVADOS");
      expect(catalogo.municipios).toEqual(["Ponta Grossa"]);
      expect(catalogo.pageSize).toBe(12);
      expect(catalogo.hasNext).toBe(false);
    });

    it("Deve retornar apenas produtos premiados quando filtrar por premiado", async () => {
      const comum = await service.create(buildInput(produtorAprovadoId));
      await service.update(comum.id, { status: "APROVADO" });
      const premiado = await service.create(
        buildInput(produtorAprovadoId, {
          nome: "Mel Premiado",
          registros: [{ tipo: "MAPA", numero: "REG-PREMIADO-001" }],
          premiacoes: [
            {
              nome: "Prêmio Campos Gerais",
              descricao: "Melhor mel artesanal da região",
              ano: 2024,
              comprovante: arquivoValido,
            },
          ],
        }),
      );
      await service.update(premiado.id, { status: "APROVADO" });

      const filtrado = await service.listCatalog({ premiado: true });
      const todos = await service.listCatalog({});

      expect(filtrado.produtos.map((produto) => produto.nome)).toEqual([
        "Mel Premiado",
      ]);
      expect(filtrado.produtos[0]?.premiado).toBe(true);
      expect(todos.produtos).toHaveLength(2);
    });
  });

  describe("Quando buscar o detalhe do catálogo público", () => {
    it("Deve retornar fotos, registros, SIM, logo do produtor e premiações sem comprovante", async () => {
      const produto = await service.create(
        buildInput(produtorAprovadoId, {
          registros: [
            { tipo: "MAPA", numero: "REG-MAPA-001" },
            { tipo: "SIF", numero: "REG-SIF-001" },
          ],
          fotosDivulgacao: [
            arquivoValido,
            {
              url: "https://example.com/foto-2.jpg",
              contentType: "image/jpeg",
              nomeOriginal: "foto-2.jpg",
            },
          ],
          premiacoes: [
            {
              nome: "Prêmio Campos Gerais",
              descricao: "Melhor mel artesanal da região",
              ano: 2024,
              comprovante: arquivoValido,
            },
          ],
        }),
      );
      await service.update(produto.id, { status: "APROVADO" });

      const detalhe = await service.getCatalogById(produto.id);

      expect(detalhe.fotosDivulgacao).toHaveLength(2);
      expect(detalhe.registros).toEqual([
        { tipo: "MAPA" },
        { tipo: "SIF" },
      ]);
      expect(detalhe.premiacoes).toEqual([
        {
          nome: "Prêmio Campos Gerais",
          descricao: "Melhor mel artesanal da região",
          ano: 2024,
        },
      ]);
      expect(detalhe.premiacoes[0]).not.toHaveProperty("comprovante");
      expect(detalhe.premiado).toBe(true);
      expect(detalhe.produtor).toMatchObject({
        nome: "Fazenda Campos Gerais",
        municipio: "Ponta Grossa",
        temRegistroSim: true,
        logo: arquivoValido,
      });
    });
  });

  describe("Quando listar produtos do produtor no catálogo público", () => {
    it("Deve retornar apenas produtos aprovados do produtor, excluir o id informado e paginar de 3", async () => {
      const outrosProdutor = await produtorService.create(
        buildProdutorInput({
          nomeEmpresa: "Outra Fazenda",
          documento: { tipo: "CNPJ", numero: "98765432000188" },
          registros: [{ tipo: "SIM", numero: "REG-OUTRO-001" }],
          contato: {
            telefone: "+5542888888888",
            email: "outra@fazenda.com",
          },
        }),
      );
      await produtorService.update(outrosProdutor.id, { status: "APROVADO" });

      const produtosDoProdutor = [];
      for (let index = 1; index <= 5; index += 1) {
        const produto = await service.create(
          buildInput(produtorAprovadoId, {
            nome: `Produto ${index}`,
            registros: [{ tipo: "SELO ARTE", numero: `REG-DO-PROD-${index}` }],
          }),
        );
        await service.update(produto.id, { status: "APROVADO" });
        produtosDoProdutor.push(produto);
      }

      const pendente = await service.create(
        buildInput(produtorAprovadoId, {
          nome: "Produto Pendente",
          registros: [{ tipo: "SELO ARTE", numero: "REG-DO-PROD-PENDENTE" }],
        }),
      );

      const deOutro = await service.create(
        buildInput(outrosProdutor.id, {
          nome: "Produto de Outro",
          registros: [{ tipo: "SELO ARTE", numero: "REG-OUTRO-PROD-001" }],
        }),
      );
      await service.update(deOutro.id, { status: "APROVADO" });

      const excludeId = produtosDoProdutor[0].id;
      const pagina = await service.listDoProdutor({
        produtorId: produtorAprovadoId,
        excludeId,
        pageSize: 3,
      });

      expect(pagina.pageSize).toBe(3);
      expect(pagina.produtos).toHaveLength(3);
      expect(pagina.hasNext).toBe(true);
      expect(
        pagina.produtos.every(
          (produto) =>
            produto.produtor.id === produtorAprovadoId &&
            produto.id !== excludeId &&
            produto.id !== pendente.id,
        ),
      ).toBe(true);
      expect(
        pagina.produtos.some((produto) => produto.id === deOutro.id),
      ).toBe(false);
    });
  });

  describe("Quando listar produtos", () => {
    it("Deve filtrar por produtorId e categoria", async () => {
      await service.create(buildInput(produtorAprovadoId));
      await service.create(
        buildInput(produtorAprovadoId, {
          nome: "Queijo Artesanal",
          categoria: "QUEIJOS_E_LACTEOS",
          registros: [{ tipo: "MAPA", numero: "REG-PROD-002" }],
        }),
      );

      const porProdutor = await service.list({ produtorId: produtorAprovadoId });
      expect(porProdutor).toHaveLength(2);

      const porCategoria = await service.list({ categoria: "MEL_E_DERIVADOS" });
      expect(porCategoria).toHaveLength(1);
      expect(porCategoria[0].categoria).toBe("MEL_E_DERIVADOS");
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
    it.each([
      { nome: "Novo nome" },
      { descricaoBreve: "Nova descrição breve" },
      { descricao: "Nova descrição completa do produto" },
      { valorCentavos: 9900 },
      { fotosDivulgacao: [{ ...arquivoValido, url: "https://example.com/nova.jpg" }] },
      { fotosAvaliacao: [{ ...arquivoValido, url: "https://example.com/nova.jpg" }] },
    ])("Deve retirar do catálogo e registrar alteração: %j", async (input) => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.update(criado.id, { status: "APROVADO" });
      await service.setDestaque(criado.id, true);
      const atualizado = await service.update(criado.id, { ...input, autorId: "conta-1" });
      expect(atualizado).toMatchObject({ status: "PENDENTE", ativo: false, destaque: false, origemPendencia: "ALTERACAO", alteradoPor: "conta-1" });
      expect(atualizado.camposAlterados).toEqual(Object.keys(input));
      expect((await service.listCatalog()).produtos).toHaveLength(0);
      expect((await service.listDestaques()).produtos).toHaveLength(0);
      await expect(service.getCatalogById(criado.id)).rejects.toMatchObject({ statusCode: 404 });
      const aprovado = await service.update(criado.id, { status: "APROVADO", revisao: atualizado.revisao });
      expect(aprovado).toMatchObject({ ativo: true, status: "APROVADO", destaque: false });
    });
    it("Deve manter aprovação quando não há mudança efetiva", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      const aprovado = await service.update(criado.id, { status: "APROVADO" });
      const atualizado = await service.update(criado.id, { nome: `  ${criado.nome}  `, valorCentavos: criado.valorCentavos, fotosDivulgacao: criado.fotosDivulgacao, descricao: `  ${criado.descricao}  `, descricaoBreve: `  ${criado.descricaoBreve}  ` });
      expect(atualizado.status).toBe("APROVADO");
      expect(atualizado.ativo).toBe(true);
      await expect(service.update(criado.id, { status: "APROVADO", revisao: aprovado.revisao })).rejects.toMatchObject({ statusCode: 409 });
    });
    it.each([{ descricaoBreve: "   " }, { descricaoBreve: "a".repeat(201) }, { descricao: "  " }])("Deve rejeitar descrição inválida sem alterar o produto: %j", async (input) => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.update(criado.id, { status: "APROVADO" });
      await expect(service.update(criado.id, input)).rejects.toMatchObject({ statusCode: 400 });
      expect(await service.getById(criado.id)).toMatchObject({ status: "APROVADO", ativo: true, descricao: criado.descricao, descricaoBreve: criado.descricaoBreve });
    });
    it("Deve impedir edição e aprovação na mesma operação", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await expect(service.update(criado.id, { nome: "Novo nome", status: "APROVADO" })).rejects.toMatchObject({ statusCode: 400 });
    });
    it("Deve permitir correção de rejeitado com nova pendência e remover motivo", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.update(criado.id, { status: "REJEITADO", motivoRejeicao: "Corrigir preço" });
      const atualizado = await service.update(criado.id, { valorCentavos: 4000 });
      expect(atualizado).toMatchObject({ status: "PENDENTE", ativo: false });
      expect(atualizado.motivoRejeicao).toBeUndefined();
    });

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

  describe("Quando destacar um produto", () => {
    it("Deve destacar produto aprovado", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));
      await service.update(criado.id, { status: "APROVADO" });

      const destacado = await service.setDestaque(criado.id, true);
      expect(destacado.destaque).toBe(true);
    });

    it("Deve rejeitar destaque de produto pendente", async () => {
      const criado = await service.create(buildInput(produtorAprovadoId));

      await expect(service.setDestaque(criado.id, true)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });
});
