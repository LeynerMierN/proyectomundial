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

### Modo 2 jugadores (iteración 3)

Para permitir que **dos personas jueguen a la vez en la misma computadora**,
refactorizamos el motor con una **fábrica `crearPartida()`** (`juego.js`): cada
llamada devuelve una partida independiente (su balón, puntaje, física y dibujo
sobre su propio canvas). Así el mismo código se reutiliza (DRY):

- **1 jugador** (`Juego`) usa **una** partida.
- **2 jugadores** (`Juego2P` en `dosjugadores.js`) usa **dos** partidas y un solo
  bucle que actualiza ambas. Jugador 1 = tecla **A**, Jugador 2 = tecla **L**.
  Cuando ambos pierden el balón, se comparan puntajes y se declara ganador.

**Pregunta de defensa típica:** *¿Por qué no hay multijugador online?* → Conectar
dos computadoras por internet exige un servidor (p. ej. WebSockets), y el
proyecto es solo HTML/CSS/JS sin backend; por eso el 2 jugadores es **local en
pantalla dividida**.

**Pregunta de defensa típica:** *¿Cómo controla cada quien solo su balón?* → En
`manejarTecla` de `dosjugadores.js`, `KeyA` llama a `partida1.tocarCentro()` y
`KeyL` a `partida2.tocarCentro()`; como cada partida es un objeto aparte, sus
estados nunca se mezclan.

### Regla estricta de impacto (iteración 4)

Al principio, un clic que no caía sobre el balón simplemente **no hacía
nada**: el jugador podía "espamear" clics por toda la pantalla sin
consecuencia, esperando acertar por suerte. Eso le quitaba reto al juego.
Cambiamos la lógica a una estructura **if/else sin escape** en `tocarEn()` y
`tocarCentro()` (`juego.js`):

```js
function tocarEn(x, y) {
  if (!viva) return;
  if (distancia(x, y, balon.x, balon.y) <= RADIO_BALON + tolerancia()) {
    patear(x - balon.x);   // ÉXITO: dentro de la zona del balón
  } else {
    fallar();              // FALTA: termina la partida YA, sin excepciones
  }
}
```

El reto fue la **barra espaciadora**: a diferencia del clic, no tiene
coordenadas (x, y) que comparar contra el balón. La solución fue cambiar la
pregunta de "¿DÓNDE tocaste?" a "¿CUÁNDO tocaste?": `zonaAlcance()` define una
banda vertical cerca del suelo (del mismo tamaño que la tolerancia del clic,
para que la dificultad sea consistente entre ambos controles). Si presionas
espacio y el balón todavía está arriba, fuera de esa banda, también es falta.
Así, tanto clic como teclado **exigen precisión real**, cada uno en su propia
dimensión (espacio para el mouse, tiempo para el teclado).

Para diferenciar "el balón cayó solo" de "el jugador falló", la partida guarda
un `motivoDerrota` (`"suelo"` o `"falla"`), que cambia el mensaje, el color de
la pantalla de Game Over (rojo para falta) y el sonido (`Sonidos.fallo()`, un
doble buzz grave, distinto del tono descendente de `Sonidos.gameOver()`).

**Pregunta de defensa típica:** *¿Cómo probaron que la regla funciona sin
depender de animaciones lentas?* → Llamamos `crearPartida()` directamente y
avanzamos `actualizar()` en un bucle `while` síncrono (sin `requestAnimationFrame`),
lo que simula muchos fotogramas al instante y hace la prueba determinista —
clave para distinguir un bug real de la simple lentitud del navegador al
limitar `requestAnimationFrame` en pestañas en segundo plano.

### CSS segmentado en 9 archivos (iteración 5)

`css/styles.css` llegó a tener más de 800 líneas, lo que lo hacía difícil de
explicar de un tirón en la defensa. Se dividió en 9 archivos por
responsabilidad (`01-variables.css` … `09-sazon.css`), cada uno cargado con su
propio `<link>` en `index.html`, **en un orden que importa**: si dos archivos
definen la misma clase, gana el que carga después (cascada de CSS) — por eso
están numerados. El detalle completo está en
[`css/README.md`](../css/README.md).

