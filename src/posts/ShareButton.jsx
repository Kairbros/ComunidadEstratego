import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

// Comparte el enlace permanente de una publicación.
// Usa la Web Share API si está disponible; si no, copia al portapapeles.
export default function ShareButton({ postId, title, className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: title || 'Publicación', url });
        return;
      } catch {
        /* el usuario canceló — caemos a copiar */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia el enlace:', url);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
        copied ? 'text-green-400' : 'text-gray-500 hover:text-[#d4af37]'
      } ${className}`}
      title="Compartir"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
      {copied ? 'Enlace copiado' : 'Compartir'}
    </button>
  );
}
