# Arquitetura — Catalog-AMCG

Catálogo digital da AMCG (Campos Gerais - PR): vitrine pública de produtores/produtos e painel de curadoria. Projeto pequeno — camadas claras, sem CQRS, MediatR, workers ou OpenAPI.

**Stack:** React (Vite) · Express (TypeScript) · MongoDB (Mongoose) · bcrypt · JWT · Docker Compose · Jest

---

## 1. Visão geral

```text
frontend (React/Vite)  --HTTP /api-->  backend (Express)
                                            |
                     application/controllers
                                            |
                              domain/services
                                            |
                    domain/repository (contratos)
                                            |
              infraestructure/repository (Mongo)
                                            |
                                         MongoDB
```

Fluxo: request HTTP → controller → service → contrato de repository → implementação Mongoose → MongoDB.

---

## 2. Layout do monorepo

```text
Catalog-AMCG/
├── frontend/                 React + Vite
├── backend/                  Express + TypeScript
├── docs/                     Documentação (este arquivo)
├── docker-compose.yml
└── docker-compose.dev.yml
```

### Backend (`backend/src/`)

```text
backend/src/
├── app.ts
├── application/
│   └── controllers/              usuario, produtor, produto
├── configuration/
│   ├── dotenv.ts
│   ├── env-constants/
│   └── factory/
├── domain/
│   ├── common/
│   ├── server/
│   ├── usuario/
│   ├── produtor/
│   └── produto/
├── infraestructure/
│   ├── db/mongo/
│   │   ├── schema/
│   │   └── models/
│   ├── repository/
│   │   ├── usuario/
│   │   ├── produtor/
│   │   └── produto/
│   ├── external/services/
│   └── export/
└── tests/
    ├── mocks/
    ├── unit/
    └── integration/
```

A pasta de persistência usa a grafia `infraestructure`.

---

## 3. Camadas

| Camada | Onde | Contém | Não contém |
|--------|------|--------|------------|
| **Controller** | `application/controllers/` | Rotas Express, validação de request (ex.: Zod), chama o service, monta response HTTP | Regra de negócio, Mongoose |
| **Service** | `domain/<contexto>/service/` | Regras de negócio; orquestra entity + repository | `req`/`res`, schemas Mongoose |
| **Repository (contrato)** | `domain/<contexto>/repository/` | Interfaces read/write de persistência | Implementação Mongo |
| **Repository (impl)** | `infraestructure/repository/<contexto>/` | Mongoose + adapters entity ↔ documento | Regras de negócio |
| **Schema / Model** | `infraestructure/db/mongo/` | Schemas e models Mongoose | Lógica de domínio |
| **Entity** | `domain/<contexto>/entity/` | Tipos e constantes do domínio | HTTP ou DB |

### Exemplo por contexto (`produto`)

O mesmo padrão vale para `usuario` e `produtor`.

**Controller** — `application/controllers/produto.controller.ts`

- Define rotas (`GET /api/produtos`, `POST /api/produtos`, etc.).
- Valida body/query com Zod.
- Chama `ProdutoService` e devolve status + JSON.

**Service** — `domain/produto/service/produto.service.ts`

- Aprova/rejeita produto, aplica regras de publicação, monta filtros de catálogo.
- Usa só contratos de repository e entities — sem Express e sem Mongoose.

**Repository (contrato)** — `domain/produto/repository/`

```text
produto.repository.read.ts    # findById, listByFilters, ...
produto.repository.write.ts   # create, update, ...
```

**Repository (impl) + adapter** — `infraestructure/repository/produto/`

```text
produto.repository.read.ts
produto.repository.write.ts
adapters/produto.adapter.ts   # document ↔ entity
```

**Schema / model** — `infraestructure/db/mongo/schema/` e `models/`

- Definem a forma do documento no MongoDB.

**Entity** — `domain/produto/entity/`

```text
produto.entity.ts
produto.constants.ts
interfaces/
```

### Pastas de um contexto de domínio

```text
backend/src/domain/produto/
├── entity/
├── service/
│   └── produto.service.ts
├── repository/
│   ├── produto.repository.read.ts
│   └── produto.repository.write.ts
└── export/
```

---

## 4. Persistência

- **MongoDB** é a única fonte de dados.
- **Mongoose** fica só em `infraestructure` (schemas, models, repositories).
- Conexão via `MONGO_URI` (ver `.env.example` e Docker Compose).

---

## 5. Testes (Jest)

Framework: **Jest** (TypeScript via `ts-jest` ou equivalente, quando instalado no `backend/`).

```text
backend/src/tests/
├── mocks/           # doubles compartilhados (ex.: fake repositories)
├── unit/            # services com mock de repository
│   └── produto/service/
└── integration/     # controller / service / repository (HTTP ou Mongo de teste)
    ├── controller/
    ├── service/
    └── repository/
```

| Tipo | Foco |
|------|------|
| Unitário | Service (prioridade) — regras com repository mockado |
| Integração | Controller (HTTP via Supertest), repository (persistência Mongo) |

Auth do painel (quando implementada): **bcrypt** para senha e **JWT** (`JWT_SECRET` no `.env`). Rodar: `npm test` dentro de `backend/`.

---

## 6. Frontend

- React + Vite + Tailwind em `frontend/`.
- Arquitetura Feature-based (pages → features → shared); detalhes em [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md).
- Em desenvolvimento, o Vite encaminha `/api` para o backend (proxy).
- Contrato com a API: HTTP JSON sob `/api`.

---

## 7. Desenvolvimento local

Use Docker Compose conforme o [README](../README.md):

- Dev: `docker compose -f docker-compose.dev.yml up`
- Health: `http://localhost:3000/api/health`
- Catálogo (Vite): `http://localhost:5173`

---

## 8. Fora de escopo deste projeto

Não usamos CQRS/MediatR, workers, Kafka, camada de contrato OpenAPI nem PostgreSQL. Persistência é MongoDB; organização é controller → service → repository.
