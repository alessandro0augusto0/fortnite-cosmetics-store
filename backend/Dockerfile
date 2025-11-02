# Etapa de build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de execução
FROM node:20
WORKDIR /app
COPY --from=build /app ./
EXPOSE 4000
CMD ["npm", "run", "start:dev"]
