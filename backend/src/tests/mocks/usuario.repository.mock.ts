import type {
  CreateUsuarioData,
  IUsuarioRepositoryWrite,
  UpdateUsuarioData,
} from "../../domain/usuario/repository/usuario.repository.write";
import type { IUsuarioRepositoryRead } from "../../domain/usuario/repository/usuario.repository.read";
import type { Usuario } from "../../domain/usuario/entity/usuario.entity";

export class InMemoryUsuarioRepository
  implements IUsuarioRepositoryRead, IUsuarioRepositoryWrite
{
  private readonly items = new Map<string, Usuario>();
  private sequence = 1;

  async findById(id: string): Promise<Usuario | null> {
    return this.items.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const normalized = email.toLowerCase().trim();
    for (const usuario of this.items.values()) {
      if (usuario.email === normalized) {
        return usuario;
      }
    }
    return null;
  }

  async list(): Promise<Usuario[]> {
    return Array.from(this.items.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async create(data: CreateUsuarioData): Promise<Usuario> {
    const now = new Date();
    const usuario: Usuario = {
      id: String(this.sequence++),
      nome: data.nome,
      email: data.email.toLowerCase().trim(),
      senhaHash: data.senhaHash,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(usuario.id, usuario);
    return usuario;
  }

  async update(id: string, data: UpdateUsuarioData): Promise<Usuario | null> {
    const atual = this.items.get(id);
    if (!atual) {
      return null;
    }

    const atualizado: Usuario = {
      ...atual,
      nome: data.nome ?? atual.nome,
      email: data.email ? data.email.toLowerCase().trim() : atual.email,
      senhaHash: data.senhaHash ?? atual.senhaHash,
      updatedAt: new Date(),
    };
    this.items.set(id, atualizado);
    return atualizado;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
    this.sequence = 1;
  }
}
