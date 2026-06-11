# 01 — Visión general

## Qué es

**Comunidad Estratego** es una pequeña aplicación web que funciona como un
**repositorio de recursos descargables** (PDFs) para una comunidad ("Comunidad
Estrategas", marca `@luisposada_ai`). Los visitantes navegan, buscan y descargan
guías; un administrador sube y gestiona esos recursos desde un panel protegido.

La estética es oscura con acentos dorados (`#d4af37`) y tipografía monospace.

## Piezas principales

| Pieza | Tecnología | Rol |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite 7 + Tailwind 4 + React Router 7 | SPA pública + panel admin |
| **Backend** | Node.js + Express 4 | API REST de recursos y autenticación |
| **Base de datos** | SQLite (`better-sqlite3`) | Persistencia de recursos y admins |
| **Almacenamiento de archivos** | Disco local (`backend/uploads/`) vía `multer` | PDFs subidos |
| **Deploy** | Docker (2 imágenes) + nginx + EasyPanel | Hosting en VPS |

## Flujo en una frase

El visitante entra a `comunidad.estratego.us` → el frontend pide
`GET /api/resources` al backend (`api.comunidad.estratego.us`) → renderiza las
tarjetas → al hacer clic, descarga el PDF desde su `download_url`.

El admin entra a `/admin` → inicia sesión (JWT) → puede crear / editar / borrar
recursos, lo que sube el PDF al backend y actualiza la base de datos.

## Dominios (producción)

- Frontend: `https://comunidad.estratego.us`
- Backend / API: `https://api.comunidad.estratego.us`
- Los recursos "semilla" (legacy) apuntan a PDFs servidos desde el frontend
  (`/public/*.pdf`); los recursos nuevos se sirven desde el backend (`/uploads/*`).

## Integración externa: n8n

El campo `badge` (también expuesto como `palabra_clave`) se guarda en minúsculas
y está pensado como **keyword para un flujo de n8n** — probablemente un bot que
responde con el recurso correcto según una palabra clave. Tenerlo en cuenta: el
valor de `badge` no es solo decorativo, tiene significado funcional externo.
