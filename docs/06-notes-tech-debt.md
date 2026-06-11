# 06 — Observaciones y deuda técnica

Puntos a revisar **antes** de los cambios grandes. No son tareas obligatorias,
pero conviene tenerlos presentes para no romper nada ni dejar agujeros.

> **Estado 2026-06-10:** los puntos 1, 2 y 5 ya fueron resueltos (ver ✅).

## Seguridad

1. ✅ **RESUELTO — `.env` y db versionados en git.**
   Se sacaron del índice con `git rm --cached` (`.env`, `backend/.env`,
   `backend/estratego.db*`), se **rotó el `JWT_SECRET`** por uno nuevo aleatorio
   y se ampliaron las reglas de [.gitignore](../.gitignore).
   > ⚠️ **Pendiente manual:** el `JWT_SECRET` viejo sigue en el **historial de
   > git**. Sacarlo del índice no lo borra de commits anteriores. Como ya se
   > rotó el secreto, el viejo es inútil; si aun así se quiere limpiar el
   > historial, usar `git filter-repo` o BFG.

2. ✅ **RESUELTO — credenciales de admin hardcodeadas.**
   [backend/db.js](../backend/db.js) ahora lee `ADMIN_USERNAME` / `ADMIN_PASSWORD`
   del entorno y falla si no hay admin y falta la contraseña. Sigue siendo buena
   idea forzar cambio de contraseña tras el primer login (pendiente, opcional).

3. **No hay rate limiting** en `/api/auth/login` → vulnerable a fuerza bruta.
   (Pendiente — candidato para los cambios grandes.)

4. **CORS cae a `*`** si `FRONTEND_URL` no está definido. (Pendiente, menor.)

## Base de datos / persistencia

5. ✅ **RESUELTO — discrepancia de ubicación de la DB.**
   Los archivos obsoletos `backend/estratego.db*` de la raíz de `backend/` (de una
   versión anterior, sin usar por el código actual) fueron eliminados. La única
   ubicación viva es `backend/data/estratego.db`, que el código crea al arrancar.

6. **Persistencia en deploy.** `backend/uploads/` y `backend/data/` deben estar
   en **volúmenes persistentes** en EasyPanel, o se pierden PDFs y registros en
   cada redeploy. Verificar la config de volúmenes. (Pendiente — revisar en el
   panel, no es un cambio de código.)

## Recursos "legacy" vs nuevos

7. Los **12 recursos semilla** tienen `download_url` apuntando al **frontend**
   (`https://comunidad.estratego.us/<pdf>`, servidos desde `public/`).
   Los recursos **nuevos** apuntan al **backend** (`${BASE_URL}/uploads/<pdf>`).
   Conviven dos orígenes de archivos. Al editar un recurso legacy y subir un PDF
   nuevo, su `download_url` cambia al backend pero el PDF viejo en `public/` queda
   huérfano (no se borra, porque el `DELETE`/`PUT` solo busca en `uploads/`).

## Frontend

8. **Guard de admin débil:** `AdminRoute` solo mira si existe `admin_token` en
   `localStorage`, sin validar el token. Un token expirado deja ver el dashboard
   hasta que la primera llamada protegida devuelve 401 (que no se maneja con
   redirección automática al login).

9. **Inconsistencia de categorías:** la lista pública incluye `all`; el admin usa
   `CATEGORY_LABELS` sin `all`. Mantener sincronizadas si se añaden categorías.

10. **`<h1>` vacío** en el `Header` de [CommunityPage.jsx](../src/CommunityPage.jsx)
    (posible resto de diseño) — menor, pero afecta accesibilidad/SEO.

11. **Dos caminos de fetch:** lecturas usan `apiFetch`; las subidas usan `fetch`
    directo (necesario por el `FormData`/multipart). Si se centraliza la capa de
    API, contemplar ambos casos.

## Documentación

12. ✅ **RESUELTO** — el [README.md](../README.md) raíz era la plantilla por
    defecto de Vite; se reescribió para describir el proyecto real (stack,
    estructura, desarrollo local y variables de entorno).

## Sugerencias para los "cambios grandes"

- Definir primero el **alcance** (¿nuevas secciones "Tutoriales"/"Negocios" que
  ya aparecen como "SOON"? ¿migrar storage? ¿multiusuario?).
- Antes de tocar el esquema de la DB, decidir una **estrategia de migraciones**
  (ahora todo es `CREATE TABLE IF NOT EXISTS` + seed; no hay migraciones).
- Resolver primero los puntos 1, 5 y 6 (seguridad y persistencia) para no
  arrastrar problemas a la nueva versión.
