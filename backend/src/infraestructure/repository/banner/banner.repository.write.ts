import type { Banner } from "../../../domain/banner/entity/banner.entity";
import type {
  CreateBannerData,
  IBannerRepositoryWrite,
  UpdateBannerData,
} from "../../../domain/banner/repository/banner.repository.write";
import { BannerModel } from "../../db/mongo/models/banner.model";
import { toBannerEntity } from "./adapters/banner.adapter";

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export class BannerRepositoryWrite implements IBannerRepositoryWrite {
  async create(data: CreateBannerData): Promise<Banner> {
    const document = await BannerModel.create(data);
    return toBannerEntity(document);
  }

  async update(id: string, data: UpdateBannerData): Promise<Banner | null> {
    if (!OBJECT_ID_PATTERN.test(id)) {
      return null;
    }

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        continue;
      }

      if (value === null) {
        $unset[key] = 1;
      } else {
        $set[key] = value;
      }
    }

    const document = await BannerModel.findByIdAndUpdate(
      id,
      {
        ...(Object.keys($set).length > 0 ? { $set } : {}),
        ...(Object.keys($unset).length > 0 ? { $unset } : {}),
      },
      { new: true, runValidators: true },
    ).exec();

    return document ? toBannerEntity(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!OBJECT_ID_PATTERN.test(id)) {
      return false;
    }

    const result = await BannerModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async updateOrdem(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await BannerModel.bulkWrite(
      ids.map((id, ordem) => ({
        updateOne: { filter: { _id: id }, update: { $set: { ordem } } },
      })),
    );
  }
}
