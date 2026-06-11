# 07 — Publicaciones (Posts)

Funcionalidad nueva: publicaciones tipo feed social, **gestionadas solo por el
admin**, con galería de medios y archivos adjuntos descargables. Conviven con el
sistema de recursos/PDFs existente (no lo reemplazan).

## Modelo

Una **publicación** tiene:
- `title` (opcional) y `description` (texto, admite saltos de línea).
- **Galería**: hasta **4 medios** (imágenes o videos), ordenados (`position`).
- **Adjuntos**: 0..N archivos de cualquier tipo (zip, pdf, etc.), descargables.
- Enlace permanente compartible: `/post/:id`.

### Tablas (SQLite) — [backend/db.js](../backend/db.js)

| Tabla | Campos clave |
|-------|--------------|
| `posts` | `id`, `title`, `description`, `created_at`, `updated_at` |
| `post_media` | `id`, `post_id` (FK, ON DELETE CASCADE), `type` (`image`/`video`), `filename`, `url`, `position` |
| `post_attachments` | `id`, `post_id` (FK, CASCADE), `filename`, `original_name`, `url`, `size`, `mimetype` |

Borrar un post elimina en cascada sus filas de media/adjuntos; los archivos
físicos se borran del disco en el handler de la ruta.

## API — [backend/routes/posts.js](../backend/routes/posts.js)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/posts` | Público | Lista posts (con `media` y `attachments` anidados), orden `created_at DESC` |
| `GET` | `/api/posts/:id` | Público | Un post (permalink) |
| `POST` | `/api/posts` | **Bearer** | Crea post. Multipart: `title`, `description`, `media` (≤4), `attachments` (≤20) |
| `PUT` | `/api/posts/:id` | **Bearer** | Edita. Acepta nuevos `media`/`attachments` + `removeMediaIds`/`removeAttachmentIds` (lista separada por comas) |
| `DELETE` | `/api/posts/:id` | **Bearer** | Borra post + archivos |

### Subida (multer)
- Campo `media`: solo `image/*` o `video/*`, máximo 4.
- Campo `attachments`: cualquier tipo.
- Límite **200 MB** por archivo.
- Almacenamiento: `backend/uploads/posts/` (servido en `/uploads/posts/...`).
- Nombre en disco: `<timestamp>-<rand>_<nombre-normalizado><ext>` (evita colisiones).
- Los errores de multer (tamaño, tipo, exceso) se devuelven como **JSON 400**.

### Validaciones
- Un post necesita al menos texto (título o descripción) **o** un medio.
- El total de medios tras una edición no puede superar 4 (se valida considerando
  existentes − quitados + nuevos).

## Frontend

### Rutas — [src/App.jsx](../src/App.jsx)
- `/` → feed de publicaciones, **pestaña principal** ([PostsFeed](../src/posts/PostsFeed.jsx)).
- `/documentos` → recursos/PDFs ([CommunityPage](../src/CommunityPage.jsx)).
- `/post/:id` → permalink ([PostDetail](../src/posts/PostDetail.jsx)).
- `/publicaciones` → redirige a `/` (compatibilidad con el enlace anterior).

### Componentes públicos ([src/posts/](../src/posts/))
- `PostsFeed` — lista de publicaciones.
- `PostCard` — tarjeta en el feed (cabecera, texto, galería, contador de adjuntos, compartir).
- `PostDetail` — página individual con galería, adjuntos descargables y botón compartir.
- `PostMediaGallery` — grilla 1/2/3/4 estilo redes; imágenes con lightbox, videos con controles.
- `AttachmentList` — lista de adjuntos con icono por tipo y tamaño.
- `ShareButton` — usa la Web Share API; si no está, copia el enlace al portapapeles.
- `postUtils.js` — `formatBytes`, `attachmentIcon`, `timeAgo`.

### Navegación
- [src/components/SiteNav.jsx](../src/components/SiteNav.jsx): navbar compartido
  (Documentos / Publicaciones) usado en la home y en el feed.

### Admin ([src/admin/](../src/admin/))
- [AdminDashboard](../src/admin/AdminDashboard.jsx) ahora tiene pestañas
  **Recursos** / **Publicaciones**.
- [AdminPosts](../src/admin/AdminPosts.jsx) — lista de posts con ver/editar/borrar.
- [AdminPostForm](../src/admin/AdminPostForm.jsx) — crear/editar: texto, subir
  hasta 4 medios (con preview y quitar), adjuntos, y al editar marca cuáles
  medios/adjuntos existentes eliminar.
- Las subidas usan `apiUpload` ([src/api.js](../src/api.js)), que envía
  `FormData` con el token sin fijar `Content-Type`.

## Pendientes / ideas a futuro
- Reordenar medios en la galería (hoy se añaden al final).
- Paginación del feed cuando haya muchos posts.
- Open Graph / meta tags por post para mejores previews al compartir (hoy solo se
  ajusta `document.title`; al ser SPA, el scraping de OG no funciona sin SSR/prerender).
