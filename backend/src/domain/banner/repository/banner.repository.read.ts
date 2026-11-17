import type { Banner } from "../entity/banner.entity";

export interface IBannerRepositoryRead {
  findById(id: string): Promise<Banner | null>;
  /** Todos os banners, ordenados por `ordem` crescente. */
  list(): Promise<Banner[]>;
}
