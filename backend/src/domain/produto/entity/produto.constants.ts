export const PRODUTO_COLLECTION = "produtos";

export const STATUS_PRODUTO = ["PENDENTE", "APROVADO", "REJEITADO"] as const;
export type StatusProduto = (typeof STATUS_PRODUTO)[number];

export const CATEGORIA_PRODUTO = [
  "MEL",
  "QUEIJO",
  "GELEIA",
  "CARNE",
  "BEBIDAS",
  "BOLACHAS",
  "PAES",
  "OUTROS",
] as const;
export type CategoriaProduto = (typeof CATEGORIA_PRODUTO)[number];

export const UNIDADE_MEDIDA = [
  "KG",
  "G",
  "UNIDADE",
  "LITRO",
  "ML",
  "DÚZIA",
  "CAIXA",
  "PACOTE",
] as const;
export type UnidadeMedida = (typeof UNIDADE_MEDIDA)[number];

export const REGISTRO_PRODUTO_TIPO = ["SELO ARTE", "MAPA", "Outro"] as const;
export type RegistroProdutoTipo = (typeof REGISTRO_PRODUTO_TIPO)[number];

export const MIN_REGISTROS = 1;
export const MAX_REGISTROS = 5;
export const MIN_FOTOS = 1;
export const MAX_FOTOS = 5;

export const CONTENT_TYPES_IMAGEM = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const CONTENT_TYPES_COMPROVANTE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const ANO_MIN = 1900;

export function listCategoriasProduto(): readonly CategoriaProduto[] {
  return CATEGORIA_PRODUTO;
}

export function listUnidadesMedida(): readonly UnidadeMedida[] {
  return UNIDADE_MEDIDA;
}

export function isCategoriaProduto(value: string): value is CategoriaProduto {
  return (CATEGORIA_PRODUTO as readonly string[]).includes(value);
}

export function isUnidadeMedida(value: string): value is UnidadeMedida {
  return (UNIDADE_MEDIDA as readonly string[]).includes(value);
}
