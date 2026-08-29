import type { Usuario } from "../entity/usuario.entity";

export interface IUsuarioRepositoryRead {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  list(): Promise<Usuario[]>;
}
