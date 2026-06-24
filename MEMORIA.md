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
| Formato **vertical** (retrato, tipo celular) | El `#app` mide ~430px de ancho; selección en 2 columnas con scroll y juego en retrato, igual que el video. |
| Motor refactorizado a `crearPartida()` | Una "fábrica" de partidas independientes; el mismo código sirve para 1 jugador y para cada mitad del modo 2 jugadores (DRY). |
| 2 jugadores **local en pantalla dividida** | El online (2 PCs) necesitaría servidor (WebSockets), prohibido en HTML/CSS/JS puro. Local: J1 tecla A, J2 tecla L. |
| Menú deportivo animado (solo CSS) | Reflectores giratorios, cancha con franjas en movimiento, balón que rebota, título con brillo metálico y botones con glow. Respeta `prefers-reduced-motion`. |
| Selección y fin también deportivos | Clase `.pantalla--estadio` (fondo compartido), tarjetas con entrada en cascada + glow + insignia ✓, puntaje con "pop", título con sacudida y **confeti** al lograr récord/ganar (clase `.celebrando`). |
| Regla estricta de impacto (if/else sin escape) | Un clic fuera del balón, o espacio fuera de la zona de alcance, ya no se ignora: termina la partida de inmediato (`fallar()`). Antes un fallo simplemente no hacía nada y se podía "spamear" sin riesgo. |
| **CSS segmentado en 8 archivos** | El `styles.css` único ya pasaba de 800 líneas y era difícil de explicar en la defensa o de revisar en equipo. Se partió por responsabilidad (variables, layout, componentes, menú, selección, juego, fin, utilidades), numerados `01`–`08` para que el número marque también el **orden de carga** (la cascada de CSS depende de ese orden). Detalle completo en [`css/README.md`](css/README.md). |
| "Sazón" como módulo separado de la física (`sazon.js`) | Se pidió integrar un mecanismo de mensajes de hinchada/hitos (inspirado en una propuesta externa con variables que no existían en este proyecto, como `ballTop` o `juegoActivo`). En vez de pegarlo tal cual, `crearPartida()` ganó un gancho opcional `alAnotar(info)` que solo REPORTA datos (puntaje, si fue un toque "raspando" el borde, el contenedor visual, y una función `pausar`); toda la personalidad (textos, cuándo mostrarlos) vive en `sazon.js`, que no toca física ni canvas. Así el motor se mantiene neutral y la "sazón" se puede cambiar de tono sin riesgo de romper el juego. |
| Himno sintetizado (no audio remoto) | La propuesta original cargaba un sonido desde una URL de Google. Eso rompería el "100% offline" que ya promete el README y agrega una dependencia de red innecesaria. Se reemplazó por `Sonidos.himno()`, un arpegio generado con la misma Web Audio API que ya usábamos. |
| Sin "victoria a las 21 dominadas" | La propuesta original mantenía esa regla de un diseño distinto (puntaje con tope). Nuestro juego es de **puntaje infinito** (compites contra tu récord), así que esa regla no aplicaba y no se portó. |
| Campo `foto` opcional por jugador (no incluido en el repo) | Se pidió poder ver una foto real de Messi en vez del muñeco. Subir una foto real e identificable a un repositorio público implica riesgo de derechos de imagen, así que en vez de incluir el archivo se construyó **todo el sistema técnico**: `jugadores.js` documenta un campo opcional `foto`, `juego.js` lo carga con caché (`obtenerFotoJugador`) y lo dibuja (`dibujarAvatarConFoto`) si existe, cayendo de vuelta al muñeco vectorial (`dibujarAvatarVectorial`) si no hay archivo o todavía no cargó. El archivo en sí lo coloca cada quien de forma local/privada — nunca se sube al repo. |
| Balón de fútbol realista (no una esfera plana) | El balón era un círculo blanco con un punto negro: se veía plano. Se rediseñó `dibujarBalon()` para que parezca un balón real: base con **gradiente radial** (sombreado 3D, luz fija arriba-izquierda), **paneles de pentágonos** estilo "Telstar" con costuras, **brillo especular** y contorno, todo recortado al círculo (`clip`). El balón ahora **gira** (`balon.angulo`, integrado en `actualizar()` a partir de la velocidad) para que se note el movimiento. Se añadió `dibujarSombraBalon()` (sombra elíptica que se encoge con la altura → profundidad) y un gradiente al césped. Todo se dibuja por código, sin imágenes. |

