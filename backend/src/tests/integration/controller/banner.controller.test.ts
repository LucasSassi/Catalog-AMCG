import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../../../app";
import { BannerService } from "../../../domain/banner/service/banner.service";
import { InMemoryBannerRepository } from "../../mocks/banner.repository.mock";

const JWT_SECRET = "test-secret";
const PNG_DATA_URL = `data:image/png;base64,${Buffer.from("png").toString("base64")}`;

function authHeader(role: "admin" | "usuario" = "admin"): string {
  const token = jwt.sign(
    { sub: "1", email: "admin@amcg.org", role },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  return `Bearer ${token}`;
}

const novoBanner = {
  titulo: "Queijo Gouda",
  textoAlternativo: "Queijo gouda fatiado",
  imagem: { url: PNG_DATA_URL, contentType: "image/png", nomeOriginal: "q.png" },
};

describe("Quando usar o BannerController (integration)", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const repository = new InMemoryBannerRepository();
    const bannerService = new BannerService({
      readRepository: repository,
      writeRepository: repository,
    });
    app = createApp({ jwtSecret: JWT_SECRET, bannerService });
  });

  it("Deve exigir admin para gerenciar banners", async () => {
    const semToken = await request(app).post("/api/banners").send(novoBanner);
    const usuario = await request(app)
      .post("/api/banners")
      .set("Authorization", authHeader("usuario"))
      .send(novoBanner);

    expect(semToken.status).toBe(401);
    expect(usuario.status).toBe(403);
  });

  it("Deve cadastrar, listar no catálogo, servir a imagem, desativar e remover", async () => {
    const criado = await request(app)
      .post("/api/banners")
      .set("Authorization", authHeader())
      .send(novoBanner);

    expect(criado.status).toBe(201);
    const id = criado.body.id as string;

    const catalogo = await request(app).get("/api/banners/catalogo");
    expect(catalogo.status).toBe(200);
    expect(catalogo.body).toHaveLength(1);

    const imagem = await request(app).get(catalogo.body[0].imagemUrl);
    expect(imagem.status).toBe(200);
    expect(imagem.headers["content-type"]).toContain("image/png");
    expect(imagem.headers["cache-control"]).toContain("immutable");

    const desativado = await request(app)
      .patch(`/api/banners/${id}/ativo`)
      .set("Authorization", authHeader())
      .send({ ativo: false });
    expect(desativado.body.ativo).toBe(false);

    const vazio = await request(app).get("/api/banners/catalogo");
    expect(vazio.body).toHaveLength(0);

    const removido = await request(app)
      .delete(`/api/banners/${id}`)
      .set("Authorization", authHeader());
    expect(removido.status).toBe(204);
  });

  it("Deve reordenar os banners", async () => {
    const a = await request(app)
      .post("/api/banners")
      .set("Authorization", authHeader())
      .send({ ...novoBanner, titulo: "A" });
    const b = await request(app)
      .post("/api/banners")
      .set("Authorization", authHeader())
      .send({ ...novoBanner, titulo: "B" });

    const ordem = await request(app)
      .put("/api/banners/ordem")
      .set("Authorization", authHeader())
      .send({ ids: [b.body.id, a.body.id] });

    expect(ordem.status).toBe(200);
    expect(ordem.body.map((banner: { titulo: string }) => banner.titulo)).toEqual([
      "B",
      "A",
    ]);
  });

  it("Deve validar o corpo da requisição", async () => {
    const response = await request(app)
      .post("/api/banners")
      .set("Authorization", authHeader())
      .send({ titulo: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });
});
