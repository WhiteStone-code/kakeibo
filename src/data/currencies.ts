export interface CurrencyDef {
  code: string;
  name: string;
}

// Lista amplia de divisas ISO 4217 activas. El símbolo y formato (posición,
// decimales — p. ej. JPY sin decimales) los resuelve Intl.NumberFormat a
// partir del código, así que aquí solo hace falta código + nombre.
export const CURRENCIES: CurrencyDef[] = [
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'CHF', name: 'Franco suizo' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'JPY', name: 'Yen japonés' },
  { code: 'CNY', name: 'Yuan chino' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'ARS', name: 'Peso argentino' },
  { code: 'COP', name: 'Peso colombiano' },
  { code: 'CLP', name: 'Peso chileno' },
  { code: 'PEN', name: 'Sol peruano' },
  { code: 'UYU', name: 'Peso uruguayo' },
  { code: 'BOB', name: 'Boliviano' },
  { code: 'PYG', name: 'Guaraní paraguayo' },
  { code: 'VES', name: 'Bolívar venezolano' },
  { code: 'GTQ', name: 'Quetzal guatemalteco' },
  { code: 'HNL', name: 'Lempira hondureño' },
  { code: 'NIO', name: 'Córdoba nicaragüense' },
  { code: 'CRC', name: 'Colón costarricense' },
  { code: 'PAB', name: 'Balboa panameño' },
  { code: 'DOP', name: 'Peso dominicano' },
  { code: 'CUP', name: 'Peso cubano' },
  { code: 'BRL', name: 'Real brasileño' },
  { code: 'CAD', name: 'Dólar canadiense' },
  { code: 'AUD', name: 'Dólar australiano' },
  { code: 'NZD', name: 'Dólar neozelandés' },
  { code: 'SEK', name: 'Corona sueca' },
  { code: 'NOK', name: 'Corona noruega' },
  { code: 'DKK', name: 'Corona danesa' },
  { code: 'ISK', name: 'Corona islandesa' },
  { code: 'PLN', name: 'Zloty polaco' },
  { code: 'CZK', name: 'Corona checa' },
  { code: 'HUF', name: 'Florín húngaro' },
  { code: 'RON', name: 'Leu rumano' },
  { code: 'BGN', name: 'Lev búlgaro' },
  { code: 'HRK', name: 'Kuna croata' },
  { code: 'RSD', name: 'Dinar serbio' },
  { code: 'UAH', name: 'Grivna ucraniana' },
  { code: 'RUB', name: 'Rublo ruso' },
  { code: 'TRY', name: 'Lira turca' },
  { code: 'ILS', name: 'Nuevo shéquel israelí' },
  { code: 'AED', name: 'Dírham de EAU' },
  { code: 'SAR', name: 'Riyal saudí' },
  { code: 'QAR', name: 'Riyal catarí' },
  { code: 'KWD', name: 'Dinar kuwaití' },
  { code: 'BHD', name: 'Dinar bareiní' },
  { code: 'OMR', name: 'Rial omaní' },
  { code: 'JOD', name: 'Dinar jordano' },
  { code: 'EGP', name: 'Libra egipcia' },
  { code: 'MAD', name: 'Dírham marroquí' },
  { code: 'DZD', name: 'Dinar argelino' },
  { code: 'TND', name: 'Dinar tunecino' },
  { code: 'ZAR', name: 'Rand sudafricano' },
  { code: 'NGN', name: 'Naira nigeriana' },
  { code: 'KES', name: 'Chelín keniano' },
  { code: 'GHS', name: 'Cedi ghanés' },
  { code: 'ETB', name: 'Birr etíope' },
  { code: 'XOF', name: 'Franco CFA (BCEAO)' },
  { code: 'XAF', name: 'Franco CFA (BEAC)' },
  { code: 'INR', name: 'Rupia india' },
  { code: 'PKR', name: 'Rupia pakistaní' },
  { code: 'BDT', name: 'Taka bangladesí' },
  { code: 'LKR', name: 'Rupia esrilanquesa' },
  { code: 'NPR', name: 'Rupia nepalí' },
  { code: 'IDR', name: 'Rupia indonesia' },
  { code: 'MYR', name: 'Ringgit malasio' },
  { code: 'SGD', name: 'Dólar de Singapur' },
  { code: 'THB', name: 'Baht tailandés' },
  { code: 'VND', name: 'Dong vietnamita' },
  { code: 'PHP', name: 'Peso filipino' },
  { code: 'KRW', name: 'Won surcoreano' },
  { code: 'TWD', name: 'Nuevo dólar taiwanés' },
  { code: 'HKD', name: 'Dólar de Hong Kong' },
  { code: 'MOP', name: 'Pataca de Macao' },
  { code: 'MMK', name: 'Kyat birmano' },
  { code: 'KHR', name: 'Riel camboyano' },
  { code: 'LAK', name: 'Kip laosiano' },
  { code: 'MNT', name: 'Tugrik mongol' },
  { code: 'KZT', name: 'Tenge kazajo' },
  { code: 'UZS', name: 'Som uzbeko' },
  { code: 'GEL', name: 'Lari georgiano' },
  { code: 'AMD', name: 'Dram armenio' },
  { code: 'AZN', name: 'Manat azerbaiyano' },
  { code: 'ISK', name: 'Corona islandesa' },
  { code: 'ALL', name: 'Lek albanés' },
  { code: 'MKD', name: 'Denar macedonio' },
  { code: 'BAM', name: 'Marco convertible bosnio' },
  { code: 'MDL', name: 'Leu moldavo' },
  { code: 'BYN', name: 'Rublo bielorruso' },
  { code: 'FJD', name: 'Dólar fiyiano' },
  { code: 'PGK', name: 'Kina papú' },
];

// Las más habituales van fijas arriba (en este orden); el resto se
// alfabetiza detrás. Sin esto, el listado alfabético completo entierra el
// euro y el dólar bajo divisas mucho menos usadas.
const PRIORITY_CODES = ['EUR', 'USD', 'CHF', 'GBP', 'JPY', 'CNY', 'MXN', 'BRL', 'CAD', 'AUD'];

// Elimina posibles duplicados por código (p. ej. ISK aparecía dos veces)
const seen = new Set<string>();
const deduped = CURRENCIES.filter((c) => {
  if (seen.has(c.code)) return false;
  seen.add(c.code);
  return true;
});

const priority = PRIORITY_CODES.map((code) => deduped.find((c) => c.code === code)).filter(
  (c): c is CurrencyDef => Boolean(c)
);
const rest = deduped
  .filter((c) => !PRIORITY_CODES.includes(c.code))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

export const UNIQUE_CURRENCIES: CurrencyDef[] = [...priority, ...rest];

export const getCurrencyName = (code: string): string =>
  UNIQUE_CURRENCIES.find((c) => c.code === code)?.name ?? code;
