import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../../domain/common/errors/app-error";
import { MAX_BANNERS_ATIVOS } from "../../../../domain/banner/entity/banner.constants";
import type { CadastrarBannerInput } from "../../../../domain/banner/entity/banner.entity";
import { BannerService } from "../../../../domain/banner/service/banner.service";
import { InMemoryBannerRepository } from "../../../mocks/banner.repository.mock";

const PNG_DATA_URL = `data:image/png;base64,${Buffer.from("imagem-falsa").toString("base64")}`;

function bannerInput(
  overrides: Partial<CadastrarBannerInput> = {},
): CadastrarBannerInput {
  return {
    titulo: "Mel do Rei Abelha",
    textoAlternativo: "Pote de mel sobre a mesa",
    imagem: {
      url: PNG_DATA_URL,
      contentType: "image/png",
      nomeOriginal: "mel.png",
    },
    ...overrides,
  };
}

describe("Quando usar o BannerService", () => {
  let repository: InMemoryBannerRepository;
  let service: BannerService;

  beforeEach(() => {
    repository = new InMemoryBannerRepository();
    service = new BannerService({
      readRepository: repository,
      writeRepository: repository,
    });
  });

  describe("Quando cadastrar", () => {
    it("Deve criar ativo e no fim da ordem", async () => {
      const primeiro = await service.cadastrar(bannerInput());
      const segundo = await service.cadastrar(bannerInput({ titulo: "Queijo" }));

      expect(primeiro).toMatchObject({ ativo: true, ordem: 0 });
      expect(segundo).toMatchObject({ ativo: true, ordem: 1 });
    });

    it("Deve rejeitar imagem que não é data URL de imagem suportada", async () => {
      await expect(
        service.cadastrar(
          bannerInput({
            imagem: {
              url: "data:application/pdf;base64,AAAA",
              contentType: "application/pdf",
              nomeOriginal: "arquivo.pdf",
            },
          }),
        ),
      ).rejects.toBeInstanceOf(ValidationError);

      await expect(
        service.cadastrar(
          bannerInput({
            imagem: {
              url: "https://exemplo.com/banner.png",
              contentType: "image/png",
              nomeOriginal: "banner.png",
            },
          }),
        ),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("Deve rejeitar link que não seja caminho interno ou http(s)", async () => {
      await expect(
        service.cadastrar(bannerInput({ link: "javascript:alert(1)" })),
      ).rejects.toBeInstanceOf(ValidationError);

      await expect(
        service.cadastrar(bannerInput({ link: "/produtos/123" })),
      ).resolves.toMatchObject({ link: "/produtos/123" });
    });

    it("Deve rejeitar período com fim antes do início", async () => {
      await expect(
        service.cadastrar(
          bannerInput({
            inicioEm: new Date("2026-12-10"),
            fimEm: new Date("2026-12-01"),
          }),
        ),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("Deve impedir passar do limite de banners ativos", async () => {
      for (let index = 0; index < MAX_BANNERS_ATIVOS; index += 1) {
        await service.cadastrar(bannerInput({ titulo: `Banner ${index}` }));
      }

      await expect(service.cadastrar(bannerInput())).rejects.toBeInstanceOf(
        ConflictError,
      );
      await expect(
        service.cadastrar(bannerInput({ ativo: false })),
      ).resolves.toMatchObject({ ativo: false });
    });
  });

  describe("Quando alterar ativo, ordem e dados", () => {
    it("Deve desativar e reativar respeitando o limite", async () => {
      const banner = await service.cadastrar(bannerInput());

      await expect(service.setAtivo(banner.id, false)).resolves.toMatchObject({
        ativo: false,
      });
      await expect(service.setAtivo(banner.id, true)).resolves.toMatchObject({
        ativo: true,
      });
    });

    it("Deve reordenar quando todos os ids forem informados", async () => {
      const a = await service.cadastrar(bannerInput({ titulo: "A" }));
      const b = await service.cadastrar(bannerInput({ titulo: "B" }));

      const ordenados = await service.reordenar([b.id, a.id]);
      expect(ordenados.map((banner) => banner.titulo)).toEqual(["B", "A"]);

      await expect(service.reordenar([a.id])).rejects.toBeInstanceOf(
        ValidationError,
      );
    });

    it("Deve remover link e imagem para celular quando receber null", async () => {
      const banner = await service.cadastrar(
        bannerInput({
          link: "/produtores",
          imagemMobile: {
            url: PNG_DATA_URL,
            contentType: "image/png",
            nomeOriginal: "mobile.png",
          },
        }),
      );

      const atualizado = await service.update(banner.id, {
        link: null,
        imagemMobile: null,
      });

      expect(atualizado.link).toBeUndefined();
      expect(atualizado.imagemMobile).toBeUndefined();
    });

    it("Deve lançar NotFound ao remover banner inexistente", async () => {
      await expect(service.remove("999")).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("Quando listar para o catálogo", () => {
    it("Deve trazer só ativos dentro do período, na ordem, com URL de imagem", async () => {
      const agora = new Date("2026-11-09T12:00:00Z");
      const visivel = await service.cadastrar(bannerInput({ titulo: "Visível" }));
      await service.cadastrar(bannerInput({ titulo: "Inativo", ativo: false }));
      await service.cadastrar(
        bannerInput({ titulo: "Futuro", inicioEm: new Date("2026-12-01") }),
      );
      await service.cadastrar(
        bannerInput({ titulo: "Expirado", fimEm: new Date("2026-11-01") }),
      );

      const catalogo = await service.listCatalogo(agora);

      expect(catalogo).toHaveLength(1);
      expect(catalogo[0]).toMatchObject({
        id: visivel.id,
        titulo: "Visível",
        imagemUrl: expect.stringContaining(`/api/banners/${visivel.id}/imagem`),
      });
      expect(catalogo[0]).not.toHaveProperty("imagem");
    });

    it("Deve decodificar a imagem para ser servida", async () => {
      const banner = await service.cadastrar(bannerInput());
      const arquivo = await service.getImagem(banner.id, "desktop");

      expect(arquivo.contentType).toBe("image/png");
      expect(arquivo.buffer.toString()).toBe("imagem-falsa");
      await expect(service.getImagem(banner.id, "mobile")).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
