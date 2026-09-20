/**
 * Migra categorias antigas para as novas categorias do catálogo.
 * Uso: npx tsx scripts/migrate-categorias.ts
 */
import "../src/configuration/dotenv";
import { connectMongo, disconnectMongo } from "../src/infraestructure/db/mongo/connection";
import { ProdutoModel } from "../src/infraestructure/db/mongo/models/produto.model";

const CATEGORIA_MAP: Record<string, string> = {
  MEL: "MEL_E_DERIVADOS",
  QUEIJO: "QUEIJOS_E_LACTEOS",
  GELEIA: "CONSERVAS",
  CARNE: "EMBUTIDOS_E_DEFUMADOS",
  BEBIDAS: "BEBIDAS_ARTESANAIS",
  BOLACHAS: "PANIFICADOS",
  PAES: "PANIFICADOS",
  OUTROS: "OUTROS",
};

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI não definido");
  }

  await connectMongo(uri);

  for (const [from, to] of Object.entries(CATEGORIA_MAP)) {
    const result = await ProdutoModel.updateMany(
      { categoria: from },
      { $set: { categoria: to } },
    );
    console.log(`${from} → ${to}: ${result.modifiedCount} documento(s)`);
  }

  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
