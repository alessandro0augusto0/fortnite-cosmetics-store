# Fortnite Cosmetics Store

Projeto do desafio técnico — listagem e compra simulada de cosméticos do Fortnite.

---

## ⚙️ Visão geral

* **Frontend:** React + TypeScript (Vite)
* **Backend:** Node.js + TypeScript + NestJS
* **Banco:** PostgreSQL
* **ORM:** Prisma
* **Containerização:** Docker Compose

---

## 🚀 Como rodar o projeto (ambiente de desenvolvimento)

### 1. Clonar o repositório

```bash
git clone https://github.com/alessandro0augusto0/fortnite-cosmetics-store.git
cd fortnite-cosmetics-store
```

### 2. Subir os containers

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

Isso iniciará:

* **backend** em `localhost:4000`
* **banco de dados PostgreSQL** em `localhost:5432`

### 3. Ver logs (opcional)

```bash
docker logs -f infra-backend-1
```

### 4. Acessar o container do backend (opcional)

```bash
docker exec -it infra-backend-1 bash
```

### 5. Rodar migrations ou gerar o Prisma Client manualmente (caso necessário)

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🧩 Endpoints disponíveis

### Base URL

```
http://localhost:4000
```

---

### **POST /auth/register**

Cria um novo usuário no banco.

**Request Body:**

```json
{
  "email": "usuario@teste.com",
  "password": "123456"
}
```

**Response 201:**

```json
{
  "access_token": "jwt_gerado_aqui"
}
```

---

### **POST /auth/login**

Realiza login com usuário existente.

**Request Body:**

```json
{
  "email": "usuario@teste.com",
  "password": "123456"
}
```

**Response 200:**

```json
{
  "access_token": "jwt_gerado_aqui"
}
```

---

## 🧰 Estrutura do projeto

```
fortnite-cosmetics-store/
│
├── backend/
│   ├── prisma/                 # Schema e .env usados pelo Prisma CLI
│   │   ├── schema.prisma
│   │   └── .env
│   ├── src/
│   │   ├── auth/               # Módulo de autenticação (register/login)
│   │   ├── prisma/             # PrismaService para injeção no NestJS
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── infra/
│   └── docker-compose.yml
│
└── frontend/                   # (a ser criado na Etapa 3)
```

---

## 🧾 Backlog

* [x] Etapa 1: Criar repositório e scaffold
* [x] Etapa 2: Criar backend inicial (auth, prisma schema)
* [ ] Etapa 3: Criar frontend inicial (listagem mock)
* [ ] Etapa 4: Sincronização com API externa
* [ ] Etapa 5: Compras, devoluções e histórico
* [ ] Etapa 6: Testes automatizados e Docker Compose final

---

## 💬 Observações

* O projeto já conta com autenticação via **JWT** e senhas criptografadas com **bcrypt**.
* Todas as variáveis de ambiente estão configuradas em `backend/prisma/.env`.
* O banco PostgreSQL roda dentro do container `infra-db-1`, **não é necessário** ter o Postgres instalado localmente.

---

## 🧠 Dica

Se quiser inspecionar o banco dentro do container:

```bash
docker exec -it infra-db-1 psql -U fortnite -d fortnite
\dt            # lista tabelas
SELECT * FROM "User";
```

---

🟢 **Etapa atual:** Etapa 2 finalizada — backend 100% funcional
🏗️ **Próximo passo:** iniciar Etapa 3 (frontend mock)
