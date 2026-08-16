/** Icono de WhatsApp en su verde de marca — para que el botón de "enviar
 * por WhatsApp" se reconozca de un vistazo en vez de ser solo texto. SVG
 * propio y simplificado (sin usar el logo oficial con derechos), en el
 * mismo estilo que usan la mayoría de botones "compartir por WhatsApp" en
 * la web. */
export default function WhatsappIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="#25D366" aria-hidden>
      <path d="M16.04 4C9.4 4 4 9.37 4 15.98c0 2.11.56 4.09 1.53 5.8L4 28l6.4-1.67a12.04 12.04 0 0 0 5.64 1.4h.01c6.64 0 12.03-5.37 12.03-11.98C28.08 9.37 22.68 4 16.04 4zm0 21.9h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.79.99 1.01-3.7-.24-.38a9.9 9.9 0 0 1-1.52-5.24c0-5.48 4.46-9.94 9.96-9.94 2.66 0 5.16 1.04 7.04 2.92a9.86 9.86 0 0 1 2.92 7.03c0 5.48-4.46 9.91-9.96 9.91z" />
      <path d="M21.2 18.3c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.19.29-.76.95-.93 1.14-.17.19-.34.22-.63.07-.29-.15-1.24-.46-2.36-1.46a8.86 8.86 0 0 1-1.63-2.03c-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44s1.04 2.83 1.19 3.02c.15.19 2.05 3.13 4.97 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.55-.08 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.13-.26-.2-.55-.35z" />
    </svg>
  );
}
