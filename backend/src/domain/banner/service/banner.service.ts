import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../common/errors/app-error";
import {
  BANNER_CONTENT_TYPES,
  MAX_BANNER_IMAGEM_BYTES,
  MAX_BANNERS_ATIVOS,
  type BannerVariante,
} from "../entity/banner.constants";
import type {
  AtualizarBannerInput,
  Banner,
  BannerArquivo,
  BannerCatalogo,
  BannerImagem,
  CadastrarBannerInput,
} from "../entity/banner.entity";
import type { IBannerService } from "../entity/interfaces/banner.service.interface";
import type { IBannerRepositoryRead } from "../repository/banner.repository.read";
import type { IBannerRepositoryWrite } from "../repository/banner.repository.write";

const DATA_URL_PATTERN = /^data:([\w/+.-]+);base64,([A-Za-z0-9+/=\s]+)$/;
const LINK_PATTERN = /^(\/(?!\/)|https?:\/\/)/i;

export interface BannerServiceDeps {
  readRepository: IBannerRepositoryRead;
  writeRepository: IBannerRepositoryWrite;
}

function decodeDataUrl(url: string): { contentType: string; buffer: Buffer } {
  const match = DATA_URL_PATTERN.exec(url.trim());

  if (!match) {
    throw new ValidationError("A imagem do banner deve ser enviada como arquivo");
  }

  return {
    contentType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64"),
  };
}

export class BannerService implements IBannerService {
  private readonly readRepository: IBannerRepositoryRead;
  private readonly writeRepository: IBannerRepositoryWrite;

  constructor(deps: BannerServiceDeps) {
    this.readRepository = deps.readRepository;
    this.writeRepository = deps.writeRepository;
  }

  async cadastrar(input: CadastrarBannerInput): Promise<Banner> {
    this.validarImagem(input.imagem, "imagem");

    if (input.imagemMobile) {
      this.validarImagem(input.imagemMobile, "imagem para celular");
    }

    this.validarLink(input.link);
    this.validarPeriodo(input.inicioEm, input.fimEm);

    const banners = await this.readRepository.list();
    const ativo = input.ativo ?? true;

    if (ativo) {
      this.validarLimiteAtivos(banners);
    }

    const ordem =
      banners.reduce((max, banner) => Math.max(max, banner.ordem), -1) + 1;

    return this.writeRepository.create({
      titulo: input.titulo.trim(),
      textoAlternativo: input.textoAlternativo.trim(),
      imagem: input.imagem,
      imagemMobile: input.imagemMobile,
      link: input.link?.trim() || undefined,
      ativo,
      ordem,
      inicioEm: input.inicioEm,
      fimEm: input.fimEm,
    });
  }

  list(): Promise<Banner[]> {
    return this.readRepository.list();
  }

  async getById(id: string): Promise<Banner> {
    const banner = await this.readRepository.findById(id);

    if (!banner) {
      throw new NotFoundError("Banner não encontrado");
    }

    return banner;
  }

  async update(id: string, input: AtualizarBannerInput): Promise<Banner> {
    const atual = await this.getById(id);

    if (input.imagem) {
      this.validarImagem(input.imagem, "imagem");
    }

    if (input.imagemMobile) {
      this.validarImagem(input.imagemMobile, "imagem para celular");
    }

    if (typeof input.link === "string") {
      this.validarLink(input.link);
    }

    const inicioEm =
      input.inicioEm === undefined ? atual.inicioEm : (input.inicioEm ?? undefined);
    const fimEm =
      input.fimEm === undefined ? atual.fimEm : (input.fimEm ?? undefined);
    this.validarPeriodo(inicioEm, fimEm);

    if (input.ativo === true && !atual.ativo) {
      this.validarLimiteAtivos(await this.readRepository.list());
    }

    const atualizado = await this.writeRepository.update(id, {
      ...input,
      titulo: input.titulo?.trim(),
      textoAlternativo: input.textoAlternativo?.trim(),
      link:
        typeof input.link === "string" ? input.link.trim() || null : input.link,
    });

    if (!atualizado) {
      throw new NotFoundError("Banner não encontrado");
    }

    return atualizado;
  }

