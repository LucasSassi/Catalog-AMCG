import type { Banner } from "../../domain/banner/entity/banner.entity";
import type { IBannerRepositoryRead } from "../../domain/banner/repository/banner.repository.read";
import type {
  CreateBannerData,
  IBannerRepositoryWrite,
  UpdateBannerData,
} from "../../domain/banner/repository/banner.repository.write";

export class InMemoryBannerRepository
  implements IBannerRepositoryRead, IBannerRepositoryWrite
{
  private readonly items = new Map<string, Banner>();
  private sequence = 1;

  async findById(id: string): Promise<Banner | null> {
    return this.items.get(id) ?? null;
  }

  async list(): Promise<Banner[]> {
    return Array.from(this.items.values()).sort(
      (a, b) => a.ordem - b.ordem || a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  async create(data: CreateBannerData): Promise<Banner> {
    const now = new Date();
    const banner: Banner = {
      id: String(this.sequence++),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(banner.id, banner);
    return banner;
  }

  async update(id: string, data: UpdateBannerData): Promise<Banner | null> {
    const atual = this.items.get(id);

    if (!atual) {
      return null;
    }

    const atualizado: Banner = { ...atual, updatedAt: new Date() };
    const mutable = atualizado as unknown as Record<string, unknown>;

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        continue;
      }

      if (value === null) {
        delete mutable[key];
      } else {
        mutable[key] = value;
      }
    }

    this.items.set(id, atualizado);
    return atualizado;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async updateOrdem(ids: string[]): Promise<void> {
    ids.forEach((id, ordem) => {
      const banner = this.items.get(id);

      if (banner) {
        this.items.set(id, { ...banner, ordem });
      }
    });
  }
}
