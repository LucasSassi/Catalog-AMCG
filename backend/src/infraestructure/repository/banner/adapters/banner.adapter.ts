import type {
  Banner,
  BannerImagem,
} from "../../../../domain/banner/entity/banner.entity";
import type { BannerModelDocument } from "../../../db/mongo/models/banner.model";
import type { BannerImagemDocument } from "../../../db/mongo/schema/banner.schema";

function toImagem(imagem: BannerImagemDocument): BannerImagem {
  return {
    url: imagem.url,
    contentType: imagem.contentType,
    nomeOriginal: imagem.nomeOriginal,
    ...(imagem.largura ? { largura: imagem.largura } : {}),
    ...(imagem.altura ? { altura: imagem.altura } : {}),
  };
}

export function toBannerEntity(document: BannerModelDocument): Banner {
  return {
    id: document._id.toString(),
    titulo: document.titulo,
    textoAlternativo: document.textoAlternativo,
    imagem: toImagem(document.imagem),
    ...(document.imagemMobile?.url
      ? { imagemMobile: toImagem(document.imagemMobile) }
      : {}),
    ...(document.link ? { link: document.link } : {}),
    ativo: document.ativo,
    ordem: document.ordem,
    ...(document.inicioEm ? { inicioEm: document.inicioEm } : {}),
    ...(document.fimEm ? { fimEm: document.fimEm } : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
