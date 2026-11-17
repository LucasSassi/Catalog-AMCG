import type { Banner } from "../../../domain/banner/entity/banner.entity";
import type { IBannerRepositoryRead } from "../../../domain/banner/repository/banner.repository.read";
import { BannerModel } from "../../db/mongo/models/banner.model";
import { toBannerEntity } from "./adapters/banner.adapter";

export class BannerRepositoryRead implements IBannerRepositoryRead {
  async findById(id: string): Promise<Banner | null> {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return null;
    }

    const document = await BannerModel.findById(id).exec();
    return document ? toBannerEntity(document) : null;
  }

  async list(): Promise<Banner[]> {
    const documents = await BannerModel.find()
      .sort({ ordem: 1, createdAt: 1 })
      .exec();
    return documents.map(toBannerEntity);
  }
}
