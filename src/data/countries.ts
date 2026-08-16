export interface CountryDef {
  id: string;
  name: string;
  flag: string;
}

// Países cubiertos para localizar qué cadenas de supermercado se sugieren
// primero (ver data/stores.ts) — no es una lista cerrada, el usuario
// siempre puede añadir su propia tienda de barrio aunque no esté aquí.
export const COUNTRIES: CountryDef[] = [
  { id: 'ES', name: 'España', flag: '🇪🇸' },
  { id: 'CH', name: 'Suiza', flag: '🇨🇭' },
  { id: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { id: 'FR', name: 'Francia', flag: '🇫🇷' },
  { id: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { id: 'IT', name: 'Italia', flag: '🇮🇹' },
  { id: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
  { id: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
];

export const getCountry = (id: string | null) => COUNTRIES.find((c) => c.id === id) ?? null;
