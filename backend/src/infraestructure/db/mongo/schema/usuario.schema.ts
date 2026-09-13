import { Schema } from "mongoose";
import { USUARIO_COLLECTION } from "../../../../domain/usuario/entity/usuario.constants";

export interface UsuarioDocument {
  nome: string;
  email: string;
  senhaHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export const usuarioSchema = new Schema<UsuarioDocument>(
  {
    nome: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senhaHash: { type: String, required: true },
  },
  {
    collection: USUARIO_COLLECTION,
    timestamps: true,
  },
);
