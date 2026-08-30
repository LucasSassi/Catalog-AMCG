import type {
  CreateProdutorData,
  IProdutorRepositoryWrite,
  UpdateProdutorData,
} from "../../domain/produtor/repository/produtor.repository.write";
import type { IProdutorRepositoryRead } from "../../domain/produtor/repository/produtor.repository.read";
import type {
  ListarProdutoresFiltros,
  Produtor,
} from "../../domain/produtor/entity/produtor.entity";

export class InMemoryProdutorRepository
  implements IProdutorRepositoryRead, IProdutorRepositoryWrite
{
  private readonly items = new Map<string, Produtor>();
  private sequence = 1;

  async findById(id: string): Promise<Produtor | null> {
    return this.items.get(id) ?? null;
  }

  async list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]> {
    let items = Array.from(this.items.values());

    if (filtros?.ativo !== undefined) {
      items = items.filter((item) => item.ativo === filtros.ativo);
    }

    if (filtros?.status !== undefined) {
      items = items.filter((item) => item.status === filtros.status);
    }

    return items.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findByDocumentoNumero(numero: string): Promise<Produtor | null> {
    for (const produtor of this.items.values()) {
      if (produtor.documento.numero === numero) {
        return produtor;
      }
    }
    return null;
  }

  async findByRegistroNumero(numero: string): Promise<Produtor | null> {
    for (const produtor of this.items.values()) {
      if (produtor.registros.some((registro) => registro.numero === numero)) {
        return produtor;
      }
    }
    return null;
  }

  async create(data: CreateProdutorData): Promise<Produtor> {
    const now = new Date();
    const produtor: Produtor = {
      id: String(this.sequence++),
      nomeEmpresa: data.nomeEmpresa,
      municipioId: data.municipioId,
      documento: data.documento,
      registros: data.registros,
      contato: {
        telefone: data.contato.telefone,
        email: data.contato.email.toLowerCase().trim(),
      },
      endereco: data.endereco,
      ativo: data.ativo,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(produtor.id, produtor);
    return produtor;
  }

  async update(id: string, data: UpdateProdutorData): Promise<Produtor | null> {
    const atual = this.items.get(id);
    if (!atual) {
      return null;
    }

    const atualizado: Produtor = {
      ...atual,
      nomeEmpresa: data.nomeEmpresa ?? atual.nomeEmpresa,
      municipioId: data.municipioId ?? atual.municipioId,
      documento: data.documento ?? atual.documento,
      registros: data.registros ?? atual.registros,
      contato: data.contato
        ? {
            telefone: data.contato.telefone,
            email: data.contato.email.toLowerCase().trim(),
          }
        : atual.contato,
      endereco: data.endereco ?? atual.endereco,
      ativo: data.ativo ?? atual.ativo,
      updatedAt: new Date(),
    };
    this.items.set(id, atualizado);
    return atualizado;
  }

  async softDelete(id: string): Promise<Produtor | null> {
    return this.update(id, { ativo: false });
  }

  clear(): void {
    this.items.clear();
    this.sequence = 1;
  }
}
