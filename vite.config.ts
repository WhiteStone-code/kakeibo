import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // En local (npm run dev) la app vive en la raíz — para GitHub Pages
  // (npm run build) vive en /kakeibo/, así que las rutas de assets y el
  // manifest tienen que apuntar ahí o la web publicada carga en blanco.
  const base = command === 'build' ? '/kakeibo/' : '/';

  return {
    base,
    // host: true expone el servidor en la red local (0.0.0.0), no solo en
    // localhost — así el móvil puede abrir la app desde el mismo Wi-Fi.
    server: {
      host: true,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Activa el manifest/service worker también con `npm run dev`, no
        // solo en el build de producción — así se puede probar la
        // instalación en el móvil sin tener que compilar nada.
        devOptions: { enabled: true, type: 'module' },
        includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
        manifest: {
          name: 'Kakeibo — tu diario de dinero',
          short_name: 'Kakeibo',
          description: 'Gestiona tu dinero día a día con calma, objetivos y logros.',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#FAF6F0',
          theme_color: '#7C9473',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
  };
})
