# 🎤 Presentación — Cómo construimos "Mundial de Dominadas"

Guía para la **defensa del proyecto**: explica paso a paso cómo se hizo, cómo
funciona el código y cómo se usó la IA. Sigue los 5 pasos sugeridos en el
enunciado del curso.

---

## Paso 1 — Brainstorming (lápiz y papel)

**Pregunta inicial:** ¿qué juego hacemos con HTML/CSS/JS que sea simple pero
divertido y temático de fútbol?

**Idea elegida:** *dominadas* (keepie-uppie). Reglas básicas definidas antes de
programar:
- El balón cae; el jugador lo toca para subirlo.
- Cada toque suma; si cae al suelo, se pierde.
- 10 avatares de futbolistas de distintas naciones.
- La dificultad sube con el tiempo.

**Bocetos de pantallas:** Inicio → Selección de avatar → Juego → Game Over.

---

## Paso 2 — Setup (Git)

- Repositorio: `https://github.com/LeynerMierN/proyectomundial.git`.
- Estructura de carpetas creada: `css/`, `js/`, `js/data/`, `assets/`.
- Commits progresivos que muestran el avance (ver historial de Git).

---

## Paso 3 — Estructura y estilos (HTML / CSS)

- `index.html`: una sola página con **4 secciones** (pantallas). Solo una está
  activa a la vez (clase `pantalla--activa`).
- `css/styles.css`: variables de color, layout con flexbox/grid, animaciones de
  transición y diseño responsive.

**Concepto clave:** el "cambio de pantalla" no recarga la página; solo se
muestran/ocultan secciones con CSS y JS.

---

## Paso 4 — Lógica base (JavaScript)

Dividimos el problema grande ("hacer un juego") en problemas pequeños, cada uno
en una función:

### Datos (`data/jugadores.js`)
Arreglo `JUGADORES` con los 10 futbolistas (nombre, país, colores, control…).

### Utilidades (`utils.js`)
- `buscar(selector)` → atajo de `querySelector` (evita repetición, DRY).
- `leerRecord()` / `guardarRecordSiEsMayor()` → récord en `localStorage`.
- `limitar()` y `distancia()` → matemáticas del juego.

### Avatares (`avatares.js`)
- `crearSvgAvatar(jugador)` → dibuja el avatar como SVG usando sus colores.
- `construirPantallaSeleccion()` → genera las 10 tarjetas clicables.

### Juego (`juego.js`) — el corazón
Módulo `Juego` (patrón *IIFE* para encapsular el estado). Funciones clave:
- `actualizarFisica()` → aplica gravedad, mueve el balón, rebota en paredes y
  detecta si tocó el suelo.
- `intentarToque(x, y)` → mide la distancia del clic al balón; si está dentro de
  la tolerancia (que depende del **control** del jugador), llama a `patearBalon`.
- `patearBalon(offsetX)` → impulso hacia arriba + efecto lateral + suma punto.
- `bucle()` → se ejecuta ~60 veces por segundo con `requestAnimationFrame`:
  limpia, actualiza y dibuja cada fotograma.

### Coordinación (`main.js`)
- `mostrarPantalla(id)` → cambia de pantalla.
- `seleccionarTarjeta()`, `comenzarPartida()`, `mostrarResultado()`.
- `conectarEventos()` → conecta todos los botones (event listeners).

---

## Paso 5 — Pulido y depuración

- Sistema de puntuación y récord persistente.
- Pantalla de Game Over con mensaje de "nuevo récord", reintentar y cambiar
  avatar.
- Dificultad progresiva para que el juego no sea monótono.
- Comentarios en todo el código para poder explicarlo.

### Mejoras añadidas (iteración 2)

Inspirados en un juego de referencia (estadio + contador grande), agregamos:

- **Niveles de dificultad** (`data/dificultades.js` + `seleccionarDificultad`
  en `main.js`): Fácil / Normal / Difícil cambian gravedad, fuerza de toque,
  tolerancia y velocidad de incremento. Se eligen antes de jugar.
- **Sonidos** (`sonidos.js`): módulo `Sonidos` con la **Web Audio API**. No usa
  archivos de audio; sintetiza tonos en el momento (`toque` sube de tono con el
  combo, `record`, `gameOver`, `boton`). Botón 🔊/🔇 para silenciar.
- **Fondo de estadio** dibujado en canvas (`dibujarCielo`, `dibujarGradas`,
  `dibujarCesped`, `dibujarContador`): cielo con rayos de sol, gradas con
  público, césped a rayas y un contador grande central.

**Pregunta de defensa típica:** *¿Cómo suenan los efectos sin archivos de audio?*
→ Se crea un `AudioContext` y, por cada efecto, un `OscillatorNode` con una
frecuencia y un `GainNode` con un "fade out" (ver `tono()` en `sonidos.js`).

---

## 🤖 Cómo usamos la IA (y cómo explicar el código)

- **Prompts de arquitectura:** "Actúa como profesor de programación. ¿Cómo
  estructurarías en funciones la lógica de un juego de dominadas en JavaScript?"
- **Generación:** física del balón, avatares SVG, gestión de pantallas.
- **Depuración:** ajuste de los parámetros de gravedad y tolerancia de toque.

> Regla de oro del curso: **debemos poder explicar cada línea**. Por eso el
> código está comentado y dividido en funciones pequeñas con nombres
> descriptivos en español.

### Preguntas típicas de defensa (y dónde está la respuesta)
- *¿Cómo detectas que el balón cayó?* → `actualizarFisica()` en `juego.js`
  (compara `balon.y` con `obtenerSuelo()`).
- *¿Cómo sabes que el clic tocó el balón?* → `intentarToque()` usa `distancia()`.
- *¿Cómo se guarda el récord?* → `guardarRecordSiEsMayor()` en `utils.js`
  usando `localStorage`.
- *¿Por qué SVG y no imágenes?* → derechos de imagen + offline (ver MEMORIA.md).
