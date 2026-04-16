import { useState, useEffect } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { apiFetch, API_URL } from '../api';
import { ICON_OPTIONS, getIcon } from '../icons';

const CATEGORIES = [
  { value: 'guides',      label: 'Guías' },
  { value: 'automations', label: 'Automatizaciones' },
  { value: 'videos',      label: 'Videos' },
  { value: 'tools',       label: 'Herramientas' },
];

export default function AdminUploadForm({ resource, onSuccess, onCancel }) {
  const isEditing = !!resource;

  const [title,       setTitle]       = useState(resource?.title       || '');
  const [description, setDescription] = useState(resource?.description || '');
  const [category,    setCategory]    = useState(resource?.category    || 'guides');
  const [badge,       setBadge]       = useState(resource?.badge       || '');
  const [icon,        setIcon]        = useState(resource?.icon        || 'FileText');
  const [pdfFile,     setPdfFile]     = useState(null);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const PreviewIcon = getIcon(icon);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isEditing && !pdfFile) {
      setError('Selecciona un archivo PDF');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title',       title.trim());
      formData.append('description', description.trim());
      formData.append('category',    category);
      formData.append('badge',       badge.trim());
      formData.append('icon',        icon);
      if (pdfFile) formData.append('pdf', pdfFile);

      const token = localStorage.getItem('admin_token');
      const url   = isEditing
        ? `${API_URL}/api/resources/${resource.id}`
        : `${API_URL}/api/resources`;

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

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
        <label className="text-gray-400 text-xs font-mono block mb-1">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="ej. Guía de WhatsApp Business"
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Breve descripción del recurso..."
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600 resize-none"
        />
      </div>

      {/* Categoría + Badge en fila */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs font-mono block mb-1">
            Categoría <span className="text-red-400">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-xs font-mono block mb-1">
            Palabra clave / Badge <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            required
            placeholder="ej. control"
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600"
          />
          <p className="text-gray-600 text-[10px] font-mono mt-1">
            Se guarda en minúsculas — usada como keyword en n8n
          </p>
        </div>
      </div>

      {/* Selector de icono */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">
          Icono <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-3">
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            required
            className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors"
          >
            {ICON_OPTIONS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {/* Preview */}
          <div className="w-10 h-10 flex-shrink-0 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg flex items-center justify-center">
            <PreviewIcon className="w-5 h-5 text-[#d4af37]" />
          </div>
        </div>
      </div>

      {/* Archivo PDF */}
      <div>
        <label className="text-gray-400 text-xs font-mono block mb-1">
          Archivo PDF {!isEditing && <span className="text-red-400">*</span>}
          {isEditing && <span className="text-gray-500"> (deja vacío para mantener el actual)</span>}
        </label>

        <label className="flex items-center gap-3 w-full bg-[#0a0a0a] border border-dashed border-[#1a1a1a] hover:border-[#d4af37]/40 rounded-lg py-3 px-4 cursor-pointer transition-colors group">
          <Upload className="w-4 h-4 text-gray-500 group-hover:text-[#d4af37] transition-colors flex-shrink-0" />
          <span className="text-sm font-mono text-gray-500 group-hover:text-gray-300 transition-colors truncate">
            {pdfFile ? pdfFile.name : 'Seleccionar PDF...'}
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files[0] || null)}
          />
        </label>

        {isEditing && !pdfFile && resource?.download_url && (
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-[10px] font-mono">
            <FileText className="w-3 h-3" />
            <span className="truncate">Actual: {resource.filename}</span>
          </div>
        )}
      </div>

      {/* Badge estilo — siempre gold, solo informativo */}
      <div className="flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg px-3 py-2">
        <span className="text-[#d4af37] text-[10px] font-mono font-bold uppercase tracking-wider">
          Badge Style
        </span>
        <span className="text-[#d4af37] text-[10px] font-mono ml-auto">gold (fijo)</span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs font-mono bg-red-400/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      {/* Acciones */}
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
          {loading
            ? 'Guardando...'
            : isEditing
              ? 'Guardar cambios'
              : 'Subir recurso'}
        </button>
      </div>
    </form>
  );
}
