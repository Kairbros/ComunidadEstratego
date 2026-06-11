# ── Etapa build: compila better-sqlite3 desde el código ───────────────────────
# better-sqlite3 no trae prebuilt para Node 20/Linux, así que se compila con
# node-gyp (requiere python3 + make + g++).
FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# ── Etapa final: imagen liviana, solo con el node_modules ya compilado ─────────
FROM node:20-slim
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads data

EXPOSE 3001
CMD ["node", "index.js"]
