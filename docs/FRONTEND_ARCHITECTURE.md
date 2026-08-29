# Arquitetura Frontend — Catalog-AMCG

Catálogo digital da AMCG (Campos Gerais - PR): vitrine pública de produtores/produtos e painel de curadoria. Projeto pequeno — Feature-based, sem Clean Architecture, FSD completo ou estado global pesado.

**Stack:** React (Vite) · TypeScript · React Router · Tailwind CSS · Docker Compose

Contrato com o backend: HTTP JSON sob `/api`. Camadas do servidor: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

---

## 1. Visão geral

```text
Page (rota)
    |
Feature hook
    |
Feature api
    |
shared/api (fetch base)
    |
HTTP /api  -->  backend (Express)
```

Fluxo: página compõe UI → hook da feature orquestra loading/erro → funções HTTP tipadas → client compartilhado → Express.

---

## 2. Layout do monorepo

```text
Catalog-AMCG/
├── frontend/                 React + Vite + Tailwind
├── backend/                  Express + TypeScript
├── docs/                     Documentação (este arquivo)
├── docker-compose.yml
└── docker-compose.dev.yml
```

### Frontend (`frontend/src/`)

Árvore alvo (Feature-based). O scaffold Vite evolui para esta estrutura conforme as features.

```text
frontend/src/
├── app/                      # router, providers, layout
├── pages/                    # rotas: catalogo, produtor, admin
├── features/
│   ├── produto/              # api, components, hooks, types
│   ├── produtor/
│   └── auth/                 # contexto usuario na UI
├── shared/                   # api client, UI genérica, lib
└── styles/                   # entry CSS Tailwind (+ tokens se houver)
```

Contextos espelham o backend (`produto`, `produtor`, `usuario`); na UI, `auth` cobre o domínio `usuario`.

---

## 3. Camadas

| Camada | Onde | Contém | Não contém |
|--------|------|--------|------------|
| **Page** | `pages/` | Rota e composição de features | Fetch direto, regra de negócio |
| **Feature api** | `features/<contexto>/api/` | Chamadas HTTP tipadas daquele contexto | JSX, estado de tela |
| **Feature hooks** | `features/<contexto>/hooks/` | Loading, erro, orquestra a api | Express, Mongoose |
| **Feature components** | `features/<contexto>/components/` | UI específica do domínio (classes Tailwind) | Persistência, JWT no servidor |
| **Feature types** | `features/<contexto>/types.ts` | DTOs alinhados à API | Schemas Mongoose / entities do backend |
| **Shared api** | `shared/api/` | `fetch` base, headers, erros HTTP | Regras de produto/produtor |

### Exemplo por contexto (`produto`)

O mesmo padrão vale para `produtor` e `auth`.

**Page** — `pages/catalogo/` (vitrine) ou `pages/admin/` (curadoria)

- Monta filtros, lista e ações de tela.
- Usa hooks da feature; não chama `fetch` diretamente.

**Feature api** — `features/produto/api/`

- Ex.: `list(filters)`, `getById(id)`, `approve(id)` (admin).
- Paths sob `/api/produtos` (proxy Vite em dev).

**Feature hooks** — `features/produto/hooks/`

- Ex.: `useProdutos(filters)` — estado, loading e erro a partir da api.

**Feature components** — `features/produto/components/`

- Cards, filtros, formulários do domínio; utilitários Tailwind.

**Feature types** — `features/produto/types.ts`

- Formato JSON da API (não entidade Mongo).

### Pastas de uma feature

```text
frontend/src/features/produto/
├── api/
├── components/
├── hooks/
└── types.ts
```

Vitrine e backoffice compartilham a mesma feature; só as `pages/` mudam.

---

## 4. Contrato com a API

- Única fonte de dados no frontend: **HTTP JSON** sob `/api`.
- Em desenvolvimento, o Vite encaminha `/api` para o backend (ver `vite.config.ts` e `API_PROXY_TARGET`).
- Validação de formulário no client (se houver) é só UX; a validação oficial fica no controller Express (ex.: Zod).
- Regras de negócio (aprovação, publicação, filtros de catálogo) ficam no **service** do backend — não no React.

---

## 5. Estilos (Tailwind)

- **Stack:** Tailwind CSS v4 + plugin `@tailwindcss/vite` em `vite.config.ts`.
- **Entry:** `@import "tailwindcss"` no CSS importado por `main.tsx` (hoje `src/index.css`; pode migrar para `src/styles/`).
- **Uso:** classes utilitárias nos JSX de `features/`, `shared/components/` e layout em `app/`.
- **Tokens de marca:** se necessário (cores/fontes AMCG), usar `@theme` no CSS entry — sem `tailwind.config.js` clássico do v3.

| Contém | Não contém |
|--------|------------|
| Utilitários Tailwind nos componentes | CSS-in-JS, CSS Modules como padrão |
| `@theme` para tokens compartilhados | Folhas CSS por feature sem necessidade |
| Plugin Vite oficial | Dependência de runtime de CSS-in-JS |

---

## 6. Testes

Testes de UI ficam fora do escopo por enquanto (sem runner no `frontend/`).

Prioridade de qualidade: testes Jest no **backend** (services e integração HTTP) — ver [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

---

## 7. Backend

- Toda regra de domínio e persistência: Express em camadas (controller → service → repository).
- Auth do painel (quando implementada): JWT/bcrypt no backend; o front só guarda/envia o token via `shared/api`.
- Detalhes: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

---

## 8. Desenvolvimento local

Use Docker Compose conforme o [README](../README.md):

- Dev: `docker compose -f docker-compose.dev.yml up`
- Health: `http://localhost:3000/api/health`
- Catálogo (Vite): `http://localhost:5173`

---

## 9. Fora de escopo deste projeto

Não usamos Clean Architecture / Hexagonal no front, Feature-Sliced Design completo, Redux/saga, React Query como obrigação, OpenAPI client gerado, microfrontends, CSS-in-JS nem CSS Modules como padrão. Organização é Feature-based + HTTP `/api` + Tailwind.
