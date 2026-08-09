# ⛩️ Kakeibo — tu diario de dinero

Prototipo funcional de una app de finanzas personales inspirada en el
**kakeibo** (家計簿), el método japonés de llevar las cuentas del hogar con
calma y propósito (no con culpa). Corre 100% en local, en tu navegador,
sin backend ni cuentas: todo se guarda en `localStorage`.

## Cómo arrancarla

```bash
cd ~/kakeibo
npm run dev
```

Abre **http://localhost:5173** en el navegador. Ctrl+C en la terminal la para.

> Node.js está instalado en `~/.local/opt/node` (no en el sistema, no hacía
> falta sudo) y añadido al PATH en tu `~/.bashrc`. Si abres una terminal
> nueva ya lo tendrás disponible; si no, ejecuta primero:
> `export PATH="$HOME/.local/opt/node/bin:$PATH"`

## Qué tiene ya

- **Panel**: ingresos/gastos/balance del mes, donut de gastos por categoría,
  tendencia de 6 meses, movimientos recientes, consejo diario con mascota.
- **Movimientos**: añadir gasto/ingreso con categoría (comida, compras, ropa,
  social, transporte, vivienda, salud, educación, ocio, suscripciones...),
  nota y fecha; listado agrupado por día.
- **Objetivos**: crea metas (coche, boda, viaje...), aporta dinero, ve el
  progreso, confeti al cumplirlas.
- **Logros**: sistema de niveles (XP por registrar cada día, por movimiento,
  por logro) con rangos temáticos (Aprendiz → Maestro Kakeibo → Leyenda), y
  un álbum de 12 pegatinas/viñetas coleccionables que se van desbloqueando.
- **Reflexión Kakeibo**: las 4 preguntas mensuales del método original
  (disponible / cuánto ahorrar / gasto real / cómo mejorar), con historial.
- **Ajustes**: nombre, moneda, **modo claro/oscuro**, **5 temáticas**
  visuales completas (Zen, Sakura, Neón, Océano, Bosque), exportar/importar
  backup en JSON, borrar todo.
- Racha de días 🔥 y XP visibles siempre en la barra superior.

## Próximos pasos posibles

- Empaquetarla como app de escritorio de verdad (doble clic, sin terminal)
  con **Tauri** o **Electron** — el código de React se reutiliza tal cual.
- Versión móvil con **Capacitor** o **React Native** reutilizando la lógica
  de `src/store` y `src/data`.
- Presupuestos por categoría con avisos ("llevas 80% de tu presupuesto de
  comida").
- Gráficas de progreso del objetivo con fecha estimada de cumplimiento según
  tu ritmo de ahorro actual.
- Sincronización opcional (hoy es 100% local y privado).

## Estructura

```
src/
  types.ts            tipos centrales
  data/               categorías, temas, frases, logros, niveles
  store/useStore.ts   estado global (zustand + localStorage)
  components/         UI (formularios, tarjetas, gráficos, vistas)
```
