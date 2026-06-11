// Países con su código de marcación y longitud esperada del número nacional
// (min/max de dígitos, sin el código de país). Orden: comunidad hispana primero.
export const COUNTRIES = [
  { iso: 'CO', name: 'Colombia',            dial: '57',  flag: '🇨🇴', min: 10, max: 10 },
  { iso: 'MX', name: 'México',              dial: '52',  flag: '🇲🇽', min: 10, max: 10 },
  { iso: 'AR', name: 'Argentina',           dial: '54',  flag: '🇦🇷', min: 10, max: 11 },
  { iso: 'PE', name: 'Perú',                dial: '51',  flag: '🇵🇪', min: 9,  max: 9  },
  { iso: 'CL', name: 'Chile',               dial: '56',  flag: '🇨🇱', min: 9,  max: 9  },
  { iso: 'EC', name: 'Ecuador',             dial: '593', flag: '🇪🇨', min: 9,  max: 9  },
  { iso: 'VE', name: 'Venezuela',           dial: '58',  flag: '🇻🇪', min: 10, max: 10 },
  { iso: 'BO', name: 'Bolivia',             dial: '591', flag: '🇧🇴', min: 8,  max: 8  },
  { iso: 'PY', name: 'Paraguay',            dial: '595', flag: '🇵🇾', min: 9,  max: 9  },
  { iso: 'UY', name: 'Uruguay',             dial: '598', flag: '🇺🇾', min: 8,  max: 8  },
  { iso: 'PA', name: 'Panamá',              dial: '507', flag: '🇵🇦', min: 7,  max: 8  },
  { iso: 'CR', name: 'Costa Rica',          dial: '506', flag: '🇨🇷', min: 8,  max: 8  },
  { iso: 'GT', name: 'Guatemala',           dial: '502', flag: '🇬🇹', min: 8,  max: 8  },
  { iso: 'HN', name: 'Honduras',            dial: '504', flag: '🇭🇳', min: 8,  max: 8  },
  { iso: 'SV', name: 'El Salvador',         dial: '503', flag: '🇸🇻', min: 8,  max: 8  },
  { iso: 'NI', name: 'Nicaragua',           dial: '505', flag: '🇳🇮', min: 8,  max: 8  },
  { iso: 'DO', name: 'Rep. Dominicana',     dial: '1',   flag: '🇩🇴', min: 10, max: 10 },
  { iso: 'PR', name: 'Puerto Rico',         dial: '1',   flag: '🇵🇷', min: 10, max: 10 },
  { iso: 'US', name: 'Estados Unidos',      dial: '1',   flag: '🇺🇸', min: 10, max: 10 },
  { iso: 'ES', name: 'España',              dial: '34',  flag: '🇪🇸', min: 9,  max: 9  },
  { iso: 'BR', name: 'Brasil',              dial: '55',  flag: '🇧🇷', min: 10, max: 11 },
];

export const DEFAULT_COUNTRY = 'CO';

export function findCountry(iso) {
  return COUNTRIES.find((c) => c.iso === iso) || COUNTRIES[0];
}
