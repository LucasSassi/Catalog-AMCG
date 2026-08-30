import { model, type HydratedDocument } from "mongoose";
import {
  produtoSchema,
  type ProdutoDocument,
} from "../schema/produto.schema";

export type ProdutoModelDocument = HydratedDocument<ProdutoDocument>;

export const ProdutoModel = model<ProdutoDocument>("Produto", produtoSchema);
