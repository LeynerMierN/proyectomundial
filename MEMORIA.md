# 🧾 Memoria del Proyecto — Mundial de Dominadas

Bitácora viva del proyecto. Se actualiza a medida que avanzamos. Aquí queda
registrado **qué decidimos, por qué, y qué falta**, para que cualquiera (o el
equipo en la defensa) entienda el razonamiento detrás del código.

---

## 📌 Visión general

- **Objetivo final:** un "Mundial" de minijuegos deportivos: un mapa con 7
  países, cada uno con una actividad (USA → dominadas, Colombia → penaltis,
  Europa → cabezazos, etc.).
- **Entrega actual (fase 1):** el minijuego de **dominadas** completo y pulido,
  con selección de 10 avatares y sistema de puntuación/récord.

---

## 🧱 Decisiones de diseño y por qué

| Decisión | Motivo |
|----------|--------|
| HTML/CSS/JS Vanilla, sin frameworks | Requisito del curso y portabilidad total. |
| Avatares en **SVG por código** (no fotos) | Evita derechos de imagen, sin descargas, offline. |
| Juego en **`<canvas>`** | Animación fluida con `requestAnimationFrame` y física simple. |
| Un archivo por responsabilidad | Cumple el rubric de orden (15%) y modularidad (25%). |
| Récord en `localStorage` | Persistencia sin backend. |
| Estadística de "control" por jugador | Hace que elegir avatar tenga impacto real en el juego. |
| Sonidos con **Web Audio API** (no .mp3) | Sin archivos ni descargas; solo HTML/CSS/JS y offline. |
| Dificultad en `data/dificultades.js` | Separar el balance (datos) de la lógica; fácil de ajustar. |
| Fondo de estadio dibujado en canvas | Inspirado en un video de referencia (estadio + contador grande). |

---

## 🗂️ Mapa de archivos (qué hace cada uno)

- `data/jugadores.js` → catálogo de los 10 avatares (solo datos).
- `data/dificultades.js` → parámetros de los 3 niveles (solo datos).
- `utils.js` → helpers genéricos: `buscar`, `leerRecord`, `limitar`, `distancia`.
- `sonidos.js` → módulo `Sonidos` (Web Audio): `toque`, `record`, `gameOver`,
  `boton`, `alternarMute`.
- `avatares.js` → `crearSvgAvatar`, `construirPantallaSeleccion`.
- `juego.js` → módulo `Juego` con la física y el dibujo del estadio:
  `actualizarFisica`, `patearBalon`, `dibujarEscena`, `bucle`, etc.
- `main.js` → coordina pantallas, dificultad y sonido: `mostrarPantalla`,
  `seleccionarDificultad`, `comenzarPartida`, `mostrarResultado`, `alternarSonido`.

---

## ⚙️ Parámetros de física (para ajustar la dificultad)

La gravedad, fuerza y tolerancia ahora viven por nivel en
`js/data/dificultades.js` (Fácil / Normal / Difícil). En `js/juego.js` solo
quedan las constantes que no dependen del nivel:
- `RADIO_BALON = 24`, `TOLERANCIA_BASE = 22`.
- La gravedad sube `incremento` (según nivel) cada 5 dominadas, hasta
  `gravedadMaxima`.

> Si un nivel se siente muy difícil/fácil, edita su objeto en `dificultades.js`.

---

## ✅ Progreso

- [x] Brainstorming y arquitectura.
- [x] Estructura de carpetas y `index.html`.
- [x] Estilos (`styles.css`).
- [x] Datos de los 10 avatares.
- [x] Generación de avatares SVG + pantalla de selección.
- [x] Lógica del juego (física, bucle, puntuación, récord).
- [x] Pantalla de Game Over con reinicio y cambio de avatar.
- [x] README, memoria y presentación.
- [x] Pruebas en navegador (flujo, puntuación, dificultad, mute) sin errores.
- [x] Niveles de dificultad (Fácil / Normal / Difícil).
- [x] Sonidos con Web Audio API + botón de silenciar.
- [x] Fondo de estadio y contador grande (inspirado en video de referencia).
- [ ] Mapa del mundo (fase 2).

---

## 🔜 Pendientes / ideas

- Añadir efecto de sonido al tocar el balón y al perder.
- Mostrar combos (toques rápidos seguidos).
- Guardar récord por jugador (no solo global).
- Fase 2: mapa interactivo de 7 países con minijuegos distintos.
