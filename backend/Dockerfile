# Debian slim (glibc): better-sqlite3 descarga binario precompilado, sin compilar.
# (En node:20-alpine/musl no hay prebuilt y falla al no tener Python/compilador.)
FROM node:20-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads data

EXPOSE 3001
CMD ["node", "index.js"]
