import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Download, Sparkles, BookOpen, Video, Wrench } from 'lucide-react';
import { API_URL } from './api';
import { getIcon } from './icons';

// ─── CONFIG ESTÁTICO ──────────────────────────────────────────────────────────
const profile = {
  handle: "@luisposada_ai",
};

const categories = [
  { id: "all",         label: "Todos",           Icon: Sparkles  },
  { id: "guides",      label: "Guías",           Icon: BookOpen  },
  { id: "automations", label: "Automatizaciones", Icon: FileText  },
  { id: "videos",      label: "Videos",          Icon: Video     },
  { id: "tools",       label: "Herramientas",    Icon: Wrench    },
];

// ─── COMPONENTES ─────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="text-center mb-10">
      <h1 className="text-3xl font-bold text-white mb-2"></h1>
      <p className="text-[#d4af37] text-sm max-w-lg mx-auto leading-relaxed mt-4 font-mono font-bold glow-text">
        Bienvenido al 1%
      </p>
      <div className="flex flex-col items-center gap-2 mt-6">
        <p className="text-white/50 text-xs max-w-lg mx-auto leading-relaxed font-mono flex items-center gap-2">
          <span className="text-[#d4af37]">◆</span> Aquí se viene a dominar
        </p>
        <p className="text-white/50 text-xs max-w-lg mx-auto leading-relaxed font-mono flex items-center gap-2">
          <span className="text-[#d4af37]">◆</span> Ahora empieza la verdadera diferencia
        </p>
      </div>
    </header>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
      <input
        type="text"
        placeholder="Buscar recursos..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111111] border border-[#1a1a1a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50 transition-colors font-mono text-sm"
      />
    </div>
  );
}

function CategoryTabs({ activeCategory, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {categories.map(({ id, label, Icon }) => {
        const isActive = activeCategory === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all ${
              isActive
                ? 'bg-[#d4af37] text-[#0a0a0a] border border-[#d4af37]'
                : 'bg-[#111111] text-gray-400 border border-[#1a1a1a] hover:border-[#d4af37]/30 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Badge({ text }) {
  if (!text) return null;
  return (
    <span className="badge uppercase font-bold rounded bg-[#d4af37] text-[#0a0a0a]">
      {text}
    </span>
  );
}

function ResourceCard({ resource }) {
  const Icon = getIcon(resource.icon);

  return (
    <a
      href={resource.download_url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-card block bg-[#111111] rounded-xl p-4 cursor-pointer h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="icon-container w-10 h-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center border border-[#1a1a1a]">
            <Icon className="w-4 h-4 text-[#d4af37]" />
          </div>
          <Badge text={resource.palabra_clave} />
        </div>

        <div className="flex-1 min-h-0">
          <h3 className="text-white font-semibold text-xs mb-1 line-clamp-2">{resource.title}</h3>
          <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">{resource.description}</p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-[#1a1a1a]">
          <Download className="w-3 h-3 text-[#d4af37]" />
          <span className="text-[#d4af37] text-[10px] font-mono">Descargar</span>
        </div>
      </div>
    </a>
  );
}

function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      driftDelay: Math.random() * 5,
      driftDuration: Math.random() * 8 + 10,
      fadeDelay: Math.random() * 8,
      fadeDuration: Math.random() * 6 + 6,
      isGold: Math.random() > 0.3,
    }));
  }, []);

  return (
    <div className="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${p.isGold ? 'gold' : 'silver'}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.driftDelay}s, ${p.fadeDelay}s`,
            animationDuration: `${p.driftDuration}s, ${p.fadeDuration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function CommunityPage() {
  const [resources,      setResources]      = useState([]);
  const [loadingRes,     setLoadingRes]     = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetch(`${API_URL}/api/resources`)
      .then((r) => r.json())
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]))
      .finally(() => setLoadingRes(false));
  }, []);

  const filteredResources = resources.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Particles />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/VersiónPrincipalDorada.svg" alt="Estratego" className="w-10 h-10" />
            <span className="text-white font-semibold text-sm font-mono hidden sm:block">
              Comunidad Estrategas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-[#d4af37] text-[#0a0a0a] rounded-lg text-xs font-mono font-semibold">
              Documentos
            </button>
            <button
              disabled
              className="px-4 py-2 bg-[#111111] text-gray-500 rounded-lg text-xs font-mono border border-[#1a1a1a] cursor-not-allowed relative group"
            >
              Tutoriales
              <span className="absolute -top-2 -right-2 bg-[#d4af37]/20 text-[#d4af37] text-[8px] px-1.5 py-0.5 rounded font-bold">
                SOON
              </span>
            </button>
            <button
              disabled
              className="px-4 py-2 bg-[#111111] text-gray-500 rounded-lg text-xs font-mono border border-[#1a1a1a] cursor-not-allowed relative group"
            >
              Negocios
              <span className="absolute -top-2 -right-2 bg-[#d4af37]/20 text-[#d4af37] text-[8px] px-1.5 py-0.5 rounded font-bold">
                SOON
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <Header />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />

        <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {loadingRes ? (
            <div className="text-center py-16 text-gray-600 font-mono text-sm">
              Cargando recursos...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-mono">No se encontraron recursos</p>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-8 font-mono">
          {filteredResources.length} recurso{filteredResources.length !== 1 ? 's' : ''} disponible
          {filteredResources.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
