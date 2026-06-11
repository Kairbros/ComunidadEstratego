import { Download } from 'lucide-react';
import { formatBytes, attachmentIcon } from './postUtils';
import { useLeadGate } from '../leadgate/LeadGateContext';

// Lista de adjuntos descargables de una publicación.
export default function AttachmentList({ attachments = [] }) {
  const { requestDownload } = useLeadGate();
  if (!attachments.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-gray-500 text-[11px] font-mono uppercase tracking-wider">
        {attachments.length} archivo{attachments.length !== 1 ? 's' : ''} adjunto
        {attachments.length !== 1 ? 's' : ''}
      </p>
      {attachments.map((att) => {
        const Icon = attachmentIcon(att.original_name, att.mimetype);
        return (
          <button
            key={att.id}
            type="button"
            onClick={() => requestDownload(att.url)}
            className="w-full text-left flex items-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#d4af37]/40 rounded-lg px-3 py-2.5 transition-colors group"
          >
            <div className="w-9 h-9 flex-shrink-0 bg-[#111111] border border-[#1a1a1a] rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-mono truncate">{att.original_name}</p>
              {att.size > 0 && (
                <p className="text-gray-600 text-[10px] font-mono">{formatBytes(att.size)}</p>
              )}
            </div>
            <Download className="w-4 h-4 text-gray-500 group-hover:text-[#d4af37] transition-colors flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
