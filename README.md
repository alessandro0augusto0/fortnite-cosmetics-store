# 🎮 Fortnite Cosmetics Store

Aplicação completa (frontend + backend) que consome a **API pública do Fortnite** para exibir, filtrar e simular a compra de cosméticos com créditos virtuais (V-Bucks).
Desenvolvido como parte de um **desafio técnico**, com foco em boas práticas, arquitetura limpa e documentação completa.

---

## ⚙️ Visão Geral

* **Frontend:** React + TypeScript (Vite)
* **Backend:** NestJS + Prisma ORM + PostgreSQL
* **Estilo:** TailwindCSS
* **Autenticação:** JWT + bcrypt
* **Containerização:** Docker Compose
* **Integração:** API externa [Fortnite API](https://fortnite-api.com/v2/cosmetics)

---

## 🚀 Tecnologias Utilizadas

### **Frontend**

* React (Vite + TypeScript)
* Tailwind CSS
* Axios (integração com API)
* ESLint e PostCSS configurados

### **Backend**

* NestJS
* Prisma ORM
* PostgreSQL
* JWT (autenticação)
* Docker e Docker Compose

---

## 💻 Como Rodar o Projeto (Ambiente de Desenvolvimento)

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/alessandro0augusto0/fortnite-cosmetics-store.git
cd fortnite-cosmetics-store
```

### 2️⃣ Subir os containers

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

Isso iniciará:

* **Backend:** `http://localhost:4000`
* **Banco PostgreSQL:** `localhost:5432` (usuário, senha e banco: `fortnite`)

### 3️⃣ Ver logs (opcional)

```bash
docker logs -f infra-backend-1
```

### 4️⃣ Acessar o container do backend (opcional)

```bash
docker exec -it infra-backend-1 bash
```

### 5️⃣ Rodar migrations ou gerar o Prisma Client manualmente (caso necessário)

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6️⃣ Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## 🧩 Estrutura de Pastas

```
fortnite-cosmetics-store/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── cosmetics/
│   │   ├── prisma/
│   │   └── app.module.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/images/
│   ├── src/
│   │   ├── data/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
│
└── infra/
    └── docker-compose.yml
```

---

## 🔌 Endpoints Disponíveis

### Base URL

```
http://localhost:4000
```

### **POST /auth/register**

Cria um novo usuário no banco.

**Request Body**

```json
{
  "email": "usuario@teste.com",
  "password": "123456"
}
```

**Response 201**

```json
{
  "access_token": "jwt_gerado_aqui"
}
```

---

### **POST /auth/login**

Realiza login com usuário existente.

**Request Body**

```json
{
  "email": "usuario@teste.com",
  "password": "123456"
}
```

**Response 200**

```json
{
  "access_token": "jwt_gerado_aqui"
}
```

---

### **GET /cosmetics**

Lista todos os cosméticos (dados da API Fortnite).

### **GET /cosmetics/new**

Lista cosméticos novos.

### **GET /cosmetics/shop**

Lista cosméticos atualmente à venda.

---

## 🧭 Como Testar o Sistema (Para Avaliadores)

1. **Registrar um novo usuário:**

   * `POST http://localhost:4000/auth/register`
   * Body:

     ```json
     { "email": "usuario@teste.com", "password": "123456" }
     ```

2. **Logar com o usuário criado:**

   * `POST http://localhost:4000/auth/login`

3. **Listar cosméticos:**

   * `GET http://localhost:4000/cosmetics`

4. **Explorar o frontend:**

   * `http://localhost:5173`

5. **Banco de dados (opcional):**

   ```bash
   docker exec -it infra-db-1 psql -U fortnite -d fortnite
   \dt
   SELECT * FROM "User";
   ```

---

## 🧠 Decisões Técnicas Relevantes

* **NestJS** adotado pela arquitetura modular e integração limpa com Prisma.
* **Prisma ORM** garante consistência e tipagem forte no acesso ao banco.
* **Docker Compose** padroniza todo o ambiente de desenvolvimento.
* **TailwindCSS** usado para prototipagem e responsividade rápida.
* **Axios** para consumo direto da API pública do Fortnite.
* **Commits semânticos** e versionamento limpo (semver).

---

## 🧪 Testes Automatizados (Planejados)

* Configuração inicial com **Jest**.
* Mocks da API externa com `msw` no frontend.

---

## 👤 Autor

**Alessandro Augusto**
Estudante de Engenharia de Computação 💻
Desenvolvido como parte do desafio técnico **Fortnite Cosmetics Store**.
