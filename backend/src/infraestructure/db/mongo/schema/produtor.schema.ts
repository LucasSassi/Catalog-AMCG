import { Schema } from "mongoose";
import {
  PRODUTOR_COLLECTION,
  REGISTRO_PRODUTOR_TIPO,
  STATUS_PRODUTOR,
  TIPO_DOCUMENTO,
  TIPO_REDE_SOCIAL,
  UF_BRASIL,
  type RegistroProdutorTipo,
  type StatusProdutor,
  type TipoDocumento,
  type TipoRedeSocial,
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

export interface ArquivoDocument {
  url: string;
  contentType: string;
  nomeOriginal: string;
}

export interface RedeSocialDocument {
  tipo: TipoRedeSocial;
  handle: string;
}

export interface ProdutorDocument {
  nomeEmpresa: string;
  municipioId: string;
  documento: DocumentoDocument;
  registros: RegistroProdutorDocument[];
  contato: ContatoDocument;
  endereco: EnderecoDocument;
  historia: string;
  logo?: ArquivoDocument;
  fotos: ArquivoDocument[];
  redesSociais: RedeSocialDocument[];
  /** @deprecated legado — ignorado pelo adapter */
  redeSocial?: string;
  site?: string;
  ativo: boolean;
  status: StatusProdutor;
  destaque: boolean;
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

const arquivoSchema = new Schema<ArquivoDocument>(
  {
    url: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },
    nomeOriginal: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const redeSocialSchema = new Schema<RedeSocialDocument>(
  {
    tipo: { type: String, required: true, enum: TIPO_REDE_SOCIAL },
    handle: { type: String, required: true, trim: true },
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
    historia: { type: String, required: true, trim: true, default: "" },
    logo: { type: arquivoSchema },
    fotos: { type: [arquivoSchema], default: [] },
    redesSociais: { type: [redeSocialSchema], default: [] },
    redeSocial: { type: String, trim: true },
    site: { type: String, trim: true },
    ativo: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      required: true,
      enum: STATUS_PRODUTOR,
      default: "PENDENTE",
    },
    destaque: { type: Boolean, required: true, default: false },
    motivoRejeicao: { type: String, trim: true },
  },
  {
    collection: PRODUTOR_COLLECTION,
    timestamps: true,
  },
);

produtorSchema.index({ "documento.numero": 1 }, { unique: true });
produtorSchema.index({ "registros.numero": 1 }, { unique: true, sparse: true });
produtorSchema.index({ destaque: 1, status: 1, ativo: 1 });
