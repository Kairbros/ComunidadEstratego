# 03 — Backend (API)

Servidor **Express 4** en [backend/index.js](../backend/index.js). Puerto por
defecto `3001`. CORS configurado con `FRONTEND_URL` (o `*` como fallback).

## Endpoints

### Autenticación — [routes/auth.js](../backend/routes/auth.js)

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| `POST` | `/api/auth/login` | `{ username, password }` | `{ token, username }` |

- Compara la contraseña con `bcrypt` contra la tabla `admins`.
- Genera un **JWT** firmado con `JWT_SECRET`, expira en **8h**.
- Errores: `400` (faltan campos), `401` (credenciales incorrectas).

### Recursos — [routes/resources.js](../backend/routes/resources.js)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/resources` | Público | Lista todos los recursos (orden: `created_at DESC`) |
| `POST` | `/api/resources` | **Bearer** | Crea recurso + sube PDF (campo `pdf`) |
| `PUT` | `/api/resources/:id` | **Bearer** | Edita recurso; reemplaza PDF si se envía uno nuevo |
| `DELETE` | `/api/resources/:id` | **Bearer** | Borra recurso + su PDF del disco |

- `GET` renombra la columna `badge` a **`palabra_clave`** en el JSON de salida.
- En `POST` son obligatorios: `title`, `category`, `badge`, `icon` + archivo PDF.
- En `PUT` se usa `COALESCE` para actualizaciones parciales; el campo nuevo se
  aplica solo si llega.
- `badge` siempre se guarda en **minúsculas** (`.toLowerCase().trim()`).

### Otros

- `GET /health` → `{ status: 'ok' }` (healthcheck).
- `GET /uploads/<archivo>` → sirve los PDFs subidos (estático).

## Subida de archivos (multer)

Configurado en [routes/resources.js](../backend/routes/resources.js):

- Destino: `backend/uploads/` (se crea si no existe).
- **Solo PDF** (`fileFilter` valida `mimetype === 'application/pdf'`).
- Límite: **50 MB** por archivo.
- Nombre de archivo: se normaliza (quita acentos, espacios → `_`, elimina
  caracteres no `[a-zA-Z0-9_\-.]`). Si ya existe, agrega sufijo `_1`, `_2`, …
- `download_url` = `${BASE_URL}/uploads/<filename>`.

## Base de datos — [backend/db.js](../backend/db.js)

**SQLite** vía `better-sqlite3` (síncrono). Archivo en `backend/data/estratego.db`
con `journal_mode = WAL` y `foreign_keys = ON`.

> ⚠️ Hay archivos `backend/estratego.db*` en la raíz de `backend/` **y** el código
> escribe en `backend/data/estratego.db`. Ver [06-notes-tech-debt.md](./06-notes-tech-debt.md).

### Tabla `resources`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | INTEGER PK AUTOINCREMENT | |
| `title` | TEXT NOT NULL | |
| `description` | TEXT | default `''` |
| `category` | TEXT NOT NULL | `guides` / `automations` / `videos` / `tools` |
| `badge` | TEXT NOT NULL | keyword (minúsculas); expuesto como `palabra_clave` |
| `badge_style` | TEXT | siempre `'gold'` (fijo) |
| `icon` | TEXT NOT NULL | nombre de icono Lucide (default `FileText`) |
| `filename` | TEXT NOT NULL | |
| `download_url` | TEXT NOT NULL | |
| `created_at` / `updated_at` | DATETIME | default `CURRENT_TIMESTAMP` |

### Tabla `admins`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | INTEGER PK | |
| `username` | TEXT UNIQUE NOT NULL | |
| `password_hash` | TEXT NOT NULL | bcrypt, 12 rounds |
| `created_at` | DATETIME | |

### Seeds (al primer arranque)

- **Admin**: usuario `EstrategoAdmin`, contraseña `Estrategia2025$`
  (hardcodeada en el código — ver notas de seguridad).
- **12 recursos** iniciales, con `download_url` apuntando a
  `https://comunidad.estratego.us/<pdf>` (es decir, sirven los PDFs de `public/`,
  no de `uploads/`). Estos son los recursos "legacy".

## Autenticación (middleware) — [middleware/auth.js](../backend/middleware/auth.js)

- Espera header `Authorization: Bearer <token>`.
- Verifica el JWT con `JWT_SECRET`; si es válido pone `req.admin` y continúa.
- Si falta o es inválido/expirado → `401`.
