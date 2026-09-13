import { model, type HydratedDocument } from "mongoose";
import {
  produtorSchema,
  type ProdutorDocument,
} from "../schema/produtor.schema";

export type ProdutorModelDocument = HydratedDocument<ProdutorDocument>;

export const ProdutorModel = model<ProdutorDocument>(
  "Produtor",
  produtorSchema,
);
