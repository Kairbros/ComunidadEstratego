import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, X, Paperclip, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { apiFetch } from '../api';
import { timeAgo } from '../posts/postUtils';
import AdminPostForm from './AdminPostForm';

export default function AdminPosts() {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('list');   // 'list' | 'form'
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError]   = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await apiFetch('/api/posts'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  function openCreate() { setEditing(null); setView('form'); }
  function openEdit(post) { setEditing(post); setView('form'); }
  function handleSuccess() { setView('list'); setEditing(null); loadPosts(); }

  async function confirmDelete(id) {
    try {
      await apiFetch(`/api/posts/${id}`, { method: 'DELETE' });
      setDeleting(null);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    }
  }

  if (view === 'form') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold font-mono text-lg">
            {editing ? 'Editar publicación' : 'Nueva publicación'}
          </h2>
          <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 max-w-lg">
          <AdminPostForm post={editing} onSuccess={handleSuccess} onCancel={() => setView('list')} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold font-mono text-lg">Publicaciones</h1>
          <p className="text-gray-500 text-xs font-mono mt-0.5">
            {posts.length} publicación{posts.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadPosts}
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
            Nueva publicación
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-600 font-mono text-sm">Cargando...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 font-mono text-sm">No hay publicaciones todavía</p>
          <button onClick={openCreate} className="mt-4 text-[#d4af37] text-xs font-mono hover:underline">
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 flex items-center gap-4">
              {/* Miniatura */}
              <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center">
                {post.media?.[0] ? (
                  post.media[0].type === 'video' ? (
                    <video src={post.media[0].url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
                  )
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-700" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-mono font-semibold truncate">
                  {post.title || post.description?.slice(0, 60) || '(sin texto)'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-gray-600 text-[10px] font-mono">
                  <span>{timeAgo(post.created_at)}</span>
                  {post.media?.length > 0 && (
                    <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" />{post.media.length}</span>
                  )}
                  {post.attachments?.length > 0 && (
                    <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{post.attachments.length}</span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`/post/${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Ver"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => openEdit(post)}
                  className="p-1.5 text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(post.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal borrado */}
      {deleting !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold font-mono mb-2">¿Eliminar publicación?</h3>
            <p className="text-gray-400 text-sm font-mono mb-6">
              Se borrarán también sus fotos, videos y archivos adjuntos. No se puede deshacer.
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
