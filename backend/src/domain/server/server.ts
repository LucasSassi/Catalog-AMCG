import "../../configuration/dotenv";
import { loadEnv } from "../../configuration/env-constants/env";
import { createApp } from "../../app";
import { createEmailSender } from "../../application/services/email/email-sender";
import { connectMongo } from "../../infraestructure/db/mongo/connection";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  await connectMongo(env.MONGO_URI);

  if (!env.SMTP_HOST) {
    console.warn(
      "SMTP_HOST não configurado: códigos de verificação serão apenas exibidos no log.",
    );
  }
  const emailSender = createEmailSender(
    env.SMTP_HOST
      ? {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          ...(env.SMTP_USER ? { user: env.SMTP_USER } : {}),
          ...(env.SMTP_PASS ? { pass: env.SMTP_PASS } : {}),
          from: env.SMTP_FROM || env.SMTP_USER || "nao-responda@localhost",
        }
      : undefined,
  );

  const app = createApp({ jwtSecret: env.JWT_SECRET, emailSender });

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
