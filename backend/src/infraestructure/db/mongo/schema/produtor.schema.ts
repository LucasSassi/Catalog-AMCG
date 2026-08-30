import { Schema } from "mongoose";
import {
  PRODUTOR_COLLECTION,
  REGISTRO_PRODUTOR_TIPO,
  STATUS_PRODUTOR,
  TIPO_DOCUMENTO,
  UF_BRASIL,
  type RegistroProdutorTipo,
  type StatusProdutor,
  type TipoDocumento,
  type UfBrasil,
} from "../../../../domain/produtor/entity/produtor.constants";

export interface ContatoDocument {
  telefone: string;
  email: string;
}

export interface DocumentoDocument {
  tipo: TipoDocumento;
  numero: string;
}

export interface RegistroProdutorDocument {
  tipo: RegistroProdutorTipo;
  tipoOutros?: string;
  numero: string;
  dataEmissao?: Date;
  dataValidade?: Date;
}

export interface EnderecoDocument {
  rua: string;
  bairro: string;
  cidade: string;
  estado: UfBrasil;
}

export interface ProdutorDocument {
  nomeEmpresa: string;
  municipioId: string;
  documento: DocumentoDocument;
  registros: RegistroProdutorDocument[];
  contato: ContatoDocument;
  endereco: EnderecoDocument;
  ativo: boolean;
  status: StatusProdutor;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contatoSchema = new Schema<ContatoDocument>(
  {
    telefone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false },
);

const documentoSchema = new Schema<DocumentoDocument>(
  {
    tipo: { type: String, required: true, enum: TIPO_DOCUMENTO },
    numero: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const registroProdutorSchema = new Schema<RegistroProdutorDocument>(
  {
    tipo: { type: String, required: true, enum: REGISTRO_PRODUTOR_TIPO },
    tipoOutros: { type: String, trim: true },
    numero: { type: String, required: true, trim: true },
    dataEmissao: { type: Date },
    dataValidade: { type: Date },
  },
  { _id: false },
);

const enderecoSchema = new Schema<EnderecoDocument>(
  {
    rua: { type: String, required: true, trim: true },
    bairro: { type: String, required: true, trim: true },
    cidade: { type: String, required: true, trim: true },
    estado: { type: String, required: true, enum: UF_BRASIL },
  },
  { _id: false },
);

export const produtorSchema = new Schema<ProdutorDocument>(
  {
    nomeEmpresa: { type: String, required: true, trim: true },
    municipioId: { type: String, required: true, trim: true },
    documento: { type: documentoSchema, required: true },
    registros: { type: [registroProdutorSchema], default: [] },
    contato: { type: contatoSchema, required: true },
    endereco: { type: enderecoSchema, required: true },
    ativo: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      required: true,
      enum: STATUS_PRODUTOR,
      default: "PENDENTE",
    },
    motivoRejeicao: { type: String, trim: true },
  },
  {
    collection: PRODUTOR_COLLECTION,
    timestamps: true,
  },
);

produtorSchema.index({ "documento.numero": 1 }, { unique: true });
produtorSchema.index({ "registros.numero": 1 }, { unique: true, sparse: true });
