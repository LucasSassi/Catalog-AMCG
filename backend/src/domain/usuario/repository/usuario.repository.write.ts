import type { Usuario } from "../entity/usuario.entity";

export interface CreateUsuarioData {
  nome: string;
  email: string;
  senhaHash: string;
}

export interface UpdateUsuarioData {
  nome?: string;
  email?: string;
  senhaHash?: string;
}

export interface IUsuarioRepositoryWrite {
  create(data: CreateUsuarioData): Promise<Usuario>;
  update(id: string, data: UpdateUsuarioData): Promise<Usuario | null>;
  delete(id: string): Promise<boolean>;
}
