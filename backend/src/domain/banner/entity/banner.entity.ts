import type { BannerVariante } from "./banner.constants";

export interface BannerImagem {
  /** Data URL base64 (`data:image/webp;base64,...`). */
  url: string;
  contentType: string;
  nomeOriginal: string;
  largura?: number;
  altura?: number;
}

export interface Banner {
  id: string;
  titulo: string;
  textoAlternativo: string;
  imagem: BannerImagem;
  imagemMobile?: BannerImagem;
  link?: string;
  ativo: boolean;
  ordem: number;
  inicioEm?: Date;
  fimEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CadastrarBannerInput {
  titulo: string;
  textoAlternativo: string;
  imagem: BannerImagem;
  imagemMobile?: BannerImagem;
  link?: string;
  ativo?: boolean;
  inicioEm?: Date;
  fimEm?: Date;
}

export interface AtualizarBannerInput {
  titulo?: string;
  textoAlternativo?: string;
  imagem?: BannerImagem;
  /** `null` remove a imagem específica para celular. */
  imagemMobile?: BannerImagem | null;
  /** `null` remove o link. */
  link?: string | null;
  ativo?: boolean;
  /** `null` remove a data. */
  inicioEm?: Date | null;
  fimEm?: Date | null;
}

/** Banner como o catálogo público recebe: imagens servidas por URL. */
export interface BannerCatalogo {
  id: string;
  titulo: string;
  textoAlternativo: string;
  link?: string;
  imagemUrl: string;
  imagemMobileUrl?: string;
}

export interface BannerArquivo {
  buffer: Buffer;
  contentType: string;
  variante: BannerVariante;
}
