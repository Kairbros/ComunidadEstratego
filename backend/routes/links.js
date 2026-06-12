const router = require('express').Router();
const db = require('../db');

function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function communityKeyword() {
  return (process.env.COMUNIDAD_PALABRA_CLAVE || 'comunidad').toLowerCase().trim();
}

function buildLinks() {
  const links = [];

  const communityKw = communityKeyword();
  if (communityKw) {
    links.push({
      palabra_clave: communityKw,
      tipo: 'comunidad',
      titulo: 'Comunidad Estratego',
      enlace: frontendUrl(),
    });
  }

  const resources = db.prepare(`
    SELECT title, badge AS palabra_clave, download_url AS enlace
    FROM resources
    WHERE badge != ''
    ORDER BY created_at DESC
  `).all();

  for (const r of resources) {
    links.push({
      palabra_clave: r.palabra_clave,
      tipo: 'recurso',
      titulo: r.title,
      enlace: r.enlace,
    });
  }

  const posts = db.prepare(`
    SELECT id, title, description, badge AS palabra_clave
    FROM posts
    WHERE badge != ''
    ORDER BY created_at DESC
  `).all();

  for (const p of posts) {
    links.push({
      palabra_clave: p.palabra_clave,
      tipo: 'publicacion',
      titulo: p.title || p.description?.slice(0, 80) || `Publicación #${p.id}`,
      enlace: `${frontendUrl()}/post/${p.id}`,
    });
  }

  return links;
}

// ─── GET /api/links — público (todos los enlaces por palabra clave) ──────────
router.get('/', (req, res) => {
  res.json(buildLinks());
});

// ─── GET /api/links/:keyword — público (buscar por palabra clave) ─────────────
router.get('/:keyword', (req, res) => {
  const keyword = req.params.keyword.toLowerCase().trim();
  const match = buildLinks().find((l) => l.palabra_clave === keyword);

  if (!match) {
    return res.status(404).json({ error: 'Palabra clave no encontrada' });
  }

  res.json(match);
});

module.exports = router;
