import { useState, useEffect, useMemo } from 'react';
import { X, Paperclip, ImagePlay } from 'lucide-react';
import { apiUpload } from '../api';
import { formatBytes, attachmentIcon } from '../posts/postUtils';

const MAX_MEDIA = 4;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|mkv|avi|m4v|3gp|ogv|mpe?g)$/i;

// Acepta por MIME o, si el navegador no lo reporta, por extensión.
function isMediaFile(file) {
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) return true;
  return IMAGE_EXT.test(file.name) || VIDEO_EXT.test(file.name);
}
function isVideoFile(file) {
  return file.type.startsWith('video/') || (!file.type.startsWith('image/') && VIDEO_EXT.test(file.name));
}

export default function AdminPostForm({ post, onSuccess, onCancel }) {
  const isEditing = !!post;

  const [title, setTitle]             = useState(post?.title || '');
  const [description, setDescription] = useState(post?.description || '');

  // Medios/adjuntos ya existentes (solo en edición)
  const [existingMedia, setExistingMedia]             = useState(post?.media || []);
  const [existingAttachments, setExistingAttachments] = useState(post?.attachments || []);
  const [removeMediaIds, setRemoveMediaIds]             = useState([]);
  const [removeAttachmentIds, setRemoveAttachmentIds]  = useState([]);

  // Archivos nuevos a subir
  const [newMedia, setNewMedia]             = useState([]);   // File[]
  const [newAttachments, setNewAttachments] = useState([]);   // File[]

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const mediaCount = existingMedia.length + newMedia.length;

  // Previews de los medios nuevos (object URLs) — liberadas al desmontar.
  const newMediaPreviews = useMemo(
    () => newMedia.map((f) => ({ file: f, url: URL.createObjectURL(f), isVideo: isVideoFile(f) })),
    [newMedia]
  );
  useEffect(() => {
    return () => newMediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [newMediaPreviews]);

  function addMedia(files) {
    setError('');
    const picked = Array.from(files);
    const valid = picked.filter(isMediaFile);
    if (valid.length !== picked.length) setError('Solo se permiten imágenes o videos como medios');
    const room = MAX_MEDIA - mediaCount;
    if (room <= 0) { setError(`Máximo ${MAX_MEDIA} medios por publicación`); return; }
    setNewMedia((prev) => [...prev, ...valid.slice(0, room)]);
  }

  function addAttachments(files) {
    const picked = Array.from(files);   // copiar YA, antes de que se limpie el input
    setNewAttachments((prev) => [...prev, ...picked]);
  }

  function removeExistingMedia(id) {
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
    setRemoveMediaIds((prev) => [...prev, id]);
  }
  function removeExistingAttachment(id) {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
    setRemoveAttachmentIds((prev) => [...prev, id]);
  }
  function removeNewMedia(idx) {
    setNewMedia((prev) => prev.filter((_, i) => i !== idx));
  }
  function removeNewAttachment(idx) {
    setNewAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() && !description.trim() && mediaCount === 0) {
      setError('Escribe algo o agrega al menos un medio');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      newMedia.forEach((f) => fd.append('media', f));
      newAttachments.forEach((f) => fd.append('attachments', f));
      if (isEditing) {
        if (removeMediaIds.length) fd.append('removeMediaIds', removeMediaIds.join(','));
        if (removeAttachmentIds.length) fd.append('removeAttachmentIds', removeAttachmentIds.join(','));
      }

      const path = isEditing ? `/api/posts/${post.id}` : '/api/posts';
      const data = await apiUpload(path, fd, isEditing ? 'PUT' : 'POST');
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Título */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">Título (opcional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la publicación"
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="¿Qué quieres compartir?"
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600 resize-y"
        />
      </div>

      {/* Medios */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">
          Galería <span className="text-gray-600">({mediaCount}/{MAX_MEDIA} · fotos o videos)</span>
        </label>

        {(existingMedia.length > 0 || newMedia.length > 0) && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {existingMedia.map((m) => (
              <MediaTile key={`e${m.id}`} url={m.url} isVideo={m.type === 'video'} onRemove={() => removeExistingMedia(m.id)} />
            ))}
            {newMediaPreviews.map((p, i) => (
              <MediaTile key={`n${i}`} url={p.url} isVideo={p.isVideo} onRemove={() => removeNewMedia(i)} isNew />
            ))}
          </div>
        )}

        {mediaCount < MAX_MEDIA && (
          <label className="flex items-center gap-2 w-full bg-[#0a0a0a] border border-dashed border-[#1a1a1a] hover:border-[#d4af37]/40 rounded-lg py-2.5 px-3 cursor-pointer transition-colors group">
            <ImagePlay className="w-4 h-4 text-gray-500 group-hover:text-[#d4af37] transition-colors" />
            <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300">Agregar fotos / videos</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => { addMedia(e.target.files); e.target.value = ''; }}
            />
          </label>
        )}
      </div>

      {/* Adjuntos */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">
          Archivos adjuntos <span className="text-gray-600">(zip, pdf, lo que sea)</span>
        </label>

        {(existingAttachments.length > 0 || newAttachments.length > 0) && (
          <div className="space-y-1.5 mb-2">
            {existingAttachments.map((a) => (
              <AttachmentRow key={`e${a.id}`} name={a.original_name} size={a.size} mimetype={a.mimetype} onRemove={() => removeExistingAttachment(a.id)} />
            ))}
            {newAttachments.map((f, i) => (
              <AttachmentRow key={`n${i}`} name={f.name} size={f.size} mimetype={f.type} onRemove={() => removeNewAttachment(i)} isNew />
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 w-full bg-[#0a0a0a] border border-dashed border-[#1a1a1a] hover:border-[#d4af37]/40 rounded-lg py-2.5 px-3 cursor-pointer transition-colors group">
          <Paperclip className="w-4 h-4 text-gray-500 group-hover:text-[#d4af37] transition-colors" />
          <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300">Agregar archivos</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => { addAttachments(e.target.files); e.target.value = ''; }}
          />
        </label>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-mono bg-red-400/10 rounded-lg py-2 px-3">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#111111] border border-[#1a1a1a] text-gray-400 rounded-lg py-2.5 text-sm font-mono hover:border-gray-500 hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#d4af37] text-[#0a0a0a] rounded-lg py-2.5 text-sm font-mono font-bold hover:bg-[#c9a227] disabled:opacity-50 transition-all"
        >
          {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}

function MediaTile({ url, isVideo, onRemove, isNew }) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border border-[#1a1a1a] bg-black">
      {isVideo ? (
        <video src={url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={url} alt="" className="w-full h-full object-cover" />
      )}
      {isVideo && (
        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-mono px-1 rounded">VIDEO</span>
      )}
      {isNew && (
        <span className="absolute top-1 left-1 bg-[#d4af37] text-[#0a0a0a] text-[8px] font-mono font-bold px-1 rounded">NUEVO</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white rounded p-0.5 transition-colors"
        aria-label="Quitar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function AttachmentRow({ name, size, mimetype, onRemove, isNew }) {
  const Icon = attachmentIcon(name, mimetype);
  return (
    <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-2.5 py-2">
      <Icon className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
      <span className="text-white text-xs font-mono truncate flex-1">{name}</span>
      {isNew && <span className="text-[#d4af37] text-[8px] font-mono font-bold">NUEVO</span>}
      {size > 0 && <span className="text-gray-600 text-[10px] font-mono">{formatBytes(size)}</span>}
      <button type="button" onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors" aria-label="Quitar">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
