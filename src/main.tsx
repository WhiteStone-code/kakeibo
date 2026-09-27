import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Las fuentes van importadas aquí, en JS, y NO como @import dentro de
// index.css — hallazgo real de auditoría: cuando @tailwindcss/postcss
// procesa un @import de node_modules, inlina su contenido textualmente en
// vez de dejar que Vite lo trate como un fichero CSS propio, así que las
// referencias url(./files/...woff2) de @fontsource se quedan resueltas
// contra la carpeta de index.css en vez de la de @fontsource — la fuente
// nunca llegaba a dist/ y la app caía en fuentes de sistema en TODAS las
// visitas desde que se añadieron, sin que se notara a simple vista.
// Importándolas como módulos JS, Vite las procesa como su propio fichero
// CSS y sí resuelve/copia los .woff2/.woff correctamente.
import '@fontsource/baloo-2/400.css'
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
