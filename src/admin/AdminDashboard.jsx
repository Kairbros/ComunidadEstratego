import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, LogOut, RefreshCw, X, FileText, Newspaper } from 'lucide-react';
import { apiFetch } from '../api';
import { getIcon } from '../icons';
import AdminUploadForm from './AdminUploadForm';
import AdminPosts from './AdminPosts';

const CATEGORY_LABELS = {
  guides:      'Guías',
  automations: 'Automatizaciones',
  videos:      'Videos',
  tools:       'Herramientas',
};

export default function AdminDashboard({ onLogout }) {
  const [resources, setResources] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [section,   setSection]   = useState('resources');  // 'resources' | 'posts'
  const [view,      setView]      = useState('list');       // 'list' | 'form'
  const [editing,   setEditing]   = useState(null);        // null = nuevo, objeto = editar
  const [deleting,  setDeleting]  = useState(null);        // id del recurso a eliminar
  const [error,     setError]     = useState('');

  const username = localStorage.getItem('admin_username') || 'Admin';

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/resources');
      const filtered = Array.isArray(data) ? data.filter(item => item.category !== 'community' && item.category !== 'post') : [];
      setResources(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    onLogout();
  }

  function openCreate() {
    setEditing(null);
    setView('form');
  }

  function openEdit(resource) {
    setEditing(resource);
    setView('form');
  }

  function handleFormSuccess(saved) {
    setView('list');
    setEditing(null);
    loadResources();
  }

  async function confirmDelete(id) {
    try {
      await apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
      setDeleting(null);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/VersiónPrincipalDorada.svg" alt="Estratego" className="w-8 h-8" />
            <div>
              <span className="text-white font-semibold text-sm font-mono">Panel Admin</span>
              <span className="text-gray-500 text-xs font-mono ml-2 hidden sm:inline">— {username}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="px-3 py-1.5 bg-[#111111] text-gray-400 rounded-lg text-xs font-mono border border-[#1a1a1a] hover:text-white hover:border-gray-500 transition-all"
            >
              Ver comunidad
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-gray-400 rounded-lg text-xs font-mono border border-[#1a1a1a] hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              <LogOut className="w-3 h-3" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── PESTAÑAS ── */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => { setSection('resources'); setView('list'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all ${
              section === 'resources'
                ? 'bg-[#d4af37] text-[#0a0a0a] font-semibold'
                : 'bg-[#111111] text-gray-400 border border-[#1a1a1a] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Recursos
          </button>
          <button
            onClick={() => setSection('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all ${
              section === 'posts'
                ? 'bg-[#d4af37] text-[#0a0a0a] font-semibold'
                : 'bg-[#111111] text-gray-400 border border-[#1a1a1a] hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Publicaciones
          </button>
        </div>

        {section === 'posts' && <AdminPosts />}

        {/* ── VISTA FORMULARIO ── */}
        {section === 'resources' && view === 'form' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold font-mono text-lg">
                {editing ? 'Editar recurso' : 'Subir nuevo recurso'}
              </h2>
              <button
                onClick={() => setView('list')}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 max-w-lg">
              <AdminUploadForm
                resource={editing}
                onSuccess={handleFormSuccess}
                onCancel={() => setView('list')}
              />
            </div>
          </div>
        )}

        {/* ── VISTA LISTA ── */}
        {section === 'resources' && view === 'list' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white font-bold font-mono text-lg">Recursos</h1>
                <p className="text-gray-500 text-xs font-mono mt-0.5">
                  {resources.length} recurso{resources.length !== 1 ? 's' : ''} en total
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadResources}
                  disabled={loading}
                  className="p-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 transition-all"
                  title="Recargar"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-[#0a0a0a] rounded-lg text-sm font-mono font-bold hover:bg-[#c9a227] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo recurso
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {/* Tabla */}
            {loading ? (
              <div className="text-center py-16 text-gray-600 font-mono text-sm">Cargando...</div>
            ) : resources.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 font-mono text-sm">No hay recursos todavía</p>
                <button
                  onClick={openCreate}
                  className="mt-4 text-[#d4af37] text-xs font-mono hover:underline"
                >
                  Subir el primero
                </button>
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="text-left text-gray-500 text-[11px] font-mono font-medium px-4 py-3">Icono</th>
                      <th className="text-left text-gray-500 text-[11px] font-mono font-medium px-4 py-3">Título</th>
                      <th className="text-left text-gray-500 text-[11px] font-mono font-medium px-4 py-3 hidden md:table-cell">Categoría</th>
                      <th className="text-left text-gray-500 text-[11px] font-mono font-medium px-4 py-3">Keyword / Badge</th>
                      <th className="text-right text-gray-500 text-[11px] font-mono font-medium px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource, i) => {
                      const Icon = getIcon(resource.icon);
                      return (
                        <tr
                          key={resource.id}
                          className={`border-b border-[#1a1a1a] last:border-0 hover:bg-[#0a0a0a]/50 transition-colors ${
                            i % 2 === 0 ? '' : ''
                          }`}
                        >
                          {/* Icono */}
                          <td className="px-4 py-3">
                            <div className="w-8 h-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-[#d4af37]" />
                            </div>
                          </td>

                          {/* Título + descripción */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-white text-xs font-mono font-semibold truncate">{resource.title}</p>
                            {resource.description && (
                              <p className="text-gray-500 text-[10px] font-mono truncate mt-0.5">{resource.description}</p>
                            )}
                          </td>

                          {/* Categoría */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-gray-400 text-[11px] font-mono">
                              {CATEGORY_LABELS[resource.category] || resource.category}
                            </span>
                          </td>

                          {/* Badge keyword */}
                          <td className="px-4 py-3">
                            <span className="bg-[#d4af37] text-[#0a0a0a] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                              {resource.palabra_clave}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEdit(resource)}
                                className="p-1.5 text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleting(resource.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal confirmación de borrado */}
      {deleting !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold font-mono mb-2">¿Eliminar recurso?</h3>
            <p className="text-gray-400 text-sm font-mono mb-6">
              Esta acción no se puede deshacer. El archivo PDF también será eliminado del servidor.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] text-gray-400 rounded-lg py-2.5 text-sm font-mono hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deleting)}
                className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-mono font-bold hover:bg-red-600 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
