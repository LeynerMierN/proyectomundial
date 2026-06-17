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

---

## 🗂️ Mapa de archivos (qué hace cada uno)

- `data/jugadores.js` → catálogo de los 10 avatares (solo datos).
- `utils.js` → helpers genéricos: `buscar`, `leerRecord`, `limitar`, `distancia`.
- `avatares.js` → `crearSvgAvatar`, `construirPantallaSeleccion`.
- `juego.js` → módulo `Juego` con la física: `actualizarFisica`, `patearBalon`,
  `bucle`, etc.
- `main.js` → coordina pantallas: `mostrarPantalla`, `comenzarPartida`,
  `mostrarResultado`.

---

## ⚙️ Parámetros de física (para ajustar la dificultad)

Definidos en `js/juego.js`:
- `GRAVEDAD_INICIAL = 0.25`, `GRAVEDAD_MAXIMA = 0.55`
- `FUERZA_TOQUE = -9.5`
- `RADIO_BALON = 24`, `TOLERANCIA_BASE = 26`
- La gravedad sube `+0.03` cada 5 dominadas.

> Si el juego se siente muy difícil/fácil, estos son los números a tocar.

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
- [ ] Pruebas en navegador y ajuste fino de dificultad.
- [ ] Sonidos.
- [ ] Mapa del mundo (fase 2).

---

## 🔜 Pendientes / ideas

- Añadir efecto de sonido al tocar el balón y al perder.
- Mostrar combos (toques rápidos seguidos).
- Guardar récord por jugador (no solo global).
- Fase 2: mapa interactivo de 7 países con minijuegos distintos.
