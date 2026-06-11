import {
  FileArchive, FileText, FileSpreadsheet, FileImage, FileVideo,
  FileAudio, FileCode, File as FileIcon,
} from 'lucide-react';

// Formatea bytes a una cadena legible (KB, MB, GB).
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

// Devuelve un icono Lucide según la extensión/mimetype del adjunto.
export function attachmentIcon(name = '', mimetype = '') {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (/zip|rar|7z|tar|gz/.test(ext)) return FileArchive;
  if (/pdf|docx?|txt|rtf|odt/.test(ext)) return FileText;
  if (/xlsx?|csv|ods/.test(ext)) return FileSpreadsheet;
  if (mimetype.startsWith('image/') || /png|jpe?g|gif|webp|svg/.test(ext)) return FileImage;
  if (mimetype.startsWith('video/') || /mp4|mov|webm|mkv|avi/.test(ext)) return FileVideo;
  if (mimetype.startsWith('audio/') || /mp3|wav|ogg|m4a/.test(ext)) return FileAudio;
  if (/js|ts|jsx|tsx|json|html|css|py|java|c|cpp/.test(ext)) return FileCode;
  return FileIcon;
}

// Fecha relativa corta en español ("hace 3 h", "hace 2 d").
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  // SQLite guarda UTC sin zona → forzamos interpretación UTC.
  const date = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(s)) return '';
  if (s < 60) return 'ahora';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  if (s < 604800) return `hace ${Math.floor(s / 86400)} d`;
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}
