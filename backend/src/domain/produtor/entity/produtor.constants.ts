export const PRODUTOR_COLLECTION = "produtores";

export const STATUS_PRODUTOR = ["PENDENTE", "APROVADO", "REJEITADO"] as const;
export type StatusProdutor = (typeof STATUS_PRODUTOR)[number];

export const TIPO_DOCUMENTO = ["CNPJ", "CPF", "CAD_PRO"] as const;
export type TipoDocumento = (typeof TIPO_DOCUMENTO)[number];

export const REGISTRO_PRODUTOR_TIPO = ["SIM", "SUSAF", "SIF", "Outro"] as const;
export type RegistroProdutorTipo = (typeof REGISTRO_PRODUTOR_TIPO)[number];

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
