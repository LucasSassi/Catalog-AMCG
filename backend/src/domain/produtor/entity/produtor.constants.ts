export const PRODUTOR_COLLECTION = "produtores";

export const STATUS_PRODUTOR = ["PENDENTE", "APROVADO", "REJEITADO"] as const;
export type StatusProdutor = (typeof STATUS_PRODUTOR)[number];

export const TIPO_DOCUMENTO = ["CNPJ", "CPF", "CAD_PRO"] as const;
export type TipoDocumento = (typeof TIPO_DOCUMENTO)[number];

export const REGISTRO_PRODUTOR_TIPO = ["SIM"] as const;
export type RegistroProdutorTipo = (typeof REGISTRO_PRODUTOR_TIPO)[number];

export const MAX_DESTAQUES = 3;

export const UF_BRASIL = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;
export type UfBrasil = (typeof UF_BRASIL)[number];

export function isUfBrasil(value: string): value is UfBrasil {
  return (UF_BRASIL as readonly string[]).includes(value);
}

export function listUfsBrasil(): readonly UfBrasil[] {
  return UF_BRASIL;
}

export const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export const CPF_LENGTH = 11;
export const CNPJ_LENGTH = 14;

export const MAX_HISTORIA_LENGTH = 2000;
export const MIN_FOTOS = 1;
export const MAX_FOTOS = 8;

export const CONTENT_TYPES_IMAGEM = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const TIPO_REDE_SOCIAL = ["INSTAGRAM", "FACEBOOK"] as const;
export type TipoRedeSocial = (typeof TIPO_REDE_SOCIAL)[number];
export const MAX_REDES_SOCIAIS = 2;

export function isTipoRedeSocial(value: string): value is TipoRedeSocial {
  return (TIPO_REDE_SOCIAL as readonly string[]).includes(value);
}
