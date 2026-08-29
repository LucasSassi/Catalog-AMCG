import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const port = Number(process.env.PORT) || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
