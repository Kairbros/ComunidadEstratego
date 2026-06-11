import { createContext, useContext, useState, useCallback } from 'react';
import LeadGateModal from './LeadGateModal';

const STORAGE_KEY = 'community_lead';
const LeadGateContext = createContext(null);

export function useLeadGate() {
  const ctx = useContext(LeadGateContext);
  if (!ctx) throw new Error('useLeadGate debe usarse dentro de <LeadGateProvider>');
  return ctx;
}

function readLead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Abre una URL de descarga en una pestaña nueva.
function openDownload(url) {
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function LeadGateProvider({ children }) {
  const [lead, setLead]       = useState(readLead);
  const [pending, setPending] = useState(null);   // URL pendiente de descargar
  const [open, setOpen]       = useState(false);

  // Punto de entrada: pide los datos (si no se han capturado) antes de descargar.
  const requestDownload = useCallback((url) => {
    if (readLead()) {
      openDownload(url);
    } else {
      setPending(url);
      setOpen(true);
    }
  }, []);

  // Llamado por el modal cuando el lead se registró con éxito.
  const handleCaptured = useCallback((capturedLead) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(capturedLead)); } catch { /* ignore */ }
    setLead(capturedLead);
    setOpen(false);
    if (pending) {
      openDownload(pending);
      setPending(null);
    }
  }, [pending]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setPending(null);
  }, []);

  return (
    <LeadGateContext.Provider value={{ requestDownload, lead }}>
      {children}
      {open && <LeadGateModal onCaptured={handleCaptured} onClose={handleClose} />}
    </LeadGateContext.Provider>
  );
}
