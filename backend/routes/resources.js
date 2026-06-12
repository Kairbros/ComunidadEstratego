const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-.]/g, '');
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    let finalName = base + ext;
    let counter = 1;
    while (fs.existsSync(path.join(uploadDir, finalName))) {
      finalName = `${base}_${counter}${ext}`;
      counter++;
    }
    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ─── GET /api/resources — público ────────────────────────────────────────────
router.get('/', (req, res) => {
  const resources = db.prepare(`
    SELECT
      id,
      title,
      description,
      category,
      badge AS palabra_clave,
      icon,
      filename,
      download_url
    FROM resources
    ORDER BY created_at DESC
  `).all();

  // Comunidad link y palabra clave
  const communityKw = (process.env.COMUNIDAD_PALABRA_CLAVE || 'comunidad').toLowerCase().trim();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (communityKw) {
    resources.push({
      id: null,
      title: 'Comunidad Estratego',
      description: 'Enlace a la comunidad principal',
      category: 'community',
      palabra_clave: communityKw,
      icon: 'Users',
      filename: '',
      download_url: frontendUrl,
    });
  }

  // Publicaciones con palabra clave
  const posts = db.prepare(`
    SELECT id, title, description, badge AS palabra_clave
    FROM posts
    WHERE badge != ''
    ORDER BY created_at DESC
  `).all();

  for (const p of posts) {
    resources.push({
      id: p.id,
      title: p.title || p.description?.slice(0, 80) || `Publicación #${p.id}`,
      description: p.description || '',
      category: 'post',
      palabra_clave: p.palabra_clave,
      icon: 'Newspaper',
      filename: '',
      download_url: `${frontendUrl}/post/${p.id}`,
    });
  }

  res.json(resources);
});

// ─── POST /api/resources — protegido ─────────────────────────────────────────
router.post('/', auth, upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo PDF requerido' });
  }

  const { title, description, category, badge, icon } = req.body;

  if (!title || !category || !badge || !icon) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Faltan campos requeridos: title, category, badge, icon' });
  }

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  const download_url = `${baseUrl}/uploads/${req.file.filename}`;

  const result = db.prepare(`
    INSERT INTO resources (title, description, category, badge, badge_style, icon, filename, download_url)
    VALUES (?, ?, ?, ?, 'gold', ?, ?, ?)
  `).run(
    title.trim(),
    description?.trim() || '',
    category,
    badge.toLowerCase().trim(),
    icon,
    req.file.filename,
    download_url
  );

  res.status(201).json(db.prepare('SELECT * FROM resources WHERE id = ?').get(result.lastInsertRowid));
});

// ─── PUT /api/resources/:id — protegido ──────────────────────────────────────
router.put('/:id', auth, upload.single('pdf'), (req, res) => {
  const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Recurso no encontrado' });

  const { title, description, category, badge, icon } = req.body;
  let { filename, download_url } = existing;

  if (req.file) {
    // Eliminar archivo anterior si es local (no legacy URL)
    const oldPath = path.join(__dirname, '../uploads', existing.filename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    filename = req.file.filename;
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    download_url = `${baseUrl}/uploads/${filename}`;
  }

  db.prepare(`
    UPDATE resources SET
      title        = COALESCE(?, title),
      description  = COALESCE(?, description),
      category     = COALESCE(?, category),
      badge        = COALESCE(?, badge),
      icon         = COALESCE(?, icon),
      filename     = ?,
      download_url = ?,
      updated_at   = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title?.trim()            ?? null,
    description?.trim()      ?? null,
    category                 ?? null,
    badge ? badge.toLowerCase().trim() : null,
    icon                     ?? null,
    filename,
    download_url,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id));
});

// ─── DELETE /api/resources/:id — protegido ───────────────────────────────────
router.delete('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Recurso no encontrado' });

  const filePath = path.join(__dirname, '../uploads', existing.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
  res.json({ success: true, id: Number(req.params.id) });
});

module.exports = router;
