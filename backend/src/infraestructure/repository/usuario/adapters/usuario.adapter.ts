import { ROLE_PADRAO } from "../../../../domain/usuario/entity/usuario.constants";
import type { Usuario } from "../../../../domain/usuario/entity/usuario.entity";
import type { UsuarioModelDocument } from "../../../db/mongo/models/usuario.model";

export function toUsuarioEntity(document: UsuarioModelDocument): Usuario {
  return {
    id: document._id.toString(),
    nome: document.nome,
    email: document.email,
    senhaHash: document.senhaHash,
    role: document.role ?? ROLE_PADRAO,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
