# 08 — Lead gate + GoHighLevel

Antes de **cualquier descarga** (documentos/PDFs y adjuntos de publicaciones) se
pide al visitante **nombre, correo y número**. Esos datos se envían a
**GoHighLevel (GHL)** como contacto con el tag **`comunidad`**, y luego procede
la descarga.

## Flujo

```
Click "Descargar"
   │
   ├─ ¿ya hay lead guardado en localStorage?  ── sí ──► abre la descarga
   │
   └─ no ──► Modal (nombre/correo/número)
                │ submit
                ▼
        POST /api/leads  (nuestro backend)
                │
                ▼
        GHL upsert contacto + tag "comunidad"
                │ ok
                ▼
        guarda lead en localStorage  ──►  abre la descarga
```

El token de GHL es **secreto** y vive solo en el backend. El frontend nunca lo
ve: habla con `/api/leads`, y el backend reenvía a GHL.

> **Captura única:** una vez que el visitante deja sus datos, se guardan en
> `localStorage` (`community_lead`) y las siguientes descargas **no** vuelven a
> pedir el formulario. Si se quisiera pedir en **cada** descarga, basta con no
> leer/guardar ese `localStorage` en
> [LeadGateContext](../src/leadgate/LeadGateContext.jsx).

## Backend — [routes/leads.js](../backend/routes/leads.js)

`POST /api/leads` (público). Body JSON: `{ name, email, phone }`.

- Valida nombre, correo (regex) y número.
- Hace **dos llamadas** a GHL (headers: `Authorization: Bearer <GHL_API_TOKEN>`,
  `Version: <GHL_API_VERSION>`):
  1. `POST /contacts/upsert` con `locationId`, `name`, `firstName`/`lastName`
     (se parte el nombre), `email`, `phone`, `source`. **Sin `tags`** — el upsert
     con `tags` *reemplaza* los tags existentes del contacto, así que no se mandan ahí.
  2. `POST /contacts/{contactId}/tags` con `{ tags: [GHL_TAG] }` → **agrega** el tag
     de forma aditiva, sin borrar los tags que el contacto ya tuviera.
- **upsert** evita duplicados (deduplica por email/teléfono dentro de la location).
- Si el paso 2 (tag) falla, se registra un warning pero la descarga procede igual
  (el contacto ya quedó creado/actualizado).
- Respuestas: `200 {success, contactId}` · `400` (validación) · `500` (sin
  configurar) · `502` (GHL falló — se registra el detalle en el log del servidor).

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `GHL_API_TOKEN` | Token de integración privada (empieza con `pit-`). **Secreto.** |
| `GHL_LOCATION_ID` | ID de la location/subcuenta de GHL. |
| `GHL_API_VERSION` | Versión de la API (`2021-07-28`). |
| `GHL_TAG` | Tag a aplicar al contacto (`comunidad`). |

## Frontend — [src/leadgate/](../src/leadgate/)

- [LeadGateContext.jsx](../src/leadgate/LeadGateContext.jsx): provider + hook
  `useLeadGate()` que expone `requestDownload(url)`. Decide si abrir el modal o
  descargar directo, y dispara la descarga tras capturar el lead.
- [LeadGateModal.jsx](../src/leadgate/LeadGateModal.jsx): formulario
  nombre/correo/número → `POST /api/leads`.
- El provider envuelve toda la app en [App.jsx](../src/App.jsx).

### Puntos de descarga enganchados
- **Documentos:** `ResourceCard` en [CommunityPage.jsx](../src/CommunityPage.jsx)
  (antes era un `<a>`, ahora un botón que llama `requestDownload`).
- **Adjuntos de publicaciones:** [AttachmentList.jsx](../src/posts/AttachmentList.jsx).
- Los **medios** de una publicación (fotos/videos que se ven inline) **no** están
  gateados; solo las descargas de archivos.

## Verificación

- La validación local del endpoint (`400` por datos inválidos) está probada.
- ⚠️ **La llamada real a GHL no se pudo probar desde el entorno de desarrollo de
  Claude (sin salida a internet).** Debe verificarse en tu máquina/servidor con
  internet: hacer una descarga, completar el formulario y confirmar que el
  contacto aparece en GHL con el tag `comunidad`.

## Teléfono — selector de país + E.164
El modal incluye un **selector de país** ([countries.js](../src/leadgate/countries.js))
y un campo que **solo acepta dígitos**, limitado a la longitud del país elegido.
Al enviar se arma el número en **formato internacional E.164**: `+<código país><número>`
(ej. `+573158096273`). El backend revalida con `PHONE_RE = /^\+\d{8,15}$/` antes de
mandarlo a GHL. Para agregar/ajustar países, editar `countries.js` (dial + min/max
de dígitos).

## Notas / mejoras futuras
- Considerar rate limiting en `/api/leads` para evitar spam de contactos.
- Si GHL falla, hoy se bloquea la descarga (se prioriza capturar el lead). Si se
  prefiere no bloquear nunca, cambiar el manejo de error en `leads.js`.
