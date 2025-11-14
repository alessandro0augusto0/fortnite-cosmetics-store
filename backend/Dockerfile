# Etapa 1: build
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Copia o JSON para dist/data após o build (garantido)
RUN mkdir -p dist/data && cp src/data/sample-cosmetics.json dist/data/sample-cosmetics.json


# Etapa 2: runtime
FROM node:20 AS production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
# ✅ Copia o arquivo diretamente da etapa build
COPY --from=build /app/dist/data/sample-cosmetics.json ./dist/data/sample-cosmetics.json

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000
CMD ["node", "dist/main.js"]
