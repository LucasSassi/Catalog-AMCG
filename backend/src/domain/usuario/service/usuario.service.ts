import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../common/errors/app-error";
import {
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRES_IN,
  MIN_SENHA_LENGTH,
} from "../entity/usuario.constants";
import type { IUsuarioService } from "../entity/interfaces/usuario.service.interface";
import type {
  AtualizarUsuarioInput,
  CadastrarUsuarioInput,
  LoginUsuarioInput,
  LoginUsuarioResult,
  Usuario,
  UsuarioPublico,
} from "../entity/usuario.entity";
import type { IUsuarioRepositoryRead } from "../repository/usuario.repository.read";
import type { IUsuarioRepositoryWrite } from "../repository/usuario.repository.write";

export interface UsuarioServiceDeps {
  readRepository: IUsuarioRepositoryRead;
  writeRepository: IUsuarioRepositoryWrite;
  jwtSecret: string;
}

export class UsuarioService implements IUsuarioService {
  private readonly readRepository: IUsuarioRepositoryRead;
  private readonly writeRepository: IUsuarioRepositoryWrite;
  private readonly jwtSecret: string;

  constructor(deps: UsuarioServiceDeps) {
    this.readRepository = deps.readRepository;
    this.writeRepository = deps.writeRepository;
    this.jwtSecret = deps.jwtSecret;
  }

  async cadastrar(input: CadastrarUsuarioInput): Promise<UsuarioPublico> {
    this.assertSenhaValida(input.senha);
    this.assertNomeValido(input.nome);
    this.assertEmailValido(input.email);

    const email = this.normalizeEmail(input.email);
    const existing = await this.readRepository.findByEmail(email);

    if (existing) {
      throw new ConflictError("E-mail já cadastrado");
    }

    const senhaHash = await bcrypt.hash(input.senha, BCRYPT_SALT_ROUNDS);
    const usuario = await this.writeRepository.create({
      nome: input.nome.trim(),
      email,
      senhaHash,
    });

    return this.toPublico(usuario);
  }

  async login(input: LoginUsuarioInput): Promise<LoginUsuarioResult> {
    this.assertEmailValido(input.email);

    const email = this.normalizeEmail(input.email);
    const usuario = await this.readRepository.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const senhaValida = await bcrypt.compare(input.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email },
      this.jwtSecret,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return {
      usuario: this.toPublico(usuario),
      token,
    };
  }

  async list(): Promise<UsuarioPublico[]> {
    const usuarios = await this.readRepository.list();
    return usuarios.map((usuario) => this.toPublico(usuario));
  }

  async getById(id: string): Promise<UsuarioPublico> {
    const usuario = await this.readRepository.findById(id);

    if (!usuario) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return this.toPublico(usuario);
  }

  async update(
    id: string,
    input: AtualizarUsuarioInput,
  ): Promise<UsuarioPublico> {
    if (
      input.nome === undefined &&
      input.email === undefined &&
      input.senha === undefined
    ) {
      throw new ValidationError("Nenhum campo para atualizar");
    }

    const atual = await this.readRepository.findById(id);

    if (!atual) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const data: {
      nome?: string;
      email?: string;
      senhaHash?: string;
    } = {};

    if (input.nome !== undefined) {
      this.assertNomeValido(input.nome);
      data.nome = input.nome.trim();
    }

    if (input.email !== undefined) {
      this.assertEmailValido(input.email);
      const email = this.normalizeEmail(input.email);

      if (email !== atual.email) {
        const existing = await this.readRepository.findByEmail(email);
        if (existing) {
          throw new ConflictError("E-mail já cadastrado");
        }
      }

      data.email = email;
    }

    if (input.senha !== undefined) {
      this.assertSenhaValida(input.senha);
      data.senhaHash = await bcrypt.hash(input.senha, BCRYPT_SALT_ROUNDS);
    }

    const atualizado = await this.writeRepository.update(id, data);

    if (!atualizado) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return this.toPublico(atualizado);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.writeRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError("Usuário não encontrado");
    }
  }

  private toPublico(usuario: Usuario): UsuarioPublico {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    };
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private assertNomeValido(nome: string): void {
    if (!nome.trim()) {
      throw new ValidationError("Nome é obrigatório");
    }
  }

  private assertEmailValido(email: string): void {
    if (!email.trim() || !email.includes("@")) {
      throw new ValidationError("E-mail inválido");
    }
  }

  private assertSenhaValida(senha: string): void {
    if (senha.length < MIN_SENHA_LENGTH) {
      throw new ValidationError(
        `Senha deve ter no mínimo ${MIN_SENHA_LENGTH} caracteres`,
      );
    }
  }
}
