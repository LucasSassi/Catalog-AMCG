import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsuarioService } from "../../../../domain/usuario/service/usuario.service";
import { InMemoryUsuarioRepository } from "../../../mocks/usuario.repository.mock";

const JWT_SECRET = "test-secret";

describe("Quando usar o UsuarioService", () => {
  let repository: InMemoryUsuarioRepository;
  let service: UsuarioService;

  beforeEach(() => {
    repository = new InMemoryUsuarioRepository();
    service = new UsuarioService({
      readRepository: repository,
      writeRepository: repository,
      jwtSecret: JWT_SECRET,
    });
  });

  describe("Quando cadastrar", () => {
    it("Deve criar usuário com senha hasheada e sem expor senhaHash", async () => {
      const usuario = await service.cadastrar({
        nome: "Ana",
        email: "ana@amcg.org",
        senha: "senha123",
      });

      expect(usuario).toMatchObject({
        nome: "Ana",
        email: "ana@amcg.org",
      });
      expect(usuario).not.toHaveProperty("senhaHash");

      const stored = await repository.findByEmail("ana@amcg.org");
      expect(stored).not.toBeNull();
      expect(stored!.senhaHash).not.toBe("senha123");
      expect(await bcrypt.compare("senha123", stored!.senhaHash)).toBe(true);
    });

    it("Deve lançar conflito quando o e-mail já existe", async () => {
      await service.cadastrar({
        nome: "Ana",
        email: "ana@amcg.org",
        senha: "senha123",
      });

      await expect(
        service.cadastrar({
          nome: "Outra",
          email: "ANA@amcg.org",
          senha: "outra456",
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("Deve rejeitar senha curta", async () => {
      await expect(
        service.cadastrar({
          nome: "Ana",
          email: "ana@amcg.org",
          senha: "123",
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("Quando fazer login", () => {
    beforeEach(async () => {
      await service.cadastrar({
        nome: "Ana",
        email: "ana@amcg.org",
        senha: "senha123",
      });
    });

    it("Deve retornar token JWT e dados públicos", async () => {
      const result = await service.login({
        email: "ana@amcg.org",
        senha: "senha123",
      });

      expect(result.usuario.email).toBe("ana@amcg.org");
      expect(result.usuario).not.toHaveProperty("senhaHash");

      const payload = jwt.verify(result.token, JWT_SECRET) as {
        sub: string;
        email: string;
      };
      expect(payload.email).toBe("ana@amcg.org");
      expect(payload.sub).toBe(result.usuario.id);
    });

    it("Deve rejeitar senha incorreta", async () => {
      await expect(
        service.login({
          email: "ana@amcg.org",
          senha: "errada",
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("Deve rejeitar e-mail inexistente", async () => {
      await expect(
        service.login({
          email: "outro@amcg.org",
          senha: "senha123",
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe("Quando executar CRUD", () => {
    it("Deve listar, buscar, atualizar e remover usuário", async () => {
      const criado = await service.cadastrar({
        nome: "Ana",
        email: "ana@amcg.org",
        senha: "senha123",
      });

      const lista = await service.list();
      expect(lista).toHaveLength(1);

      const encontrado = await service.getById(criado.id);
      expect(encontrado.nome).toBe("Ana");

      const atualizado = await service.update(criado.id, {
        nome: "Ana Silva",
        senha: "novaSenha1",
      });
      expect(atualizado.nome).toBe("Ana Silva");

      await expect(
        service.login({ email: "ana@amcg.org", senha: "novaSenha1" }),
      ).resolves.toMatchObject({ usuario: { id: criado.id } });

      await service.remove(criado.id);
      await expect(service.getById(criado.id)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("Deve impedir atualizar para e-mail já usado", async () => {
      const primeiro = await service.cadastrar({
        nome: "Ana",
        email: "ana@amcg.org",
        senha: "senha123",
      });
      await service.cadastrar({
        nome: "Bruno",
        email: "bruno@amcg.org",
        senha: "senha123",
      });

      await expect(
        service.update(primeiro.id, { email: "bruno@amcg.org" }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });
});
