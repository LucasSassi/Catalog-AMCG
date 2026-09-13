import { model, type HydratedDocument } from "mongoose";
import {
  usuarioSchema,
  type UsuarioDocument,
} from "../schema/usuario.schema";

export type UsuarioModelDocument = HydratedDocument<UsuarioDocument>;

export const UsuarioModel = model<UsuarioDocument>("Usuario", usuarioSchema);
