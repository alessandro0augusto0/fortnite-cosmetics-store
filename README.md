# 🎮 Fortnite Cosmetics Store

Aplicação full-stack (NestJS + React) que sincroniza o catálogo público do Fortnite e permite simular compras de cosméticos usando V-Bucks. Todo o ambiente pode ser iniciado com **Docker Compose** e também há instruções para rodar cada serviço manualmente.

---

## 📦 Arquitetura

| Camada   | Stack principal | Destaques |
|----------|-----------------|-----------|
| Backend  | NestJS · Prisma · PostgreSQL | Auth JWT, sincronização agendada com [fortnite-api.com](https://dash.fortnite-api.com/), compra/devolução com histórico |
| Frontend | React 18 · Vite · TailwindCSS | Catálogo paginado, filtros avançados, compras inline, integração total via Axios |
| Infra    | Docker Compose               | Serviços `postgres`, `backend`, `frontend` com migrations aplicadas automaticamente |

Arquivos importantes:

```
backend/         API NestJS + Prisma
frontend/        SPA React + Vite
BACKLOG.md       Próximas entregas
Dockerfile(s)    Build de cada serviço
docker-compose.yml  Orquestração local
```

---

## ✅ Requisitos do desafio

| Item | Status |
|------|--------|
| Listagem paginada com filtros (nome, tipo, raridade, flags novo/venda) | ✅ |
| Indicadores "Novo", "Na Loja" e "Já adquirido" | ✅ |
| Cadastro/Login com bônus de 10 000 V-Bucks | ✅ |
| Compra/devolução com saldo e histórico | ✅ |
| Sincronização periódica de `/cosmetics`, `/cosmetics/new`, `/shop` | ✅ (cron + endpoint manual) |
| Inventário e histórico disponíveis via API | ✅ (frontend dedicado em andamento) |
| Página pública de usuários/perfis | 🔄 Backend pronto (`GET /users`, `/users/:id`); UI pendente |
| Filtro por data/promoção e bundles | 🔜 listado no BACKLOG |

> Consulte `BACKLOG.md` para saber o que falta (bundles, página de detalhes, filtros de data/promoção, etc.).

---

## 🛠️ Pré-requisitos

- Docker Desktop 4.27+ (ou compatível)
- Node.js 20.x se for executar sem Docker
- npm (o projeto usa `package-lock.json`)

---

## 🚀 Subindo tudo com Docker

```bash
git clone https://github.com/alessandro0augusto0/fortnite-cosmetics-store.git
cd fortnite-cosmetics-store

# primeira execução (constrói imagens e aplica migrations)
docker compose up --build -d

# acompanhar logs do backend
docker logs -f eso_backend
```

Serviços expostos:

| Serviço   | URL                  | Observações |
|-----------|----------------------|-------------|
| Frontend  | http://localhost:8080 | SPA servida via nginx |
| Backend   | http://localhost:3000 | Endpoints `/auth/*`, `/register`, `/login`, `/cosmetics`, `/shop/*`, etc. |
| PostgreSQL| localhost:5432        | Credenciais `admin:admin`, banco `sistema_eso_db` |

O backend executa `npx prisma migrate deploy` em toda inicialização para manter o schema atualizado com `backend/prisma/migrations`.

---

## 🧑‍💻 Executando sem Docker

### Backend

```bash
cd backend
npm install
# ajuste backend/prisma/.env se quiser apontar para outro banco
npx prisma migrate dev
npm run start:dev
```

Variáveis importantes (`backend/prisma/.env` padrão):

```
DATABASE_URL=postgresql://admin:admin@localhost:5432/sistema_eso_db?schema=public
JWT_SECRET=supersecret_eso_key
PORT=3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# abre http://localhost:5173
```

Para apontar para outro backend basta definir `VITE_API_BASE`.

---

## 🔌 Principais endpoints

| Método | Rota                    | Descrição |
|--------|-------------------------|-----------|
| POST   | `/register` / `/auth/register` | Cria usuário, retorna `{ token, user }` e credita 10 000 V-Bucks |
| POST   | `/login` / `/auth/login`       | Autentica e retorna `{ token, user }` |
| GET    | `/me` / `/auth/me`             | Perfil autenticado + itens possuídos |
| GET    | `/cosmetics`                   | Catálogo paginado (`page`, `search`, `type`, `rarity`, `isNew`, `isOnSale`) |
| GET    | `/cosmetics/:id`               | Detalhes completos de um cosmético |
| POST   | `/cosmetics/sync`              | Força sincronização com a Fortnite API |
| POST   | `/shop/purchase`               | Compra cosmético e debita V-Bucks |
| POST   | `/shop/refund`                 | Devolve cosmético e reembolsa V-Bucks |
| GET    | `/shop/purchases`              | Inventário do usuário autenticado |
| GET    | `/history`                     | Histórico de transações |
| GET    | `/users` / `/users/:id`        | Listagem pública de perfis e itens |

Fontes externas consumidas diretamente:

- `GET https://fortnite-api.com/v2/cosmetics/br`
- `GET https://fortnite-api.com/v2/cosmetics/new`
- `GET https://fortnite-api.com/v2/shop`

---

## 🧾 Fluxos principais

1. **Sincronização:** tarefa agendada (`SYNC_CRON_EXPR`) ou `POST /cosmetics/sync` que atualiza catálogo, novidades e itens em loja.
2. **Cadastro/Login:** bcrypt + JWT; respostas incluem snapshot do usuário para atualizar o frontend imediatamente.
3. **Compra/Devolução:** operações transacionais no Prisma (`User`, `UserItem`, `Transaction`) com retorno do saldo atualizado.
4. **Frontend:** React Query mantém o cache do catálogo e atualiza o contexto de autenticação após compras/devoluções.

---

## 🧪 Testes & comandos úteis

```bash
# backend
cd backend
npm run lint
npm run test:e2e

# frontend
cd frontend
npm run lint
# testes unitários serão adicionados em breve

# sincronizar catálogo manualmente
curl -X POST http://localhost:3000/cosmetics/sync
```

Cobertura automatizada está em construção; por enquanto garantimos linting e build limpos antes de cada PR.

---

## 🗺️ Roadmap imediato

- Página de detalhes do cosmético na SPA
- UI pública para `/users` + filtros
- Suporte a bundles (comprar um item marca todos os itens relacionados)
- Filtros por intervalo de datas e promoções
- Suites de testes (Playwright + Vitest) e mocks da API externa

Veja `BACKLOG.md` para acompanhar essas entregas.

---

## 💬 Suporte

Abra uma issue ou procure **@alessandro0augusto0** quando precisar. Contribuições são muito bem-vindas! 😉
