import type { Banner, BannerImagem } from "../entity/banner.entity";

export interface CreateBannerData {
  titulo: string;
  textoAlternativo: string;
  imagem: BannerImagem;
  imagemMobile?: BannerImagem;
  link?: string;
  ativo: boolean;
  ordem: number;
  inicioEm?: Date;
  fimEm?: Date;
}

/** Campos com `null` são removidos do documento. */
export interface UpdateBannerData {
  titulo?: string;
  textoAlternativo?: string;
  imagem?: BannerImagem;
  imagemMobile?: BannerImagem | null;
  link?: string | null;
  ativo?: boolean;
  ordem?: number;
  inicioEm?: Date | null;
  fimEm?: Date | null;
}

export interface IBannerRepositoryWrite {
  create(data: CreateBannerData): Promise<Banner>;
  update(id: string, data: UpdateBannerData): Promise<Banner | null>;
  delete(id: string): Promise<boolean>;
  /** Grava a nova ordem: o índice de cada id no array vira sua `ordem`. */
  updateOrdem(ids: string[]): Promise<void>;
}
