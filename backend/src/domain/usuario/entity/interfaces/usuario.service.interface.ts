import type {
  AtualizarUsuarioInput,
  CadastrarUsuarioInput,
  LoginUsuarioInput,
  LoginUsuarioResult,
  UsuarioPublico,
} from "../usuario.entity";

export interface IUsuarioService {
  cadastrar(input: CadastrarUsuarioInput): Promise<UsuarioPublico>;
  login(input: LoginUsuarioInput): Promise<LoginUsuarioResult>;
  list(): Promise<UsuarioPublico[]>;
  getById(id: string): Promise<UsuarioPublico>;
  update(id: string, input: AtualizarUsuarioInput): Promise<UsuarioPublico>;
  remove(id: string): Promise<void>;
}
