# 02 — Arquitectura

## Estructura de carpetas

```
ComunidadEstratego/
├── Dockerfile              # Imagen del FRONTEND (build Vite + nginx)
├── nginx.conf              # Config nginx para servir la SPA
├── vite.config.js          # React + Tailwind
├── index.html              # Punto de entrada Vite
├── package.json            # Dependencias frontend
├── .env / .env.example     # VITE_API_URL
│
├── public/                 # Assets estáticos + PDFs "legacy" (semilla)
│   ├── VersiónPrincipalDorada.svg   # Logo
│   └── *.pdf                          # 12 PDFs originales
│
├── src/                    # Código del frontend
│   ├── main.jsx            # Bootstrap React
│   ├── App.jsx             # Router (/, /admin, *)
│   ├── api.js              # apiFetch + API_URL
│   ├── icons.js            # Registro de iconos Lucide
│   ├── index.css           # Estilos / tema
│   ├── CommunityPage.jsx   # Página pública
│   └── admin/
│       ├── AdminLogin.jsx       # Login (JWT)
│       ├── AdminDashboard.jsx   # Lista + CRUD
│       └── AdminUploadForm.jsx  # Form crear/editar recurso
│
└── backend/                # Servidor Express (proyecto Node independiente)
    ├── Dockerfile          # Imagen del BACKEND
    ├── index.js            # App Express, CORS, rutas
    ├── db.js               # SQLite: schema + seed admin + seed recursos
    ├── package.json        # Dependencias backend
    ├── .env / .env.example # PORT, JWT_SECRET, BASE_URL, FRONTEND_URL
    ├── estratego.db*       # Archivos SQLite (¡versionados, ver notas!)
    ├── middleware/
    │   └── auth.js         # Verificación de JWT (Bearer)
    └── routes/
        ├── auth.js         # POST /api/auth/login
        └── resources.js    # CRUD /api/resources + uploads multer
```

> **Nota:** el frontend y el backend son **dos proyectos npm separados**, cada
> uno con su propio `package.json` y su propio `Dockerfile`. Se despliegan como
> dos contenedores independientes.

## Flujo de datos

```
┌─────────────┐    GET /api/resources      ┌──────────────┐
│  Navegador  │ ─────────────────────────► │   Express    │
│ (React SPA) │ ◄───────────────────────── │   backend    │
│             │      JSON [recursos]       │              │
│             │                            │   ┌────────┐ │
│             │    click → download_url    │   │ SQLite │ │
│             │ ─────────────────────────► │   └────────┘ │
└─────────────┘   GET /uploads/archivo.pdf └──────────────┘
                  (o /public/*.pdf legacy)        │
                                          ┌────────▼────────┐
        Admin: POST/PUT/DELETE (Bearer)   │ uploads/  (FS)  │
        + multipart PDF ────────────────► │  archivos PDF   │
                                          └─────────────────┘
```

## Rutas del frontend (React Router)

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `PostsFeed` (Publicaciones — pestaña principal) | Público |
| `/documentos` | `CommunityPage` (recursos/PDFs) | Público |
| `/post/:id` | `PostDetail` (permalink compartible) | Público |
| `/admin` | `AdminLogin` → `AdminDashboard` | Token en `localStorage` |
| `/publicaciones` | Redirige a `/` (compatibilidad) | — |
| `*` | Redirige a `/` | — |

El "guard" de admin es muy simple: `AdminRoute` en [App.jsx](../src/App.jsx)
solo comprueba si existe `admin_token` en `localStorage`. No valida el token
contra el backend en el arranque; la validación real ocurre cuando se llama a un
endpoint protegido (que devuelve 401 si el token expiró).

## Deploy (alto nivel)

- **EasyPanel** orquesta dos servicios Docker en una VPS.
- El **frontend** se construye con Vite y se sirve estático con **nginx**.
  `VITE_API_URL` se inyecta como *build arg* (se hornea en el bundle).
- El **backend** corre `node index.js` y expone el puerto `3001`.
- Detalle en [05-config-deploy.md](./05-config-deploy.md).