**Pregunta de defensa típica:** *¿Cómo verificaron que dividir el CSS no
cambió nada visual?* → No usamos capturas de pantalla (fallaban en esa sesión
de pruebas); en vez de eso, comparamos los **estilos computados**
(`getComputedStyle`) de varios elementos clave (`#app`, `.titulo`,
`.boton--principal`, `.lienzo`) antes y después de la división, y confirmamos
que las 8 (ahora 9) hojas cargaban sin error 404 y en el orden correcto.

### "Sazón": personalidad sin acoplarse a la física (iteración 6)

Se integró una idea de mensajes de hinchada costeña (elogios, sustos al
"raspar" un toque, una mecánica de despiste a las 10 dominadas, y un himno al
llegar a 100) inspirada en una propuesta externa. Esa propuesta no se podía
copiar tal cual: usaba variables que no existen en este proyecto (`ballTop`,
`juegoActivo`, un `<div id="arcade-container">`) y cargaba un audio desde una
URL de Google, lo cual rompería el "100% offline" que promete el README.

En vez de pegar el código, se **adaptó la idea** con un gancho opcional en el
motor: `crearPartida(lienzo, jugador, dificultad, opciones)` ahora acepta
`opciones.alAnotar(info)`, una función que se llama en cada toque acertado con
`{ puntaje, jugador, fueRasguno, contenedor, pausar }`. `juego.js` NO sabe qué
significan esos datos para la "personalidad" del juego — solo los reporta.
Toda la decisión de qué mensaje mostrar y cuándo vive en `sazon.js`, un
archivo nuevo que no toca física ni canvas.

```js
// juego.js — el motor solo REPORTA, no decide:
if (typeof opciones.alAnotar === "function") {
  opciones.alAnotar({ puntaje, jugador, fueRasguno, contenedor, pausar });
}

// sazon.js — la personalidad decide qué hacer con ese reporte:
function alAnotar({ puntaje, jugador, fueRasguno, contenedor, pausar }) {
  if (fueRasguno) mostrarTextoFlotante(contenedor, alAzar(MENSAJES_AZARE), true);
  if (puntaje === 10) { /* despiste */ pausar(1500, -8); return; }
  if (puntaje % 8 === 0) mostrarTextoFlotante(contenedor, alAzar(ELOGIOS_COSTENOS), false);
  if (puntaje === 100) { /* himno */ Sonidos.himno(); }
}
```

Dos cambios respecto a la propuesta original, explicados con su motivo:
- **Himno sintetizado, no descargado:** se reemplazó la URL externa por
  `Sonidos.himno()`, un arpegio generado con la misma Web Audio API que ya
  usa el resto del juego. Mismo efecto, cero dependencia de internet.
- **Sin "victoria a las 21":** esa regla pertenece a un diseño de puntaje
  fijo; el nuestro es de **puntaje infinito** (compites contra tu récord), así
  que no se portó.

Para que el mensaje de cada jugador aparezca sobre SU mitad de la pantalla
(no sobre toda la pantalla) en el modo 2 jugadores, `crearPartida()` calcula
su propio `contenedor` con `lienzo.closest(".campo-2p, .pantalla")`: si el
canvas está dentro de una columna `.campo-2p` (2 jugadores), usa esa columna;
si no, usa la pantalla completa (1 jugador).

**Pregunta de defensa típica:** *¿Cómo decidieron cuándo un toque "raspó" el
borde?* → Para el clic, si la distancia al centro del balón cae en el 20% más
externo del margen permitido. Para el teclado no hay coordenadas, así que se
compara la altura del balón contra el 20% más cercano al límite real de
derrota. Se probó primero con un margen fijo de 4 píxeles y casi nunca se
detectaba: cerca del suelo el balón cae varios píxeles por fotograma, así que
una ventana fija y pequeña se la salta entre un fotograma y el siguiente. Se
cambió a un margen **proporcional** (20% de la banda) y ahí sí se disparaba de
forma consistente — un buen ejemplo de por qué hay que probar con números
reales, no solo confiar en que "se ve bien en la lógica".

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
