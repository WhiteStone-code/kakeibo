export interface EmojiOption {
  emoji: string;
  keywords: string;
}

export interface EmojiGroup {
  label: string;
  options: EmojiOption[];
}

// Biblioteca compartida de iconos para categorías y objetivos — organizada
// por temas y con palabras clave en español para poder buscar. Se amplía
// aquí cuando haga falta; ningún emoji se repite entre grupos.
export const EMOJI_LIBRARY: EmojiGroup[] = [
  {
    label: 'Comida y bebida',
    options: [
      { emoji: '☕', keywords: 'cafe' },
      { emoji: '🍵', keywords: 'te zen' },
      { emoji: '🍺', keywords: 'cerveza bar' },
      { emoji: '🍷', keywords: 'vino' },
      { emoji: '🍕', keywords: 'pizza' },
      { emoji: '🍔', keywords: 'hamburguesa comida rapida' },
      { emoji: '🍣', keywords: 'sushi japones' },
      { emoji: '🍰', keywords: 'tarta pastel dulce' },
      { emoji: '🧋', keywords: 'bubble tea boba' },
      { emoji: '🍦', keywords: 'helado' },
    ],
  },
  {
    label: 'Mascotas y animales',
    options: [
      { emoji: '🐶', keywords: 'perro mascota' },
      { emoji: '🐱', keywords: 'gato mascota' },
      { emoji: '🐹', keywords: 'hamster roedor' },
      { emoji: '🐰', keywords: 'conejo' },
      { emoji: '🐟', keywords: 'pez acuario' },
      { emoji: '🦜', keywords: 'pajaro loro' },
      { emoji: '🐴', keywords: 'caballo hipica' },
      { emoji: '🦎', keywords: 'reptil lagarto' },
      { emoji: '🐾', keywords: 'huellas mascota veterinario' },
    ],
  },
  {
    label: 'Deporte y bienestar',
    options: [
      { emoji: '🏋️', keywords: 'gimnasio pesas' },
      { emoji: '⚽', keywords: 'futbol' },
      { emoji: '🚴', keywords: 'bici ciclismo' },
      { emoji: '🧘', keywords: 'yoga meditacion' },
      { emoji: '🏊', keywords: 'natacion piscina' },
      { emoji: '🥊', keywords: 'boxeo' },
      { emoji: '🏃', keywords: 'correr running' },
      { emoji: '🎾', keywords: 'tenis padel' },
    ],
  },
  {
    label: 'Belleza y cuidado personal',
    options: [
      { emoji: '💇', keywords: 'peluqueria pelo corte' },
      { emoji: '💅', keywords: 'unas manicura' },
      { emoji: '🧴', keywords: 'crema cosmetica' },
      { emoji: '🪒', keywords: 'afeitado barberia' },
      { emoji: '🦷', keywords: 'dentista' },
      { emoji: '💆', keywords: 'masaje spa' },
    ],
  },
  {
    label: 'Hogar',
    options: [
      { emoji: '🏡', keywords: 'casa hogar vivienda' },
      { emoji: '🧹', keywords: 'limpieza' },
      { emoji: '🔧', keywords: 'reparacion bricolaje' },
      { emoji: '🛋️', keywords: 'muebles sofa' },
      { emoji: '🪴', keywords: 'plantas jardin' },
      { emoji: '🧺', keywords: 'lavanderia colada' },
      { emoji: '🕯️', keywords: 'velas decoracion' },
      { emoji: '🛏️', keywords: 'dormitorio cama' },
    ],
  },
  {
    label: 'Tecnología',
    options: [
      { emoji: '💻', keywords: 'ordenador portatil' },
      { emoji: '🖥️', keywords: 'pc escritorio' },
      { emoji: '📱', keywords: 'movil telefono' },
      { emoji: '🎧', keywords: 'auriculares musica' },
      { emoji: '🕹️', keywords: 'videojuegos mando' },
      { emoji: '📷', keywords: 'camara foto' },
      { emoji: '⌚', keywords: 'reloj smartwatch' },
    ],
  },
  {
    label: 'Ocio y hobbies',
    options: [
      { emoji: '🎨', keywords: 'arte pintura' },
      { emoji: '🎸', keywords: 'guitarra musica' },
      { emoji: '📚', keywords: 'libros lectura' },
      { emoji: '🎮', keywords: 'videojuegos consola' },
      { emoji: '🎬', keywords: 'cine pelicula' },
      { emoji: '🧩', keywords: 'puzzle juego mesa' },
      { emoji: '♟️', keywords: 'ajedrez' },
      { emoji: '🎳', keywords: 'bolos' },
    ],
  },
  {
    label: 'Trabajo y estudio',
    options: [
      { emoji: '💼', keywords: 'trabajo oficina' },
      { emoji: '🖊️', keywords: 'papeleria material' },
      { emoji: '🎓', keywords: 'educacion universidad curso' },
      { emoji: '📐', keywords: 'estudio' },
      { emoji: '🗂️', keywords: 'archivo documentos' },
    ],
  },
  {
    label: 'Viajes y transporte',
    options: [
      { emoji: '✈️', keywords: 'avion vuelo viaje' },
      { emoji: '🚗', keywords: 'coche' },
      { emoji: '🚆', keywords: 'tren' },
      { emoji: '⛽', keywords: 'gasolina combustible' },
      { emoji: '🏕️', keywords: 'camping acampada' },
      { emoji: '🏝️', keywords: 'isla playa vacaciones' },
      { emoji: '🧳', keywords: 'maleta viaje' },
      { emoji: '🗺️', keywords: 'mapa turismo' },
      { emoji: '🛵', keywords: 'moto scooter' },
    ],
  },
  {
    label: 'Familia y celebraciones',
    options: [
      { emoji: '👶', keywords: 'bebe' },
      { emoji: '🧸', keywords: 'juguete peluche' },
      { emoji: '🎂', keywords: 'cumpleanos tarta' },
      { emoji: '🎁', keywords: 'regalo' },
      { emoji: '💍', keywords: 'boda anillo' },
      { emoji: '👨‍👩‍👧', keywords: 'familia' },
      { emoji: '🎉', keywords: 'fiesta celebracion' },
      { emoji: '🎄', keywords: 'navidad festividad' },
    ],
  },
  {
    label: 'Caprichos y varios',
    options: [
      { emoji: '🚬', keywords: 'tabaco' },
      { emoji: '🎰', keywords: 'apuestas juego azar' },
      { emoji: '🛒', keywords: 'compras carrito' },
      { emoji: '📦', keywords: 'paquete envio' },
      { emoji: '🧾', keywords: 'recibo factura' },
      { emoji: '🏷️', keywords: 'etiqueta oferta' },
    ],
  },
];

export const ALL_EMOJIS: string[] = EMOJI_LIBRARY.flatMap((g) => g.options.map((o) => o.emoji));
