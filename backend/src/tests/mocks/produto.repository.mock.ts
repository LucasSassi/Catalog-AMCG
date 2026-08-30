import type {
  CreateProdutoData,
  IProdutoRepositoryWrite,
  UpdateProdutoData,
} from "../../domain/produto/repository/produto.repository.write";
import type { IProdutoRepositoryRead } from "../../domain/produto/repository/produto.repository.read";
import type {
  ListarProdutosFiltros,
  Produto,
} from "../../domain/produto/entity/produto.entity";

export class InMemoryProdutoRepository
  implements IProdutoRepositoryRead, IProdutoRepositoryWrite
{
  private readonly items = new Map<string, Produto>();
  private sequence = 1;

  async findById(id: string): Promise<Produto | null> {
    return this.items.get(id) ?? null;
  }

  async list(filtros?: ListarProdutosFiltros): Promise<Produto[]> {
    let items = Array.from(this.items.values());

    if (filtros?.produtorId !== undefined) {
      items = items.filter((item) => item.produtorId === filtros.produtorId);
    }

    if (filtros?.categoria !== undefined) {
      items = items.filter((item) => item.categoria === filtros.categoria);
    }

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

  async findByRegistroNumero(numero: string): Promise<Produto | null> {
    for (const produto of this.items.values()) {
      if (produto.registros.some((registro) => registro.numero === numero)) {
        return produto;
      }
    }
    return null;
  }

  async create(data: CreateProdutoData): Promise<Produto> {
    const now = new Date();
    const produto: Produto = {
      id: String(this.sequence++),
      produtorId: data.produtorId,
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      unidadeMedida: data.unidadeMedida,
      registros: data.registros,
      fotosAvaliacao: data.fotosAvaliacao,
      fotosDivulgacao: data.fotosDivulgacao,
      premiacoes: data.premiacoes,
      valorCentavos: data.valorCentavos,
      ...(data.observacoes !== undefined ? { observacoes: data.observacoes } : {}),
      ativo: data.ativo,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(produto.id, produto);
    return produto;
  }

  async update(id: string, data: UpdateProdutoData): Promise<Produto | null> {
    const atual = this.items.get(id);
    if (!atual) {
      return null;
    }

    const atualizado: Produto = {
      ...atual,
      produtorId: data.produtorId ?? atual.produtorId,
      nome: data.nome ?? atual.nome,
      descricao: data.descricao ?? atual.descricao,
      categoria: data.categoria ?? atual.categoria,
      unidadeMedida: data.unidadeMedida ?? atual.unidadeMedida,
      registros: data.registros ?? atual.registros,
      fotosAvaliacao: data.fotosAvaliacao ?? atual.fotosAvaliacao,
      fotosDivulgacao: data.fotosDivulgacao ?? atual.fotosDivulgacao,
      premiacoes: data.premiacoes ?? atual.premiacoes,
      valorCentavos: data.valorCentavos ?? atual.valorCentavos,
      observacoes:
        data.observacoes !== undefined ? data.observacoes : atual.observacoes,
      ativo: data.ativo ?? atual.ativo,
      status: data.status ?? atual.status,
      updatedAt: new Date(),
    };

    if (data.motivoRejeicao === null) {
      delete atualizado.motivoRejeicao;
    } else if (data.motivoRejeicao !== undefined) {
      atualizado.motivoRejeicao = data.motivoRejeicao;
    }

    this.items.set(id, atualizado);
    return atualizado;
  }

  async softDelete(id: string): Promise<Produto | null> {
    return this.update(id, { ativo: false });
  }

  clear(): void {
    this.items.clear();
    this.sequence = 1;
  }
}