---

## 🗂️ Mapa de archivos (qué hace cada uno)

- `data/jugadores.js` → catálogo de los 10 avatares (solo datos). Incluye un
  campo opcional `foto` (comentado por defecto) para quien quiera usar una
  imagen real local en vez del muñeco vectorial.
- `data/dificultades.js` → parámetros de los 3 niveles (solo datos).
- `utils.js` → helpers genéricos: `buscar`, `leerRecord`, `limitar`, `distancia`.
- `sonidos.js` → módulo `Sonidos` (Web Audio): `toque`, `record`, `gameOver`,
  `boton`, `alternarMute`.
- `avatares.js` → `crearSvgAvatar`, `construirPantallaSeleccion`.
- `sazon.js` → módulo `Sazon`: `alAnotar(info)` decide elogios, sustos,
  el despiste de las 10 dominadas y el himno de las 100. No toca física.
- `juego.js` → `crearPartida()` (fábrica reutilizable con física + dibujo,
  incluye `tocarEn`/`tocarCentro`/`fallar` para la regla estricta de impacto,
  y `pausar()`/el gancho `opciones.alAnotar` que usa `sazon.js`) y el
  controlador `Juego` del modo 1 jugador.
- `dosjugadores.js` → `Juego2P`: dos partidas a la vez en pantalla dividida.
- `main.js` → coordina pantallas, dificultad, sonido y ambos modos:
  `mostrarPantalla`, `seleccionarDificultad`, `comenzarPartida`,
  `comenzarRonda2P`, `mostrarResultado2P`, `alternarSonido`.

### Cómo se conecta "sazón" al motor (para no acoplar personalidad y física)

`crearPartida(lienzo, jugador, dificultad, opciones)` recibe un 4to parámetro
opcional. Si `opciones.alAnotar` existe, se llama **cada vez que se acierta un
toque** con:
```js
{ puntaje, jugador, fueRasguno, contenedor, pausar }
```
- `fueRasguno`: true si el toque acertó pero raspando el borde de la zona
  válida (en clic: la distancia quedó en el 20% más externo del margen
  permitido; en teclado: el balón estaba en el 20% más cercano al límite real
  de derrota). Se compara contra ese 20% proporcional y NO contra un número
  fijo de píxeles porque, cerca del suelo, el balón avanza varios píxeles por
  fotograma — un margen fijo pequeño (se probó con 4px) podía "saltarse"
  entre un fotograma y el siguiente y nunca detectarse. Esto se encontró y
  corrigió mientras se probaba la integración (ver pruebas más abajo).
- `contenedor`: el elemento HTML donde mostrar el mensaje — `crearPartida()`
  lo calcula solo (`lienzo.closest(".campo-2p, .pantalla")`), así que en 2
  jugadores cada partida apunta a SU mitad de la pantalla, no a la pantalla
  completa.
- `pausar(ms, impulso)`: congela esa partida (sin terminarla) por `ms`
  milisegundos; al volver, le da al balón la velocidad vertical `impulso`.
  Mientras está pausada, ningún clic/tecla cuenta ni a favor ni en contra
  (se verificó: 200 fotogramas en pausa no la matan, y un toque "fallido"
  durante la pausa se ignora en vez de terminar la partida).

`Juego.iniciar()` y `Juego2P.iniciar()` simplemente pasan
`{ alAnotar: Sazon.alAnotar }` al crear cada partida — si en el futuro se
quita o cambia `sazon.js`, el motor sigue funcionando exactamente igual sin
tocar una línea de `juego.js`.

### CSS (9 archivos, cargados en `index.html` en este orden exacto)

1. `css/01-variables.css` → `:root` (colores, radio, fuente), reset, fondo
   general con reflectores.
2. `css/02-layout.css` → `#app` y el sistema de pantallas (`.pantalla`,
   `.pantalla--activa`).
3. `css/03-componentes.css` → títulos, subtítulos y botones reutilizables.
4. `css/04-menu-inicio.css` → decoración animada SOLO de la portada (cancha,
   reflectores, balón que bota, chip de récord).
