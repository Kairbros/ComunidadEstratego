import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../api';
import SiteNav from '../components/SiteNav';
import PostMediaGallery from './PostMediaGallery';
import AttachmentList from './AttachmentList';
import ShareButton from './ShareButton';
import { timeAgo } from './postUtils';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/api/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (post) document.title = `${post.title || 'Publicación'} — Comunidad Estratego`;
    return () => { document.title = 'Comunidad Estratego'; };
  }, [post]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav active="publicaciones" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-xs font-mono mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a publicaciones
        </Link>

        {loading ? (
          <div className="text-center py-16 text-gray-600 font-mono text-sm">Cargando...</div>
        ) : notFound || !post ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-mono text-sm">Esta publicación no existe o fue eliminada.</p>
            <Link to="/publicaciones" className="text-[#d4af37] text-xs font-mono hover:underline mt-3 inline-block">
              Ver todas las publicaciones
            </Link>
          </div>
        ) : (
          <article className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 sm:p-6">
            {/* Cabecera */}
            <div className="flex items-center gap-2 mb-4">
              <img src="/VersiónPrincipalDorada.svg" alt="" className="w-9 h-9" />
              <div>
                <p className="text-white text-sm font-mono font-semibold leading-tight">Estratego</p>
                <p className="text-gray-600 text-[10px] font-mono">{timeAgo(post.created_at)}</p>
              </div>
            </div>

            {post.title && (
              <h1 className="text-white font-bold font-mono text-xl mb-2">{post.title}</h1>
            )}

            {post.description && (
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {post.description}
              </p>
            )}

            {post.media?.length > 0 && (
              <div className="mb-4">
                <PostMediaGallery media={post.media} />
              </div>
            )}

            {post.attachments?.length > 0 && (
              <div className="mb-4">
                <AttachmentList attachments={post.attachments} />
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-[#1a1a1a]">
              <ShareButton postId={post.id} title={post.title || post.description} />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
