import { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import { API_URL } from '../api';
import SiteNav from '../components/SiteNav';
import PostCard from './PostCard';

export default function PostsFeed() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/posts`)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav active="publicaciones" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#d4af37]" />
            Publicaciones
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-1">
            Novedades y recursos de la comunidad
          </p>
        </header>

        {loading ? (
          <div className="text-center py-16 text-gray-600 font-mono text-sm">
            Cargando publicaciones...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-mono text-sm">Todavía no hay publicaciones</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
