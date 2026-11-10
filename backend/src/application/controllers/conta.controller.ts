import { reviewStatusFilter } from "../../domain/common/review-status";
import type { IProdutorService } from "../../domain/produtor/entity/interfaces/produtor.service.interface";
import { toProdutorEntity } from "../../infraestructure/repository/produtor/adapters/produtor.adapter";
import { PreCadastroService } from "../services/pre-cadastro.service";
import { createRateLimiter } from "../middleware/rate-limit.middleware";
import { Router, type Request, type RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../domain/common/errors/app-error";
import type { IProdutoService } from "../../domain/produto/entity/interfaces/produto.service.interface";
import { UsuarioModel } from "../../infraestructure/db/mongo/models/usuario.model";
import { ProdutorModel } from "../../infraestructure/db/mongo/models/produtor.model";
import { ProdutoModel } from "../../infraestructure/db/mongo/models/produto.model";
import { toProdutoEntity } from "../../infraestructure/repository/produto/adapters/produto.adapter";
import {
  createAuthMiddleware,
  createRequireAdmin,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const file = z
  .object({
    url: z.string().min(1),
    contentType: z.string().min(1),
    nomeOriginal: z.string().min(1),
  })
  .strict();
const changes = z
  .object({
    nome: z.string().optional(),
    descricaoBreve: z.string().optional(),
    descricao: z.string().optional(),
    valorCentavos: z.number().int().min(0).optional(),
    fotosAvaliacao: z.array(file).optional(),
    fotosDivulgacao: z.array(file).optional(),
    revisao: z.number().int().min(0),
  })
  .strict();
const paging = z.object({
  pageSize: z.coerce.number().int().min(1).max(20).default(12),
  lastItemId: z.string().refine(isValidObjectId).optional(),
  busca: z.string().trim().default(""),
});
const id = (value: unknown) => {
  if (typeof value !== "string" || !isValidObjectId(value))
    throw new ValidationError("ID inválido");
  return value;
};
const wrap =
  (
    fn: (
      req: AuthenticatedRequest,
      res: import("express").Response,
    ) => Promise<void>,
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ValidationError(
      result.error.issues.map((i) => i.message).join("; "),
    );
  return result.data;
}
const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function page(req: Request) {
  const p = parse(paging, req.query);
  return { ...p, cursor: p.lastItemId ? { _id: { $lt: p.lastItemId } } : {} };
}
function responsePage<T extends { _id: unknown }>(items: T[], size: number) {
  const hasNext = items.length > size;
  const shown = items.slice(0, size);
  return {
    items: shown,
    pageSize: size,
    hasNext,
    nextLastItemId: hasNext ? String(shown.at(-1)!._id) : null,
  };
}

export function createContaController(
  jwtSecret: string,
  produtoService: IProdutoService,
  produtorService?: IProdutorService,
) {
  const router = Router();
  const auth = createAuthMiddleware(jwtSecret),
    admin = createRequireAdmin(jwtSecret);
  async function account(req: AuthenticatedRequest) {
    const user = await UsuarioModel.findById(id(req.userId));
    if (!user) throw new NotFoundError("Usuário não encontrado");
    return user;
  }
  const preCadastro = new PreCadastroService(jwtSecret);
  const lookupLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
  });
  router.post(
    "/minha-conta/pre-cadastro/consultar",
    lookupLimiter,
    wrap(async (req, res) => {
      res.json(await preCadastro.consultar(undefined, req.body));
    }),
  );
  router.post(
    "/minha-conta/pre-cadastro/confirmar",
    auth,
    lookupLimiter,
    wrap(async (req, res) => {
      const body = parse(
        z.object({ confirmacaoToken: z.string().min(1) }).strict(),
        req.body,
      );
      res.json(
        await preCadastro.confirmar(id(req.userId), body.confirmacaoToken),
      );
    }),
  );
  router.get(
    "/minha-conta/perfil",
    auth,
    wrap(async (req, res) => {
      const user = await account(req);
      const producer = user.produtorId
        ? await ProdutorModel.findById(user.produtorId)
        : null;
      res.json({
        vinculado: !!user.produtorId,
        produtor: producer ? toProdutorEntity(producer) : null,
      });
    }),
  );
  router.patch(
    "/minha-conta/perfil",
    auth,
    wrap(async (req, res) => {
      const user = await account(req);
      if (!user.produtorId)
        throw new NotFoundError(
          "Sua conta ainda não possui um perfil de produtor",
        );
      const body = parse(
        z
          .object({
            nomeEmpresa: z.string().optional(),
            historia: z.string().optional(),
            logo: file.nullable().optional(),
            fotos: z.array(file).optional(),
            contato: z
              .object({ telefone: z.string(), email: z.string() })
              .strict()
              .optional(),
            revisao: z.number().int().min(0),
          })
          .strict(),
        req.body,
      );
      if (!produtorService)
        throw new NotFoundError("Serviço de perfil indisponível");
      res.json(
        await produtorService.update(user.produtorId, {
          ...body,
          autorId: user.id,
        }),
      );
    }),
  );
  router.get(
    "/gestao/aprovacoes/produtores",
    admin,
    wrap(async (req, res) => {
      const p = page(req);
      const filter = {
        ...reviewStatusFilter(parse(z.enum(["PENDENTE", "ALTERADO"]).optional(), req.query.status)),
        ...(p.busca
          ? { nomeEmpresa: { $regex: escaped(p.busca), $options: "i" } }
          : {}),
      };
      const [items, total] = await Promise.all([
        ProdutorModel.find({ ...filter, ...p.cursor })
          .sort({ _id: -1 })
          .limit(p.pageSize + 1),
        ProdutorModel.countDocuments(filter),
      ]);
      const result = responsePage(items, p.pageSize);
      res.json({ ...result, total, items: result.items.map(toProdutorEntity) });
    }),
  );
  router.get(
    "/minha-conta/produtos",
    auth,
    wrap(async (req, res) => {
      const user = await account(req);
      const p = page(req);
      if (!user.produtorId) {
        res.json({
          items: [],
          vinculado: false,
          hasNext: false,
          nextLastItemId: null,
          pageSize: p.pageSize,
        });
        return;
      }
      const items = await ProdutoModel.find({
        produtorId: user.produtorId,
        ...p.cursor,
        ...(p.busca
          ? { nome: { $regex: escaped(p.busca), $options: "i" } }
          : {}),
      })
        .sort({ _id: -1 })
        .limit(p.pageSize + 1);
      const result = responsePage(items, p.pageSize);
      res.json({
        ...result,
        items: result.items.map(toProdutoEntity),
        vinculado: true,
      });
    }),
  );
  router.patch(
    "/minha-conta/produtos/:id",
    auth,
    wrap(async (req, res) => {
      const user = await account(req);
      const productId = id(req.params.id);
      const product = await ProdutoModel.findOne({
        _id: productId,
        produtorId: user.produtorId ?? "SEM_VINCULO",
      });
      if (!product) throw new NotFoundError("Produto não encontrado");
      const body = parse(changes, req.body);
      res.json(
        await produtoService.update(productId, { ...body, autorId: user.id }),
      );
    }),
  );
  router.get(
    "/gestao/aprovacoes",
    admin,
    wrap(async (req, res) => {
      const p = page(req);
      const filter = {
        ...reviewStatusFilter(parse(z.enum(["PENDENTE", "ALTERADO"]).optional(), req.query.status)),
        ...(p.busca
          ? { nome: { $regex: escaped(p.busca), $options: "i" } }
          : {}),
      };
      const [items, total] = await Promise.all([
        ProdutoModel.find({ ...filter, ...p.cursor })
          .sort({ _id: -1 })
          .limit(p.pageSize + 1),
        ProdutoModel.countDocuments(filter),
      ]);
      const result = responsePage(items, p.pageSize);
      const producers = await ProdutorModel.find({
        _id: {
          $in: result.items.map((i) => i.produtorId).filter(isValidObjectId),
        },
      }).select("nomeEmpresa");
      res.json({
        ...result,
        total,
        items: result.items.map((i) => ({
          ...toProdutoEntity(i),
          produtorNome: producers.find((p) => p.id === i.produtorId)
            ?.nomeEmpresa,
        })),
      });
    }),
  );
  router.get(
    "/gestao/usuarios",
    admin,
    wrap(async (req, res) => {
      const p = page(req);
      const search = p.busca
        ? {
            $or: [
              { nome: { $regex: escaped(p.busca), $options: "i" } },
              { email: { $regex: escaped(p.busca), $options: "i" } },
            ],
          }
        : {};
      const items = await UsuarioModel.find({ ...p.cursor, ...search })
        .select("nome email produtorId historicoVinculos")
        .sort({ _id: -1 })
        .limit(p.pageSize + 1);
      const result = responsePage(items, p.pageSize);
      const producerIds = [
        ...new Set(
          result.items
            .map((user) => user.produtorId)
            .filter((id): id is string => !!id && isValidObjectId(id)),
        ),
      ];
      const producers = producerIds.length
        ? await ProdutorModel.find({ _id: { $in: producerIds } }).select(
            "nomeEmpresa documento contato.telefone",
          )
        : [];
      res.json({
        ...result,
        items: result.items.map((user) => ({
          _id: user._id,
          nome: user.nome,
          email: user.email,
          produtorId: user.produtorId,
          historicoVinculos: user.historicoVinculos,
          produtorVinculado:
            producers.find(
              (producer) => String(producer._id) === user.produtorId,
            ) ?? null,
        })),
      });
    }),
  );
  router.get(
    "/gestao/produtores",
    admin,
    wrap(async (req, res) => {
      const p = page(req);
      const digits = p.busca.replace(/\D/g, "");
      const numeric = digits.length > 0 && /^[\d\s()+./-]+$/.test(p.busca);
      // Aceita documentos e telefones com ou sem máscara, inclusive busca parcial.
      const numberPattern = numeric
        ? digits.split("").join("\\D*")
        : escaped(p.busca);
      const search = p.busca
        ? {
            $or: [
              { nomeEmpresa: { $regex: escaped(p.busca), $options: "i" } },
              { "documento.numero": { $regex: numberPattern, $options: "i" } },
              ...(numeric
                ? [{ "contato.telefone": { $regex: numberPattern } }]
                : []),
            ],
          }
        : {};
      const items = await ProdutorModel.find({ ...p.cursor, ...search })
        .select("nomeEmpresa documento contato.telefone")
        .sort({ _id: -1 })
        .limit(p.pageSize + 1);
      const result = responsePage(items, p.pageSize);
      const producerIds = result.items.map((producer) => String(producer._id));
      const accounts = producerIds.length
        ? await UsuarioModel.find({ produtorId: { $in: producerIds } }).select(
            "nome email produtorId",
          )
        : [];
      res.json({
        ...result,
        items: result.items.map((producer) => ({
          _id: producer._id,
          nomeEmpresa: producer.nomeEmpresa,
          documento: producer.documento,
          contato: producer.contato,
          contasVinculadas: accounts
            .filter((account) => account.produtorId === String(producer._id))
            .map((account) => ({
              id: String(account._id),
              nome: account.nome,
              email: account.email,
            })),
        })),
      });
    }),
  );
  router.put(
    "/gestao/usuarios/:id/vinculo",
    admin,
    wrap(async (req, res) => {
      const targetId = id(req.params.id);
      const { produtorId } = parse(
        z
          .object({ produtorId: z.string().refine(isValidObjectId).nullable() })
          .strict(),
        req.body,
      );
      if (produtorId && !(await ProdutorModel.exists({ _id: produtorId })))
        throw new NotFoundError("Produtor não encontrado");
      const current = await UsuarioModel.findById(targetId);
      if (!current) throw new NotFoundError("Usuário não encontrado");
      const updated = await UsuarioModel.findOneAndUpdate(
        { _id: targetId, produtorId: current.produtorId ?? null },
        {
          ...(produtorId
            ? { $set: { produtorId } }
            : { $unset: { produtorId: "" } }),
          $push: {
            historicoVinculos: {
              administradorId: req.userId,
              origem: "MANUAL",
              anterior: current.produtorId,
              novo: produtorId ?? undefined,
              data: new Date(),
            },
          },
        },
        { new: true },
      ).select("nome email produtorId historicoVinculos");
      if (!updated)
        throw new ConflictError("Vínculo alterado. Atualize a página");
      res.json(updated);
    }),
  );
  return router;
}
