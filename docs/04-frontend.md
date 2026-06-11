# 04 — Frontend

SPA en **React 19** + **Vite 7** + **Tailwind 4** + **React Router 7**.
Entrada: [src/main.jsx](../src/main.jsx) → [src/App.jsx](../src/App.jsx).

## Capa de API — [src/api.js](../src/api.js)

- `API_URL` = `import.meta.env.VITE_API_URL` o `http://localhost:3001`.
- `apiFetch(path, options)`: wrapper de `fetch` que:
  - Adjunta `Authorization: Bearer <token>` desde `localStorage.admin_token`.
  - Lanza `Error` con el mensaje del servidor si la respuesta no es 2xx.
  - Devuelve el JSON parseado.
- **Excepción:** las subidas de archivos (POST/PUT con `FormData`) NO usan
  `apiFetch`; usan `fetch` directo en [AdminUploadForm.jsx](../src/admin/AdminUploadForm.jsx)
  porque hay que dejar que el navegador ponga el `Content-Type` multipart.

## Iconos — [src/icons.js](../src/icons.js)

- Registro fijo de ~27 iconos de `lucide-react` en el objeto `ICONS`.
- `getIcon(name)` devuelve el componente o `FileText` como fallback.
- `ICON_OPTIONS` alimenta el `<select>` del formulario admin.

## Página pública — [src/CommunityPage.jsx](../src/CommunityPage.jsx)

Vista principal en `/`. Estructura:

- **`Particles`**: fondo decorativo (35 partículas animadas, memoizadas).
- **Navbar**: logo + botones "Documentos" (activo), "Tutoriales" y "Negocios"
  (deshabilitados, badge "SOON").
- **`Header`**: texto de bienvenida ("Bienvenido al 1%"…). El `<h1>` está vacío.
- **`SearchBar`**: filtra por `title` + `description`.
- **`CategoryTabs`**: filtra por categoría (`all`, `guides`, `automations`,
  `videos`, `tools`).
- **`ResourceCard`**: tarjeta con icono, badge (`palabra_clave`), título,
  descripción y enlace de descarga (`download_url`, abre en pestaña nueva).
- Carga los recursos con `fetch(${API_URL}/api/resources)` en un `useEffect`.
- El filtrado (`filteredResources`) ocurre en el cliente.

> Detalle: las categorías declaradas en `CommunityPage` incluyen `all`; los íconos
> de tab son fijos (no usan `icon` del recurso).

## Panel admin

### `/admin` flujo — [src/App.jsx](../src/App.jsx)

`AdminRoute` muestra `AdminLogin` si no hay `admin_token` en `localStorage`;
de lo contrario muestra `AdminDashboard`. El estado se mantiene en React
(`useState`), por lo que login/logout cambian la vista sin recargar.

### `AdminLogin` — [src/admin/AdminLogin.jsx](../src/admin/AdminLogin.jsx)

- Form usuario/contraseña → `POST /api/auth/login`.
- Guarda `admin_token` y `admin_username` en `localStorage`, luego `onLogin()`.

### `AdminDashboard` — [src/admin/AdminDashboard.jsx](../src/admin/AdminDashboard.jsx)

- Dos vistas internas: `'list'` (tabla) y `'form'` (crear/editar).
- Carga recursos con `apiFetch('/api/resources')`.
- Tabla con: icono, título+descripción, categoría, badge/keyword, acciones
  (editar / eliminar).
- **Eliminar**: modal de confirmación → `DELETE /api/resources/:id`; actualiza la
  lista en local quitando el recurso.
- **Logout**: limpia `localStorage` y vuelve al login.
- Etiquetas de categoría en `CATEGORY_LABELS` (sin `all`, a diferencia de la
  página pública).

### `AdminUploadForm` — [src/admin/AdminUploadForm.jsx](../src/admin/AdminUploadForm.jsx)

- Sirve para crear (`resource == null`) y editar (`resource` presente).
- Campos: título*, descripción, categoría*, badge/keyword*, icono* (con preview),
  PDF (obligatorio al crear; opcional al editar).
- Envía `FormData` con `fetch` directo (PUT o POST según `isEditing`).
- `badge_style` es informativo y siempre `gold`.

## Estilo / tema

- Fondo `#0a0a0a`, dorado `#d4af37`, tipografía `font-mono`.
- Estilos globales y animaciones (partículas, `glow-text`, `badge`, `link-card`,
  `scrollbar-thin`) en [src/index.css](../src/index.css).
