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

- **Frontend:** React
- **Backend:** TypeScript (Node)
- **Banco de Dados:** Mongo DB
- **Integração:** API do WhatsApp (`https://wa.me/`)

---

## 📂 Estrutura de Pastas

Backend em camadas (`application` → `domain` → `infraestructure`). Sem workers e sem Kafka. A pasta de persistência usa a grafia `infraestructure`.

```text
src/
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
src/domain/usuario/
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
src/infraestructure/repository/usuario/
├── usuario.repository.read.ts
├── usuario.repository.write.ts
└── adapters/
    └── usuario.adapter.ts
```

```text
src/infraestructure/db/mongo/
├── schema/                       usuario, produtor, produto
└── models/
```

```text
src/tests/
├── mocks/
├── unit/
│   └── usuario/service/
└── integration/
    ├── controller/
    ├── service/
    └── repository/
```
