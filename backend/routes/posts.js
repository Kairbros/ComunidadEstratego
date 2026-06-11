const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '../uploads/posts');
const MAX_MEDIA = 4;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|mkv|avi|m4v|3gp|ogv|mpe?g)$/i;

// ¿El archivo es un medio válido (por MIME o, si falta, por extensión)?
function isMedia(file) {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) return true;
  return IMAGE_EXT.test(file.originalname) || VIDEO_EXT.test(file.originalname);
}

function baseUrl() {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
}

function publicUrl(filename) {
  return `${baseUrl()}/uploads/posts/${filename}`;
}

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')   // quitar acentos
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-.]/g, '')
      .slice(0, 60) || 'archivo';
    // Prefijo único para evitar colisiones entre publicaciones
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB por archivo
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'media' && !isMedia(file)) {
      return cb(new Error('Los medios deben ser imagen o video'), false);
    }
    cb(null, true); // attachments: cualquier tipo
  },
});

const uploadFieldsRaw = upload.fields([
  { name: 'media', maxCount: MAX_MEDIA },
  { name: 'attachments', maxCount: 20 },
]);

// Envuelve la subida para responder errores de multer como JSON (no HTML 500).
function uploadFields(req, res, next) {
  uploadFieldsRaw(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Archivo demasiado grande (máx 200 MB)'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? `Máximo ${MAX_MEDIA} medios por publicación`
          : err.message || 'Error al subir archivos';
      return res.status(400).json({ error: msg });
    }
    next();
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mediaType(file) {
  if (file.mimetype.startsWith('video/')) return 'video';
  if (file.mimetype.startsWith('image/')) return 'image';
  return VIDEO_EXT.test(file.originalname) ? 'video' : 'image'; // MIME vacío → por extensión
}

// Devuelve una publicación con su galería y adjuntos anidados, o null.
function getFullPost(id) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!post) return null;
  post.media = db.prepare(
    'SELECT id, type, filename, url, position FROM post_media WHERE post_id = ? ORDER BY position, id'
  ).all(id);
  post.attachments = db.prepare(
    'SELECT id, filename, original_name, url, size, mimetype FROM post_attachments WHERE post_id = ? ORDER BY id'
  ).all(id);
  return post;
}

function unlinkQuiet(filename) {
  const p = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(p)) {
    try { fs.unlinkSync(p); } catch { /* ignore */ }
  }
}

// Borra del disco los archivos que multer ya subió (rollback en caso de error).
function cleanupUploaded(files) {
  if (!files) return;
  for (const list of Object.values(files)) {
    for (const f of list) {
      if (fs.existsSync(f.path)) {
        try { fs.unlinkSync(f.path); } catch { /* ignore */ }
      }
    }
  }
}

// Normaliza un campo que puede llegar como "1,2", ["1","2"] o undefined → [number].
function parseIdList(value) {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v) => Number(String(v).trim())).filter((n) => Number.isInteger(n) && n > 0);
}

// ─── GET /api/posts — público (lista) ────────────────────────────────────────
router.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC, id DESC').all();
  const mediaStmt = db.prepare(
    'SELECT id, type, filename, url, position FROM post_media WHERE post_id = ? ORDER BY position, id'
  );
  const attStmt = db.prepare(
    'SELECT id, filename, original_name, url, size, mimetype FROM post_attachments WHERE post_id = ? ORDER BY id'
  );
  for (const p of posts) {
    p.media = mediaStmt.all(p.id);
    p.attachments = attStmt.all(p.id);
  }
  res.json(posts);
});

// ─── GET /api/posts/:id — público (permalink) ────────────────────────────────
router.get('/:id', (req, res) => {
  const post = getFullPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });
  res.json(post);
});

// ─── POST /api/posts — protegido ─────────────────────────────────────────────
router.post('/', auth, uploadFields, (req, res) => {
  const media = req.files?.media || [];
  const attachments = req.files?.attachments || [];
  const title = (req.body.title || '').trim();
  const description = (req.body.description || '').trim();

  if (!description && !title && media.length === 0) {
    cleanupUploaded(req.files);
    return res.status(400).json({ error: 'La publicación necesita al menos texto o un medio' });
  }

  const tx = db.transaction(() => {
    const { lastInsertRowid: postId } = db
      .prepare('INSERT INTO posts (title, description) VALUES (?, ?)')
      .run(title, description);

    const insMedia = db.prepare(
      'INSERT INTO post_media (post_id, type, filename, url, position) VALUES (?, ?, ?, ?, ?)'
    );
    media.forEach((f, i) => {
      insMedia.run(postId, mediaType(f), f.filename, publicUrl(f.filename), i);
    });

    const insAtt = db.prepare(
      'INSERT INTO post_attachments (post_id, filename, original_name, url, size, mimetype) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const f of attachments) {
      insAtt.run(postId, f.filename, f.originalname, publicUrl(f.filename), f.size, f.mimetype);
    }
    return postId;
  });

  const postId = tx();
  res.status(201).json(getFullPost(postId));
});

