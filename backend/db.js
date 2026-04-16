const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'estratego.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    description  TEXT    DEFAULT '',
    category     TEXT    NOT NULL,
    badge        TEXT    NOT NULL,
    badge_style  TEXT    DEFAULT 'gold',
    icon         TEXT    NOT NULL DEFAULT 'FileText',
    filename     TEXT    NOT NULL,
    download_url TEXT    NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── SEED ADMIN ───────────────────────────────────────────────────────────────
const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('EstrategoAdmin');
if (!adminExists) {
  const hash = bcrypt.hashSync('Estrategia2025$', 12);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('EstrategoAdmin', hash);
  console.log('👤 Admin creado: EstrategoAdmin');
}

// ─── SEED RECURSOS INICIALES ─────────────────────────────────────────────────
// Migra los 12 recursos existentes a la base de datos en el primer arranque.
// El campo "badge" coincide con las keywords del flujo de n8n (en minúsculas).
const resourceCount = db.prepare('SELECT COUNT(*) as count FROM resources').get();

if (resourceCount.count === 0) {
  const BASE = 'https://comunidad.estratego.us';

  const seeds = [
    {
      title: 'Top 5 Herramientas IA 2026',
      description: 'Las herramientas de inteligencia artificial más potentes para este año',
      category: 'tools',
      badge: 'lista',
      icon: 'Sparkles',
      filename: 'Estratego_Top5_IA_2026.pdf',
      download_url: `${BASE}/Estratego_Top5_IA_2026.pdf`,
    },
    {
      title: 'Guía WhatsApp Business API',
      description: 'Domina la API de WhatsApp para automatizar tu comunicación con clientes',
      category: 'automations',
      badge: 'whatsapp',
      icon: 'MessageCircle',
      filename: 'Guia_WhatsApp_Business_API_luisposada_ai.pdf',
      download_url: `${BASE}/Guia_WhatsApp_Business_API_luisposada_ai%20(1).pdf`,
    },
    {
      title: '50 Frases Persuasivas',
      description: 'Frases probadas para cerrar más ventas y conectar con tu audiencia',
      category: 'guides',
      badge: 'ventas',
      icon: 'Target',
      filename: '50_Frases_luisposada_ai_persuasivo.pdf',
      download_url: `${BASE}/50_Frases_luisposada_ai_persuasivo.pdf`,
    },
    {
      title: 'Herramientas por Nicho',
      description: 'Lista completa de herramientas organizadas por industria y necesidad',
      category: 'tools',
      badge: 'herramientas',
      icon: 'Wrench',
      filename: 'LISTA_HERRAMIENTAS_POR_NICHO.pdf',
      download_url: `${BASE}/LISTA%20HERRAMIENTAS%20POR%20NICHO.pdf`,
    },
    {
      title: 'Guía de Posicionamiento',
      description: 'Estrategias para posicionar tu marca y destacar en el mercado',
      category: 'guides',
      badge: 'control',
      icon: 'TrendingUp',
      filename: 'Guia_Posicionamiento_luisposada_ai.pdf',
      download_url: `${BASE}/Guia_Posicionamiento_luisposada_ai.pdf`,
    },
    {
      title: 'Ruta 5 Videos con N8N',
      description: 'Aprende a crear flujos de automatización con N8N paso a paso',
      category: 'automations',
      badge: 'infinito',
      icon: 'Zap',
      filename: 'Ruta_5_Videos_N8N_luisposada_ai.pdf',
      download_url: `${BASE}/Ruta_5_Videos_N8N_luisposada_ai.pdf`,
    },
    {
      title: 'Guía Waver 1.0',
      description: 'Manual completo para usar Waver en tus automatizaciones',
      category: 'automations',
      badge: 'waver',
      icon: 'Bot',
      filename: 'Waver_1.0_Guia_luisposada_ai.pdf',
      download_url: `${BASE}/Waver_1.0_Guia_luisposada_ai.pdf`,
    },
    {
      title: 'Videos con Imágenes - Guía 1',
      description: 'Crea videos atractivos usando solo imágenes y herramientas de IA',
      category: 'videos',
      badge: 'ia',
      icon: 'Video',
      filename: 'GUIA_PARA_HACER_VIDEOS_CON_IMAGENES_1.pdf',
      download_url: `${BASE}/GUIA%20PARA%20HACER%20VIDEOS%20CON%20IMAGENES%20(1).pdf`,
    },
    {
      title: 'Videos con Imágenes - Guía 2',
      description: 'Técnicas avanzadas para producción de video con IA',
      category: 'videos',
      badge: 'ia',
      icon: 'Video',
      filename: 'Guia_Videos_Imagenes_2_luisposada_ai.pdf',
      download_url: `${BASE}/Guia_Videos_Imagenes_2_luisposada_ai.pdf`,
    },
    {
      title: 'Ejercicios de Concentración',
      description: 'Mejora tu enfoque y productividad con estos ejercicios prácticos',
      category: 'guides',
      badge: 'crecer',
      icon: 'Brain',
      filename: 'luisposada_ejercicios_concentracion.pdf',
      download_url: `${BASE}/luisposada_ejercicios_concentracion.pdf`,
    },
    {
      title: 'Respuestas Estándar',
      description: 'Templates de respuestas listas para usar en tu negocio',
      category: 'guides',
      badge: 'estandar',
      icon: 'MessageSquare',
      filename: 'LuisPosada_Respuestas_Estandar.pdf',
      download_url: `${BASE}/LuisPosada_Respuestas_Estandar.pdf`,
    },
    {
      title: 'Mascota IA',
      description: 'Guía para animar tu mascota con IA',
      category: 'guides',
      badge: 'mascota',
      icon: 'Sparkles',
      filename: 'guia_mascota_ia_estratego_organized_organized.pdf',
      download_url: `${BASE}/guia_mascota_ia_estratego_organized_organized.pdf`,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO resources (title, description, category, badge, badge_style, icon, filename, download_url)
    VALUES (?, ?, ?, ?, 'gold', ?, ?, ?)
  `);

  const insertAll = db.transaction((rows) => {
    for (const r of rows) {
      insert.run(r.title, r.description, r.category, r.badge, r.icon, r.filename, r.download_url);
    }
  });

  insertAll(seeds);
  console.log('📚 12 recursos iniciales migrados a la base de datos');
}

module.exports = db;
