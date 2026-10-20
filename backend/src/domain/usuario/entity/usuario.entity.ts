import type { RoleUsuario } from "./usuario.constants";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: RoleUsuario;
  createdAt: Date;
  updatedAt: Date;
}

export type UsuarioPublico = Omit<Usuario, "senhaHash">;

export interface CadastrarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginUsuarioInput {
  email: string;
  senha: string;
}

export interface AtualizarUsuarioInput {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface AlterarRoleUsuarioInput {
  role: RoleUsuario;
}

export interface LoginUsuarioResult {
  usuario: UsuarioPublico;
  token: string;
}