5. `css/05-seleccion.css` → tarjetas de avatar, selector de dificultad,
   botón de sonido.
6. `css/06-juego.css` → marcador/lienzo de 1 jugador, pantalla dividida de 2
   jugadores, y el fondo de estadio + confeti que comparten selección/fin
   (necesita cargar después de `05-seleccion.css` para ganarle la cascada en
   las clases que se repiten, como `.tarjeta-avatar`).
7. `css/07-fin.css` → pantalla de Game Over (puntaje, motivo, récord).
8. `css/08-utilidades.css` → `.oculto`, `prefers-reduced-motion`, responsive.
   Va al final a propósito: son los "ajustes finales" que deben poder
   sobreescribir cualquier cosa anterior.
9. `css/09-sazon.css` → estilo del texto flotante de `sazon.js`. Se agregó
   `position: relative` a `.campo-2p` (en `06-juego.css`) para que ese texto
   quede confinado a la mitad del jugador correspondiente en modo 2P.

> Mientras se dividía, se notó que `.tarjeta-avatar { position: relative }`
> estaba declarado dos veces en el archivo original (una vez junto a la
> insignia ✓ y otra vez suelta debajo). Se unificó en una sola regla dentro
> de `06-juego.css` sin cambiar el resultado visual — es la única limpieza
> que se hizo durante la segmentación, todo lo demás es el mismo CSS
> reorganizado.

---

## ⚙️ Parámetros de física (para ajustar la dificultad)

La gravedad, fuerza y tolerancia ahora viven por nivel en
`js/data/dificultades.js` (Fácil / Normal / Difícil). En `js/juego.js` solo
quedan las constantes que no dependen del nivel:
- `RADIO_BALON = 22`, `TOLERANCIA_BASE = 10` (zona de clic ajustada para más
  dificultad). La tolerancia total = `TOLERANCIA_BASE + control*1.5 +
  toleranciaExtra` del nivel.
- La gravedad sube `incremento` (según nivel) cada **8 dominadas** (8, 16, 24…),
  hasta `gravedadMaxima`.
- **Regla estricta:** un clic/tap que no caiga dentro de `RADIO_BALON +
  tolerancia()` (alrededor del balón) es falta inmediata. Por teclado, la
  "zona" es de tiempo, no de espacio: `zonaAlcance()` define una banda
  vertical cerca del suelo (del mismo tamaño que la tolerancia del clic); si
  presionas espacio y el balón no está en esa banda, también es falta.

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
- [x] Formato vertical (retrato).
- [x] Motor refactorizado a `crearPartida()` (reutilizable).
- [x] Modo 2 jugadores en pantalla dividida (local) con ganador.
- [x] Regla estricta de impacto: clic o espacio fuera de la zona = game over
      inmediato (verificado con pruebas de física deterministas, sin rAF).
- [x] CSS segmentado en 9 archivos por responsabilidad (verificado: las 9
      hojas cargan en orden y los estilos computados no cambiaron).
- [x] "Sazón" (elogios, sustos, despiste a las 10, himno a las 100) integrada
      vía un gancho `alAnotar` que no acopla personalidad con física.
      Verificado con pruebas deterministas: evento se dispara con la forma
      correcta, las 4 ramas de `Sazon.alAnotar` se probaron por separado, y
      `pausar()` realmente congela e ignora toques durante la pausa.
- [x] Soporte opcional de foto real por jugador (campo `foto`, con fallback
      automático al muñeco vectorial). Verificado con pruebas deterministas:
      sin `foto` definida, con una ruta que no existe, y con una imagen ya
      cargada — las tres ramas dibujan sin lanzar errores en consola.
- [x] Balón de fútbol realista: paneles de pentágonos, sombreado 3D, brillo,
      giro según la velocidad y sombra en el suelo. Césped con gradiente.
      Verificado en navegador (captura ampliada del balón) sin errores.
- [ ] Mapa del mundo (fase 2).

---

## 🔜 Pendientes / ideas

- Añadir efecto de sonido al tocar el balón y al perder.
- Mostrar combos (toques rápidos seguidos).
- Guardar récord por jugador (no solo global).
- Fase 2: mapa interactivo de 7 países con minijuegos distintos.
