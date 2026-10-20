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

  async findByIds(ids: string[]): Promise<Produtor[]> {
    const result: Produtor[] = [];
    for (const id of ids) {
      const produtor = this.items.get(id);
      if (produtor) {
        result.push(produtor);
      }
    }
    return result;
  }

  async listMunicipiosAprovados(): Promise<string[]> {
    const produtores = await this.list({
      ativo: true,
      status: "APROVADO",
    });
    return [
      ...new Set(
        produtores
          .map((produtor) => produtor.endereco.cidade)
          .filter((cidade) => cidade.length > 0),
      ),
    ].sort((cidadeA, cidadeB) => cidadeA.localeCompare(cidadeB, "pt-BR"));
  }

  async list(filtros?: ListarProdutoresFiltros): Promise<Produtor[]> {
    let items = Array.from(this.items.values());

    if (filtros?.ativo !== undefined) {
      items = items.filter((item) => item.ativo === filtros.ativo);
    }

    if (filtros?.status !== undefined) {
      items = items.filter((item) => item.status === filtros.status);
    }

    if (filtros?.destaque !== undefined) {
      items = items.filter((item) => item.destaque === filtros.destaque);
    }

    return items.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async listLimited(
    filtros: ListarProdutoresFiltros,
    limit: number,
  ): Promise<Produtor[]> {
    const items = await this.list(filtros);
    return items.slice(0, limit);
  }

  async sampleApproved(
    excludeIds: string[],
    size: number,
  ): Promise<Produtor[]> {
    if (size <= 0) {
      return [];
    }

    const excluded = new Set(excludeIds);
    const candidatos = (await this.list({ ativo: true, status: "APROVADO" }))
      .filter((produtor) => !excluded.has(produtor.id));

    const shuffled = [...candidatos];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = shuffled[index];
      shuffled[index] = shuffled[swapIndex];
      shuffled[swapIndex] = current;
    }

    return shuffled.slice(0, size);
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

  async countDestaques(): Promise<number> {
    return Array.from(this.items.values()).filter(
      (item) => item.destaque && item.ativo && item.status === "APROVADO",
    ).length;
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
      historia: data.historia,
      logo: data.logo,
      fotos: data.fotos,
      redesSociais: data.redesSociais,
      ...(data.site !== undefined ? { site: data.site } : {}),
      ativo: data.ativo,
      status: data.status,
      destaque: data.destaque,
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
      historia: data.historia ?? atual.historia,
      logo: data.logo ?? atual.logo,
      fotos: data.fotos ?? atual.fotos,
      redesSociais: data.redesSociais ?? atual.redesSociais,
      ativo: data.ativo ?? atual.ativo,
      status: data.status ?? atual.status,
      destaque: data.destaque ?? atual.destaque,
      updatedAt: new Date(),
    };

    if (data.site === null) {
      delete atualizado.site;
    } else if (data.site !== undefined) {
      atualizado.site = data.site;
    }

    if (data.motivoRejeicao === null) {
      delete atualizado.motivoRejeicao;
    } else if (data.motivoRejeicao !== undefined) {
      atualizado.motivoRejeicao = data.motivoRejeicao;
    }
    this.items.set(id, atualizado);
    return atualizado;
  }

  async softDelete(id: string): Promise<Produtor | null> {
    return this.update(id, { ativo: false });
  }

  async hardDelete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
    this.sequence = 1;
  }
}
