# Board Point — front-end (SPA React/Vite).
# Estágio 1: compila o projeto (Node só existe durante o build, não vai pra imagem final).
FROM node:22-alpine AS build
WORKDIR /app

# Copia só os manifestos primeiro: o Docker reaproveita essa camada enquanto
# package*.json não mudar, mesmo que o código em src/ mude toda hora.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Estágio 2: imagem final só com o resultado do build + Nginx para servir os arquivos.
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
