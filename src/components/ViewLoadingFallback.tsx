/** Se ve una fracción de segundo mientras se descarga el trozo de JS de la
 * vista a la que acabas de entrar (ver App.tsx: cada vista menos el Panel
 * está separada en su propio chunk para que el primer arranque de la app
 * sea más ligero). En cualquier red normal esto apenas parpadea. */
export default function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-soft">
      <span className="w-6 h-6 rounded-full border-2 border-theme border-t-accent animate-spin" aria-hidden />
    </div>
  );
}
