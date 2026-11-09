import { Schema } from "mongoose";
import { BANNER_COLLECTION } from "../../../../domain/banner/entity/banner.constants";

export interface BannerImagemDocument {
  url: string;
  contentType: string;
  nomeOriginal: string;
  largura?: number;
  altura?: number;
}

export interface BannerDocument {
  titulo: string;
  textoAlternativo: string;
  imagem: BannerImagemDocument;
  imagemMobile?: BannerImagemDocument;
  link?: string;
  ativo: boolean;
  ordem: number;
  inicioEm?: Date;
  fimEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerImagemSchema = new Schema<BannerImagemDocument>(
  {
    url: { type: String, required: true },
    contentType: { type: String, required: true },
    nomeOriginal: { type: String, required: true, trim: true },
    largura: { type: Number },
    altura: { type: Number },
  },
  { _id: false },
);

export const bannerSchema = new Schema<BannerDocument>(
  {
    titulo: { type: String, required: true, trim: true },
    textoAlternativo: { type: String, required: true, trim: true },
    imagem: { type: bannerImagemSchema, required: true },
    imagemMobile: { type: bannerImagemSchema },
    link: { type: String, trim: true },
    ativo: { type: Boolean, required: true, default: true },
    ordem: { type: Number, required: true, default: 0, index: true },
    inicioEm: { type: Date },
    fimEm: { type: Date },
  },
  {
    collection: BANNER_COLLECTION,
    timestamps: true,
  },
);
