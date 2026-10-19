import { Schema } from "mongoose";
import {
  ROLE_PADRAO,
  ROLE_USUARIO,
  USUARIO_COLLECTION,
  type RoleUsuario,
} from "../../../../domain/usuario/entity/usuario.constants";

export interface UsuarioDocument {
  nome: string;
  email: string;
  senhaHash: string;
  role: RoleUsuario;
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
    role: {
      type: String,
      enum: ROLE_USUARIO,
      default: ROLE_PADRAO,
      required: true,
    },
  },
  {
    collection: USUARIO_COLLECTION,
    timestamps: true,
  },
);
