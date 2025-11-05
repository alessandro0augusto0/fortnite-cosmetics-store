# Etapa 1: build da aplicação
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client dentro da imagem (no Linux)
RUN npx prisma generate

RUN npm run build


# Etapa 2: runtime (mais leve)
FROM node:20

WORKDIR /app

COPY --from=build /app ./

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/main.js"]
