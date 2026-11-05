# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Public catalog (vitrine) of small rural producers from the Campos Gerais region (PR, Brazil) for AMCG, plus an admin backoffice for curation. Consumers buy directly via the producer's WhatsApp (`wa.me` links built in `frontend/src/features/produto/lib/whatsapp.ts`). Domain language, identifiers, error messages and UI text are in **Portuguese** (`produto`, `produtor`, `usuario`, `inscricao`, `destaque`, `ativo`…) — keep new code consistent with that.

Monorepo with two independent npm projects: `backend/` (Express 5 + TypeScript + Mongoose + Zod) and `frontend/` (React 19 + Vite + Tailwind v4 + React Router 7). The root `package.json` is not used for development.

## Commands

The supported way to run everything is Docker Compose (requires `.env`, copied from `.env.example`). Never run both compose files at once — they share ports and container names.

```bash
docker compose -f docker-compose.dev.yml up --build   # dev: hot reload, catalog at :5173, API at :3000
docker compose up --build                             # packaged: Nginx build at :80
```

Backend (`cd backend`):

```bash
npm test                                   # Jest (ts-jest), tests live in src/tests/**/*.test.ts
npx jest src/tests/unit/produto            # single folder/file
npx jest -t "Quando cadastrar"             # single test by name
npm run build                              # tsc (also the type check)
npm run migrate:categorias                 # data migrations (need MONGO_URI reachable)
npm run migrate:registros
# or inside compose: docker compose -f docker-compose.dev.yml exec backend npx tsx scripts/migrate-categorias.ts
```

Frontend (`cd frontend`): `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`, the type check). There is no frontend test runner.

In dev, `node_modules` live in Docker volumes; run `npm ci` locally in each project if you need editor types or to run tests outside the container.

## Backend architecture

Layered: controller → service → repository contract → Mongo implementation. Note the folder spelling `infraestructure`.

- `src/app.ts` — `createApp({ jwtSecret, usuarioService?, produtorService?, produtoService?, rateLimits? })` mounts all routers under `/api/*`, rate limiters and the final `errorHandler`. Services are optional injections; when omitted they are built by `configuration/factory/*.factory.ts`, which wire the Mongo repositories. `domain/server/server.ts` is the entrypoint (loads env, connects Mongo, calls `createApp`).
- `application/controllers/*.controller.ts` — each exports `createXController(deps)` returning an Express `Router`. Request validation is done here with Zod schemas built from the domain constants. `inscricao.controller.ts` handles the public producer+products inscription flow and uses both produtor and produto services.
- `application/middleware/` — `createAuthMiddleware(secret)` (any valid JWT) and `createRequireAdmin(secret)` (JWT with `role: "admin"`); JWT payload is `{ sub, email, role }`. Rate limit presets live in `rate-limit.middleware.ts`.
- `domain/<contexto>/` — `entity/` (types, `*.constants.ts` with `as const` enums like `STATUS_PRODUTO`, `CATEGORIA_PRODUTO`, limits like `MAX_DESTAQUES`, `MIN/MAX_FOTOS`), `service/` (business rules, no Express/Mongoose), `repository/` (read/write interfaces only).
- `infraestructure/repository/<contexto>/` implements those interfaces with Mongoose; `adapters/*.adapter.ts` convert documents ↔ entities. Schemas/models in `infraestructure/db/mongo/`.
- Errors: throw subclasses of `AppError` from `domain/common/errors/app-error.ts` (`ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409); the error-handler middleware maps them to `{ error: message }` JSON responses.

Key domain rules (in services): producers and products have `status` (`PENDENTE` → `APROVADO`/`REJEITADO`) set by admin curation, plus `ativo` (admin can hide an approved item from the catalog) and `destaque` (featured, capped by `MAX_DESTAQUES`). Only `ativo && APROVADO` items — whose producer is also `ativo && APROVADO` — appear in public `/catalogo` endpoints. Deactivating clears `destaque`.

Files (logos, photos, comprovantes) are sent as JSON `{ url, contentType, nomeOriginal }` where `url` is a base64 data URL (frontend caps files at 700 KB; backend JSON body limit is 10 MB). There is no separate upload service.

### Tests

- `tests/unit/` — services with in-memory repositories from `tests/mocks/` (`InMemoryProdutoRepository`, etc., implementing both read and write contracts).
- `tests/integration/controller/` — Supertest against `createApp(...)` with services built on the in-memory mocks and tokens signed with a test secret. No real MongoDB is needed for the test suite.
- Naming rule (from `.cursor/rules/describeCerto.mdc`): every `describe` starts with **"Quando …"** and every `it` with **"Deve …"**; rewrite non-conforming titles when editing a test file.

## Frontend architecture

Feature-based: `pages/` (route composition) → `features/<contexto>/hooks` (loading/error state) → `features/<contexto>/api` (typed HTTP calls) → `shared/api/client.ts` (`apiRequest`). Pages should not call `fetch` directly; business rules stay in the backend.

- Features: `produto`, `produtor`, `auth` (covers backend `usuario`). Each has `api/`, `components/`, `hooks/`, `lib/`, `types.ts` (API DTOs, not backend entities). Catalog and backoffice share the same features; only pages differ.
- Routes (`app/router.tsx`): public under `CatalogLayout` (`/`, `/produtores`, `/produtores/:id`, `/produtos/:id`, `/inscricao`, `/quem-somos`); `/backoffice/login`; `/backoffice` behind auth.
- Auth: JWT stored in `localStorage` (`shared/api/auth-token.ts`); `apiRequest(path, { authenticated: true })` attaches it and on 401 clears it and redirects to `/backoffice/login`. API errors surface as `ApiError` with `status`.
- Vite proxies `/api` to the backend in dev; Nginx does it in the packaged build. Styling is Tailwind v4 utilities with `@theme` tokens (no `tailwind.config.js`).

Further detail: `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md`.
