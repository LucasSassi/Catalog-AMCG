import type { RoleUsuario } from "../entity/usuario.constants";
import type { Usuario } from "../entity/usuario.entity";

export interface CreateUsuarioData {
  nome: string;
  email: string;
  senhaHash: string;
  role: RoleUsuario;
}

export interface UpdateUsuarioData {
  nome?: string;
  email?: string;
  senhaHash?: string;
  role?: RoleUsuario;
}

export interface IUsuarioRepositoryWrite {
  create(data: CreateUsuarioData): Promise<Usuario>;
  update(id: string, data: UpdateUsuarioData): Promise<Usuario | null>;
  delete(id: string): Promise<boolean>;
}
