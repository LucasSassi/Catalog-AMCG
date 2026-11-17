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
  produtorId?: string;
  historicoVinculos?: {
    administradorId?: string;
    usuarioId?: string;
    origem?: string;
    anterior?: string;
    novo?: string;
    data: Date;
  }[];
  role: RoleUsuario;
  createdAt: Date;
  updatedAt: Date;
}

export const usuarioSchema = new Schema<UsuarioDocument>(
  {
    produtorId: { type: String, index: true },
    historicoVinculos: {
      type: [
        new Schema(
          {
            administradorId: String,
            usuarioId: String,
            origem: String,
            anterior: String,
            novo: String,
            data: Date,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
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
