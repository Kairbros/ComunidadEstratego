import { Link } from 'react-router-dom';
import { Paperclip } from 'lucide-react';
import PostMediaGallery from './PostMediaGallery';
import ShareButton from './ShareButton';
import { timeAgo } from './postUtils';

// Tarjeta de una publicación en el feed.
export default function PostCard({ post }) {
  const hasAttachments = post.attachments?.length > 0;

  return (
    <article className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 sm:p-5">
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-3">
        <img src="/VersiónPrincipalDorada.svg" alt="" className="w-8 h-8" />
        <div className="min-w-0">
          <p className="text-white text-sm font-mono font-semibold leading-tight">Estratego</p>
          <p className="text-gray-600 text-[10px] font-mono">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {post.title && (
        <h2 className="text-white font-bold font-mono text-base mb-1">{post.title}</h2>
      )}

      {post.description && (
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-3 line-clamp-6">
          {post.description}
        </p>
      )}

      {post.media?.length > 0 && (
        <div className="mb-3">
          <PostMediaGallery media={post.media} />
        </div>
      )}

      {/* Pie */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-4">
          {hasAttachments && (
            <span className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
              <Paperclip className="w-3.5 h-3.5 text-[#d4af37]" />
              {post.attachments.length} adjunto{post.attachments.length !== 1 ? 's' : ''}
            </span>
          )}
          <Link
            to={`/post/${post.id}`}
            className="text-[#d4af37] text-xs font-mono hover:underline"
          >
            Ver publicación →
          </Link>
        </div>
        <ShareButton postId={post.id} title={post.title || post.description} />
      </div>
    </article>
  );
}
