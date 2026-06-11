# 05 — Configuración y deploy

## Variables de entorno

### Frontend (`.env` en la raíz)

| Variable | Ejemplo | Uso |
|----------|---------|-----|
| `VITE_API_URL` | `https://api.comunidad.estratego.us` | URL base del backend. Se hornea en el bundle en build-time. |

### Backend (`backend/.env`)

| Variable | Ejemplo | Uso |
|----------|---------|-----|
| `PORT` | `3001` | Puerto del servidor Express. |
| `JWT_SECRET` | (cadena larga) | Firma de los JWT. **Debe ser secreta.** |
| `BASE_URL` | `https://api.comunidad.estratego.us` | Prefijo de `download_url` de los PDFs subidos. |
| `FRONTEND_URL` | `https://comunidad.estratego.us` | Origen permitido por CORS. |

> ⚠️ El `.env` real del backend está versionado en git e incluye un `JWT_SECRET`.
> Ver [06-notes-tech-debt.md](./06-notes-tech-debt.md).

## Desarrollo local

**Backend:**
```bash
cd backend
npm install
npm run dev      # nodemon index.js  → http://localhost:3001
```
Al primer arranque crea `data/estratego.db`, el admin y los 12 recursos semilla.

**Frontend:**
```bash
npm install
npm run dev      # vite → http://localhost:5173 (por defecto)
```
Sin `VITE_API_URL`, `api.js` cae a `http://localhost:3001`.

Otros scripts frontend: `npm run build`, `npm run preview`, `npm run lint`.

## Docker

Hay **dos imágenes independientes**:

### Frontend — [Dockerfile](../Dockerfile)

1. Etapa `builder` (`node:20-alpine`): `npm ci`, recibe `VITE_API_URL` como
   `ARG`, `npm run build`.
2. Etapa final (`nginx:alpine`): copia `dist/` y [nginx.conf](../nginx.conf).
   Expone el puerto `80`.

[nginx.conf](../nginx.conf) hace `try_files … /index.html` (necesario para que
React Router maneje rutas como `/admin`) y cachea assets estáticos 1 año.

### Backend — [backend/Dockerfile](../backend/Dockerfile)

`node:20-alpine`, `npm ci --only=production`, crea `uploads/`, expone `3001`,
arranca con `node index.js`.

## Orquestación

- Desplegado con **EasyPanel** en una VPS (dos servicios Docker).
- El frontend necesita que `VITE_API_URL` se pase como build arg en EasyPanel.
- **Persistencia:** `backend/uploads/` (PDFs) y la base SQLite (`backend/data/`)
  deben ir en **volúmenes persistentes**, o se pierden en cada redeploy. Verificar
  esto antes de cambios grandes (ver notas).
