import { useState } from 'react';
import { Download, X, Lock } from 'lucide-react';
import { API_URL } from '../api';
import { COUNTRIES, DEFAULT_COUNTRY, findCountry } from './countries';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadGateModal({ onCaptured, onClose }) {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const country = findCountry(countryIso);

  function handlePhoneChange(e) {
    // Solo dígitos, limitado al máximo del país seleccionado
    const digits = e.target.value.replace(/\D/g, '').slice(0, country.max);
    setPhoneDigits(digits);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Escribe tu nombre');
    if (!EMAIL_RE.test(email)) return setError('Escribe un correo válido');
    if (phoneDigits.length < country.min || phoneDigits.length > country.max) {
      return setError(
        country.min === country.max
          ? `El número de ${country.name} debe tener ${country.min} dígitos`
          : `El número de ${country.name} debe tener entre ${country.min} y ${country.max} dígitos`
      );
    }

    // Formato internacional E.164: +<código país><número>
    const phone = `+${country.dial}${phoneDigits}`;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo continuar');

      onCaptured({ name: name.trim(), email: email.trim(), phone });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#d4af37]" />
          </div>
          <h3 className="text-white font-bold font-mono text-base">Un paso antes de descargar</h3>
          <p className="text-gray-500 text-xs font-mono mt-1">
            Déjanos tus datos para acceder al recurso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs font-mono block mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Tu nombre"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-mono block mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="tu@correo.com"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-mono block mb-1">Número de teléfono</label>
            <div className="flex gap-2">
              <select
                value={countryIso}
                onChange={(e) => { setCountryIso(e.target.value); setPhoneDigits(''); }}
                aria-label="País"
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 pl-2 pr-1 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors max-w-[7.5rem]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.flag} +{c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                value={phoneDigits}
                onChange={handlePhoneChange}
                autoComplete="tel-national"
                placeholder={'0'.repeat(country.max)}
                className="flex-1 min-w-0 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder-gray-600"
              />
            </div>
            <p className="text-gray-600 text-[10px] font-mono mt-1">
              Se enviará como +{country.dial} {phoneDigits || '…'}
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-400/10 rounded-lg py-2 px-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#d4af37] text-[#0a0a0a] rounded-lg py-2.5 text-sm font-mono font-bold hover:bg-[#c9a227] disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Procesando...' : 'Acceder y descargar'}
          </button>

          <p className="text-gray-600 text-[10px] font-mono text-center">
            Tus datos se guardan de forma segura. Solo se piden una vez.
          </p>
        </form>
      </div>
    </div>
  );
}
