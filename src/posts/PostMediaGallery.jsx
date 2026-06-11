import { useState } from 'react';
import { X } from 'lucide-react';

// Clases de grid según la cantidad de medios (estilo redes sociales).
function layoutFor(count) {
  switch (count) {
    case 1: return { grid: 'grid-cols-1', items: [''] };
    case 2: return { grid: 'grid-cols-2', items: ['', ''] };
    case 3: return { grid: 'grid-cols-2 grid-rows-2', items: ['row-span-2', '', ''] };
    default: return { grid: 'grid-cols-2 grid-rows-2', items: ['', '', '', ''] };
  }
}

function MediaThumb({ item, className, onOpen }) {
  if (item.type === 'video') {
    return (
      <div className={`relative bg-black overflow-hidden ${className}`}>
        <video
          src={item.url}
          controls
          preload="metadata"
          className="w-full h-full object-contain bg-black"
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`relative bg-[#0a0a0a] overflow-hidden group ${className}`}
    >
      <img
        src={item.url}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </button>
  );
}

export default function PostMediaGallery({ media = [] }) {
  const [lightbox, setLightbox] = useState(null);
  if (!media.length) return null;

  const shown = media.slice(0, 4);
  const { grid, items } = layoutFor(shown.length);
  const single = shown.length === 1;

  return (
    <>
      <div
        className={`grid ${grid} gap-1 rounded-xl overflow-hidden border border-[#1a1a1a] ${
          single ? '' : 'aspect-[4/3]'
        }`}
      >
        {shown.map((item, i) => (
          <MediaThumb
            key={item.id ?? i}
            item={item}
            className={`${items[i]} ${single ? 'max-h-[70vh]' : 'min-h-0'}`}
            onOpen={setLightbox}
          />
        ))}
      </div>

      {/* Lightbox para imágenes */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={lightbox.url}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