  async setAtivo(id: string, ativo: boolean): Promise<Banner> {
    const atual = await this.getById(id);

    if (ativo && !atual.ativo) {
      this.validarLimiteAtivos(await this.readRepository.list());
    }

    const atualizado = await this.writeRepository.update(id, { ativo });

    if (!atualizado) {
      throw new NotFoundError("Banner não encontrado");
    }

    return atualizado;
  }

  async reordenar(ids: string[]): Promise<Banner[]> {
    const banners = await this.readRepository.list();
    const existentes = new Set(banners.map((banner) => banner.id));
    const informados = new Set(ids);

    if (
      informados.size !== ids.length ||
      informados.size !== existentes.size ||
      ids.some((id) => !existentes.has(id))
    ) {
      throw new ValidationError(
        "A nova ordem deve conter todos os banners, sem repetição",
      );
    }

    await this.writeRepository.updateOrdem(ids);
    return this.readRepository.list();
  }

  async remove(id: string): Promise<void> {
    const removido = await this.writeRepository.delete(id);

    if (!removido) {
      throw new NotFoundError("Banner não encontrado");
    }
  }

  async listCatalogo(agora: Date = new Date()): Promise<BannerCatalogo[]> {
    const banners = await this.readRepository.list();

    return banners
      .filter(
        (banner) =>
          banner.ativo &&
          (!banner.inicioEm || banner.inicioEm.getTime() <= agora.getTime()) &&
          (!banner.fimEm || banner.fimEm.getTime() >= agora.getTime()),
      )
      .map((banner) => {
        const versao = banner.updatedAt.getTime();

        return {
          id: banner.id,
          titulo: banner.titulo,
          textoAlternativo: banner.textoAlternativo,
          ...(banner.link ? { link: banner.link } : {}),
          imagemUrl: `/api/banners/${banner.id}/imagem?v=${versao}`,
          ...(banner.imagemMobile
            ? {
                imagemMobileUrl: `/api/banners/${banner.id}/imagem?variante=mobile&v=${versao}`,
              }
            : {}),
        };
      });
  }

  async getImagem(id: string, variante: BannerVariante): Promise<BannerArquivo> {
    const banner = await this.getById(id);
    const imagem = variante === "mobile" ? banner.imagemMobile : banner.imagem;

    if (!imagem) {
      throw new NotFoundError("Imagem não encontrada");
    }

    const { buffer, contentType } = decodeDataUrl(imagem.url);
    return { buffer, contentType, variante };
  }

  private validarImagem(imagem: BannerImagem, rotulo: string): void {
    const { contentType, buffer } = decodeDataUrl(imagem.url);
    const permitidos: readonly string[] = BANNER_CONTENT_TYPES;

    if (!permitidos.includes(contentType)) {
      throw new ValidationError(
        `A ${rotulo} deve ser JPG, PNG ou WebP`,
      );
    }

    if (buffer.byteLength === 0) {
      throw new ValidationError(`A ${rotulo} está vazia`);
    }

    if (buffer.byteLength > MAX_BANNER_IMAGEM_BYTES) {
      throw new ValidationError(`A ${rotulo} deve ter no máximo 1,5 MB`);
    }
  }

  private validarLink(link: string | undefined): void {
    if (link && link.trim() && !LINK_PATTERN.test(link.trim())) {
      throw new ValidationError(
        "O link deve começar com / (página do catálogo) ou http(s)://",
      );
    }
  }

  private validarPeriodo(inicioEm?: Date, fimEm?: Date): void {
    if (inicioEm && fimEm && fimEm.getTime() < inicioEm.getTime()) {
      throw new ValidationError("A data de fim deve ser depois da data de início");
    }
  }

  private validarLimiteAtivos(banners: Banner[]): void {
    const ativos = banners.filter((banner) => banner.ativo).length;

    if (ativos >= MAX_BANNERS_ATIVOS) {
      throw new ConflictError(
        `Limite de ${MAX_BANNERS_ATIVOS} banners ativos atingido. Desative outro banner primeiro`,
      );
    }
  }
}
