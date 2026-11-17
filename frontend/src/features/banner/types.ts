export interface BannerImage {
  url: string
  contentType: string
  nomeOriginal: string
  largura?: number
  altura?: number
}

export interface Banner {
  id: string
  titulo: string
  textoAlternativo: string
  imagem: BannerImage
  imagemMobile?: BannerImage
  link?: string
  ativo: boolean
  ordem: number
  inicioEm?: string
  fimEm?: string
  createdAt: string
  updatedAt: string
}

export interface CatalogBanner {
  id: string
  titulo: string
  textoAlternativo: string
  link?: string
  imagemUrl: string
  imagemMobileUrl?: string
}

export interface CreateBannerInput {
  titulo: string
  textoAlternativo: string
  imagem: BannerImage
  imagemMobile?: BannerImage
  link?: string
  ativo?: boolean
  inicioEm?: string
  fimEm?: string
}

export interface UpdateBannerInput {
  titulo?: string
  textoAlternativo?: string
  imagem?: BannerImage
  imagemMobile?: BannerImage | null
  link?: string | null
  ativo?: boolean
  inicioEm?: string | null
  fimEm?: string | null
}

/** Situação calculada para exibir no backoffice. */
export type BannerSituation = 'no-ar' | 'agendado' | 'expirado' | 'inativo'
