# 🌾 Catálogo do Produtor Regional — AMCG (Campos Gerais - PR)

Plataforma web voltada ao fortalecimento da economia local nos Campos Gerais do Paraná. O sistema atua como uma vitrine digital para pequenos produtores rurais e artesãos realizarem vendas diretas via WhatsApp, contando com um painel de retaguarda (backoffice) para curadoria, validação e governança da **Associação dos Municípios dos Campos Gerais (AMCG)**.

---

## 🏛️ Realização e Apoio

Este projeto é uma iniciativa desenvolvida dentro do projeto de extensão/pesquisa:

* **Projeto:** *Tecnologias no Campo e Capacitação de Pequenos Produtores* — **UEPG** (Universidade Estadual de Ponta Grossa)
* **Professora Coordenadora:** Maria Salete M. Gomes
* **Parceria:** Associação dos Municípios dos Campos Gerais (AMCG)

---

## 📌 Sobre o Projeto

O objetivo do projeto é encurtar a distância entre os pequenos produtores e os consumidores regionais, eliminando intermediários, promovendo os produtos típicos dos municípios da AMCG e capacitando os produtores para o uso de tecnologias digitais.

### **Como funciona:**
1. **Produtor:** Cadastra seu perfil e seus produtos no sistema.
2. **Backoffice (AMCG/Administração):** Analisa o cadastro, verifica os requisitos de qualidade/origem e aprova a publicação.
3. **Consumidor:** Navega pelo catálogo, filtra por categoria ou cidade e clica para negociar e comprar direto pelo **WhatsApp do próprio produtor**.

---

## 🚀 Funcionalidades

### 🛒 Vitrine Pública (Catálogo)
- **Busca & Filtros:** Busca por nome do produto, categoria e município da AMCG.
- **Página do Produtor:** Perfil com história, localização e catálogo completo de itens/produtor.
- **Venda Direta:** Botão integrado com a API do WhatsApp configurado com mensagem automática informando o item de interesse.

### 🛡️ Painel Administrativo (Backoffice)
- **Aprovação de Produtores:** Análise de novos cadastros com opção de aceitar, rejeitar ou solicitar ajustes.
- **Curadoria de Produtos:** Aprovação individual de novos itens postados na plataforma.
- **Gestão Regional:** Painel com relatórios básicos de produtores ativos por município.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React (Vite)
- **Backend:** TypeScript (Node)
- **Banco de Dados:** Mongo DB
- **Integração:** API do WhatsApp (`https://wa.me/`)
- **Containers:** Docker Compose (frontend, backend, MongoDB)

---

## Como rodar

**Pré-requisito:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto. Não é preciso instalar Node nem Mongo na máquina.

Há dois arquivos Compose. **Não suba os dois ao mesmo tempo** (eles usam as mesmas portas e nomes de container).

| Arquivo | Para que serve | Catálogo |
| -------- | -------------- | -------- |
| `docker-compose.dev.yml` | Programar: `npm run dev` nos containers, o código recarrega ao salvar | http://localhost:5173 |
| `docker-compose.yml` | Empacotado: build + Nginx, como o sistema sobe “de verdade” | http://localhost |

### Primeira vez

1. Clone o repositório e entre na pasta:

```bash
git clone https://github.com/LucasSassi/Catalog-AMCG.git
cd Catalog-AMCG
```

2. Crie o `.env` a partir do exemplo (valores locais já vêm preenchidos; altere a senha se quiser):

```bash
cp .env.example .env
```

No Windows (PowerShell): `Copy-Item .env.example .env`

3. Suba no modo **desenvolvimento** (recomendado para o time):

```bash
docker compose -f docker-compose.dev.yml up --build
```

4. Confira no navegador:

| Serviço | URL |
| -------- | --- |
| Catálogo (Vite) | http://localhost:5173 |
| API (health) | http://localhost:3000/api/health |
| MongoDB | localhost:27017 |

Edite os arquivos em `frontend/` e `backend/` no VS Code. Os containers recarregam sozinhos. O Vite encaminha `/api` para o serviço `backend`. Dentro da rede Docker, o Mongo usa o hostname `mongo` (veja `MONGO_URI` no `.env`).

### Já rodei antes (desenvolver)

```bash
docker compose -f docker-compose.dev.yml up
```

Use `--build` de novo só se mudou `package.json`, Dockerfile ou lockfile.

Para parar:

```bash
docker compose -f docker-compose.dev.yml down
```

Os dados do Mongo ficam no volume `mongo_data`.

### Empacotado (build + Nginx)

Primeira vez ou depois de mudar código que entra na imagem:

```bash
docker compose up --build
```

Já rodei (sem mudar código da imagem):

```bash
docker compose up
```

| Serviço | URL |
| -------- | --- |
| Catálogo | http://localhost |
| API (health) | http://localhost:3000/api/health |

Para parar: `docker compose down`.

---

## 📂 Estrutura de Pastas

O backend vive em `backend/` e o frontend em `frontend/`. Backend em camadas (`application` → `domain` → `infraestructure`). Sem workers e sem Kafka. A pasta de persistência usa a grafia `infraestructure`.

```text
backend/src/
├── app.ts
├── application/
│   └── controllers/              usuario, produtor, produto
├── configuration/
│   ├── dotenv.ts
│   ├── env-constants/
│   └── factory/
├── contracts/
│   └── service.yaml
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

Cada contexto de domínio (exemplo `usuario`; o mesmo padrão vale para `produtor` e `produto`):

```text
backend/src/domain/usuario/
├── entity/
│   ├── usuario.entity.ts
│   ├── usuario.constants.ts
│   └── interfaces/
│       ├── usuario.interface.ts
│       └── usuario.service.interface.ts
├── service/
│   └── usuario.service.ts
├── repository/                    contratos read/write (sem Mongo)
│   ├── usuario.repository.read.ts
│   └── usuario.repository.write.ts
└── export/
```

Implementação Mongo do repository:

```text
backend/src/infraestructure/repository/usuario/
├── usuario.repository.read.ts
├── usuario.repository.write.ts
└── adapters/
    └── usuario.adapter.ts
```

```text
backend/src/infraestructure/db/mongo/
├── schema/                       usuario, produtor, produto
└── models/
```

```text
backend/src/tests/
├── mocks/
├── unit/
│   └── usuario/service/
└── integration/
    ├── controller/
    ├── service/
    └── repository/
```
