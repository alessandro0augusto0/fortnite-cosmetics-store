# Fortnite Cosmetics Store

Projeto do desafio técnico — listagem e compra simulada de cosméticos do Fortnite.

## Visão geral
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + TypeScript + NestJS (proposta)
- Banco: PostgreSQL
- Container: Docker Compose

## Como começar (desenvolvimento)
1. Clonar repositório
2. Criar arquivos .env para backend e frontend (haverá exemplos)
3. Rodar com Docker Compose (etapas serão fornecidas posteriormente)

## Endpoints disponíveis

### Autenticação
**Base URL:** `http://localhost:4000`

#### POST /auth/register
Cria um novo usuário no banco.

**Body JSON:**
```json
{
    "email": "usuario@teste.com",
    "password": "123456"
}
```

Resposta 201:
```json
{
    "access_token": "jwt_gerado_aqui"
}
```

#### POST /auth/login
Realiza login com usuário existente.

**Body JSON:**
```json
{
    "email": "usuario@teste.com",
    "password": "123456"
}
```

Resposta 200:
```json
{
    "access_token": "jwt_gerado_aqui"
}
```

---

### 💾 Commit sugerido

Depois de atualizar o `README.md` e o `BACKLOG.md`, faça o commit com:

```bash
git add README.md BACKLOG.md
git commit -m "docs: finaliza Etapa 2 - backend inicial concluído (NestJS + Prisma + Auth)"
git push origin main
```


## Estrutura proposta
- backend/
- frontend/
- infra/
