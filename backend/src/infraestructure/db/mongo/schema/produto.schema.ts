import { Schema } from "mongoose";
import {
  CATEGORIA_PRODUTO,
  PRODUTO_COLLECTION,
  REGISTRO_PRODUTO_TIPO,
  STATUS_PRODUTO,
  UNIDADE_MEDIDA,
  type CategoriaProduto,
  type RegistroProdutoTipo,
  type StatusProduto,
  type UnidadeMedida,
} from "../../../../domain/produto/entity/produto.constants";

export interface ArquivoDocument {
  url: string;
  contentType: string;
  nomeOriginal: string;
}

export interface RegistroProdutoDocument {
  tipo: RegistroProdutoTipo;
  tipoOutros?: string;
  numero: string;
  dataEmissao?: Date;
  dataValidade?: Date;
}

export interface PremiacaoDocument {
  nome: string;
  descricao: string;
  ano: number;
  comprovante: ArquivoDocument;
}

export interface ProdutoDocument {
  produtorId: string;
  nome: string;
  descricao: string;
  categoria: CategoriaProduto;
  unidadeMedida: UnidadeMedida;
  registros: RegistroProdutoDocument[];
  fotosAvaliacao: ArquivoDocument[];
  fotosDivulgacao: ArquivoDocument[];
  premiacoes: PremiacaoDocument[];
  valorCentavos: number;
  observacoes?: string;
  ativo: boolean;
  status: StatusProduto;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
}

const arquivoSchema = new Schema<ArquivoDocument>(
  {
    url: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },
    nomeOriginal: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const registroProdutoSchema = new Schema<RegistroProdutoDocument>(
  {
    tipo: { type: String, required: true, enum: REGISTRO_PRODUTO_TIPO },
    tipoOutros: { type: String, trim: true },
    numero: { type: String, required: true, trim: true },
    dataEmissao: { type: Date },
    dataValidade: { type: Date },
  },
  { _id: false },
);

const premiacaoSchema = new Schema<PremiacaoDocument>(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, required: true, trim: true },
    ano: { type: Number, required: true },
    comprovante: { type: arquivoSchema, required: true },
  },
  { _id: false },
);

export const produtoSchema = new Schema<ProdutoDocument>(
  {
    produtorId: { type: String, required: true, trim: true },
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIA_PRODUTO },
    unidadeMedida: { type: String, required: true, enum: UNIDADE_MEDIDA },
    registros: { type: [registroProdutoSchema], default: [] },
    fotosAvaliacao: { type: [arquivoSchema], default: [] },
    fotosDivulgacao: { type: [arquivoSchema], default: [] },
    premiacoes: { type: [premiacaoSchema], default: [] },
    valorCentavos: { type: Number, required: true, min: 0 },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      required: true,
      enum: STATUS_PRODUTO,
      default: "PENDENTE",
    },
    motivoRejeicao: { type: String, trim: true },
  },
  {
    collection: PRODUTO_COLLECTION,
    timestamps: true,
  },
);

produtoSchema.index({ produtorId: 1 });
produtoSchema.index({ produtorId: 1, ativo: 1, status: 1 });
produtoSchema.index({ categoria: 1, status: 1, ativo: 1 });
produtoSchema.index({ "registros.numero": 1 }, { unique: true, sparse: true });
