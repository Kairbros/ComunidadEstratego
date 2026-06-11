# Comunidad Estratego

Repositorio web de recursos descargables (PDFs) para la **Comunidad Estrategas**
(`@luisposada_ai`). Una página pública para navegar/buscar/descargar guías y un
panel de administración protegido para gestionarlas.

## Stack

- **Frontend:** React 19 + Vite 7 + Tailwind 4 + React Router 7
- **Backend:** Node.js + Express 4 + SQLite (`better-sqlite3`) + JWT + multer
- **Deploy:** Docker (dos imágenes) + nginx, orquestado con EasyPanel

> El frontend (raíz) y el backend (`backend/`) son **dos proyectos npm
> independientes**, cada uno con su `package.json` y su `Dockerfile`.

## Estructura

```
.            → frontend (React + Vite)
backend/     → API REST (Express + SQLite)
docs/        → documentación técnica del proyecto
public/      → assets + PDFs "legacy"
```

## Desarrollo local

**Backend:**
```bash
cd backend
cp .env.example .env   # y completa los valores (ver abajo)
npm install
npm run dev            # http://localhost:3001
```

**Frontend** (en otra terminal, desde la raíz):
```bash
cp .env.example .env   # opcional; por defecto apunta a http://localhost:3001
npm install
npm run dev            # http://localhost:5173
```

## Variables de entorno

- **Frontend** (`.env`): `VITE_API_URL`
- **Backend** (`backend/.env`): `PORT`, `JWT_SECRET`, `BASE_URL`, `FRONTEND_URL`,
  `ADMIN_USERNAME`, `ADMIN_PASSWORD`

`JWT_SECRET` y `ADMIN_PASSWORD` no tienen valor por defecto: el backend no
arranca sin `JWT_SECRET`, y crea el admin inicial con esas credenciales solo la
primera vez (cuando la base de datos está vacía).

Genera un secreto con:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Documentación

Ver la carpeta [`docs/`](docs/) para arquitectura, API, frontend, deploy y notas
de deuda técnica.
