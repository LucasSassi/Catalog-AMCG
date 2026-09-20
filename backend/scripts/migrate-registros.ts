/**
 * Remove registros SUSAF/SIF/Outro de produtores, mantendo apenas SIM.
 * Uso: npx tsx scripts/migrate-registros.ts
 */
import "../src/configuration/dotenv";
import { connectMongo, disconnectMongo } from "../src/infraestructure/db/mongo/connection";
import { ProdutorModel } from "../src/infraestructure/db/mongo/models/produtor.model";

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI não definido");
  }

  await connectMongo(uri);

  const produtores = await ProdutorModel.find({
    "registros.tipo": { $in: ["SUSAF", "SIF", "Outro"] },
  }).exec();

  for (const produtor of produtores) {
    const removidos = produtor.registros.filter(
      (registro) => registro.tipo !== "SIM",
    );
    const mantidos = produtor.registros.filter(
      (registro) => registro.tipo === "SIM",
    );

    console.log(
      `Produtor ${produtor._id} (${produtor.nomeEmpresa}): removendo ${removidos.length} registro(s) [${removidos
        .map((r) => `${r.tipo}:${r.numero}`)
        .join(", ")}]`,
    );

    produtor.registros = mantidos.length > 0
      ? mantidos
      : [{ tipo: "SIM", numero: `MIGRADO-${produtor._id}` }];
    await produtor.save();
  }

  console.log(`Total processado: ${produtores.length} produtor(es)`);
  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
