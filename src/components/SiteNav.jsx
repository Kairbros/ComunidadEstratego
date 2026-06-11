import { Link } from 'react-router-dom';

// Navbar compartido entre la home (Documentos) y el feed (Publicaciones).
// `active` = 'documentos' | 'publicaciones'
export default function SiteNav({ active }) {
  const base = 'px-4 py-2 rounded-lg text-xs font-mono transition-all';
  const activeCls = 'bg-[#d4af37] text-[#0a0a0a] font-semibold';
  const idleCls = 'bg-[#111111] text-gray-400 border border-[#1a1a1a] hover:text-white hover:border-[#d4af37]/30';

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/VersiónPrincipalDorada.svg" alt="Estratego" className="w-10 h-10" />
          <span className="text-white font-semibold text-sm font-mono hidden sm:block">
            Comunidad Estrategas
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/" className={`${base} ${active === 'publicaciones' ? activeCls : idleCls}`}>
            Publicaciones
          </Link>
          <Link
            to="/documentos"
            className={`${base} ${active === 'documentos' ? activeCls : idleCls}`}
          >
            Documentos
          </Link>
          <button
            disabled
            className="px-4 py-2 bg-[#111111] text-gray-500 rounded-lg text-xs font-mono border border-[#1a1a1a] cursor-not-allowed relative"
          >
            Negocios
            <span className="absolute -top-2 -right-2 bg-[#d4af37]/20 text-[#d4af37] text-[8px] px-1.5 py-0.5 rounded font-bold">
              SOON
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
