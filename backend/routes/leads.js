const router = require('express').Router();

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_UPSERT_URL = `${GHL_BASE}/contacts/upsert`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+\d{8,15}$/; // E.164: + seguido de 8 a 15 dígitos

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_TOKEN}`,
    Version: process.env.GHL_API_VERSION || '2021-07-28',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// ─── POST /api/leads — público ───────────────────────────────────────────────
// Captura un lead antes de permitir una descarga y lo guarda en GoHighLevel
// como contacto con el tag configurado (por defecto "comunidad").
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body || {};

  // Validación básica
  if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Correo inválido' });
  if (!phone || !PHONE_RE.test(phone.trim())) {
    return res.status(400).json({ error: 'Número inválido (formato internacional +<país><número>)' });
  }

  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('⚠️  Falta GHL_API_TOKEN o GHL_LOCATION_ID en el entorno');
    return res.status(500).json({ error: 'Integración de leads no configurada' });
  }

  const fullName = name.trim();
  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(' ');

  // Importante: NO mandamos "tags" en el upsert porque ahí reemplaza los tags
  // existentes del contacto. El tag se agrega aparte (aditivo) más abajo.
  const payload = {
    locationId,
    name: fullName,
    firstName,
    lastName: lastName || undefined,
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    source: 'Comunidad Estratego',
  };

  const tag = process.env.GHL_TAG || 'comunidad';

  try {
    const ghlRes = await fetch(GHL_UPSERT_URL, {
      method: 'POST',
      headers: ghlHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await ghlRes.json().catch(() => ({}));

    if (!ghlRes.ok) {
      console.error('❌ Error de GoHighLevel:', ghlRes.status, JSON.stringify(data));
      return res.status(502).json({ error: 'No se pudo registrar el contacto. Intenta de nuevo.' });
    }

    const contactId = data?.contact?.id || data?.id || null;

    // Agregar el tag sin pisar los existentes: POST /contacts/{id}/tags
    if (contactId) {
      try {
        const tagRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
          method: 'POST',
          headers: ghlHeaders(),
          body: JSON.stringify({ tags: [tag] }),
        });
        if (!tagRes.ok) {
          const tagData = await tagRes.json().catch(() => ({}));
          console.error('⚠️  No se pudo agregar el tag:', tagRes.status, JSON.stringify(tagData));
        }
      } catch (tagErr) {
        console.error('⚠️  Fallo al agregar el tag:', tagErr.message);
      }
    }

    res.json({ success: true, contactId });
  } catch (err) {
    // err.message suele ser "fetch failed" (genérico); la causa real está en err.cause
    const cause = err.cause || {};
    console.error('❌ Fallo al contactar GoHighLevel:', err.message,
      '| cause:', cause.code || cause.message || cause, '| errno:', cause.errno);
    res.status(502).json({ error: 'No se pudo registrar el contacto. Intenta de nuevo.' });
  }
});

module.exports = router;
