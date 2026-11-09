import { model, type HydratedDocument } from "mongoose";
import { bannerSchema, type BannerDocument } from "../schema/banner.schema";

export type BannerModelDocument = HydratedDocument<BannerDocument>;

export const BannerModel = model<BannerDocument>("Banner", bannerSchema);