// ─── PUT /api/posts/:id — protegido ──────────────────────────────────────────
router.put('/:id', auth, uploadFields, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    cleanupUploaded(req.files);
    return res.status(404).json({ error: 'Publicación no encontrada' });
  }

  const newMedia = req.files?.media || [];
  const newAttachments = req.files?.attachments || [];
  const removeMediaIds = parseIdList(req.body.removeMediaIds);
  const removeAttachmentIds = parseIdList(req.body.removeAttachmentIds);

  // Validar el límite de medios resultante (existentes - quitados + nuevos)
  const currentMediaCount = db
    .prepare('SELECT COUNT(*) AS c FROM post_media WHERE post_id = ?')
    .get(post.id).c;
  const removableCount = removeMediaIds.length
    ? db.prepare(
        `SELECT COUNT(*) AS c FROM post_media WHERE post_id = ? AND id IN (${removeMediaIds.map(() => '?').join(',')})`
      ).get(post.id, ...removeMediaIds).c
    : 0;
  const finalMediaCount = currentMediaCount - removableCount + newMedia.length;
  if (finalMediaCount > MAX_MEDIA) {
    cleanupUploaded(req.files);
    return res.status(400).json({ error: `Máximo ${MAX_MEDIA} medios por publicación` });
  }

  const title = req.body.title;
  const description = req.body.description;
  const filesToDelete = [];

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE posts SET
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        updated_at  = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title !== undefined ? title.trim() : null,
      description !== undefined ? description.trim() : null,
      post.id
    );

    // Quitar medios seleccionados
    for (const mid of removeMediaIds) {
      const row = db.prepare('SELECT filename FROM post_media WHERE id = ? AND post_id = ?').get(mid, post.id);
      if (row) {
        filesToDelete.push(row.filename);
        db.prepare('DELETE FROM post_media WHERE id = ?').run(mid);
      }
    }
    // Quitar adjuntos seleccionados
    for (const aid of removeAttachmentIds) {
      const row = db.prepare('SELECT filename FROM post_attachments WHERE id = ? AND post_id = ?').get(aid, post.id);
      if (row) {
        filesToDelete.push(row.filename);
        db.prepare('DELETE FROM post_attachments WHERE id = ?').run(aid);
      }
    }

    // Añadir medios nuevos al final de la galería
    const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM post_media WHERE post_id = ?').get(post.id).m;
    const insMedia = db.prepare(
      'INSERT INTO post_media (post_id, type, filename, url, position) VALUES (?, ?, ?, ?, ?)'
    );
    newMedia.forEach((f, i) => {
      insMedia.run(post.id, mediaType(f), f.filename, publicUrl(f.filename), maxPos + 1 + i);
    });

    // Añadir adjuntos nuevos
    const insAtt = db.prepare(
      'INSERT INTO post_attachments (post_id, filename, original_name, url, size, mimetype) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const f of newAttachments) {
      insAtt.run(post.id, f.filename, f.originalname, publicUrl(f.filename), f.size, f.mimetype);
    }
  });

  tx();
  // Borrar archivos físicos fuera de la transacción
  filesToDelete.forEach(unlinkQuiet);

  res.json(getFullPost(post.id));
});

// ─── DELETE /api/posts/:id — protegido ───────────────────────────────────────
router.delete('/:id', auth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

  const files = [
    ...db.prepare('SELECT filename FROM post_media WHERE post_id = ?').all(post.id),
    ...db.prepare('SELECT filename FROM post_attachments WHERE post_id = ?').all(post.id),
  ].map((r) => r.filename);

  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id); // cascada borra media/attachments
  files.forEach(unlinkQuiet);

  res.json({ success: true, id: Number(post.id) });
});

module.exports = router;
