# ⚽ Mundial de Dominadas

Videojuego web del curso **AI Engineer – Fundamentos de Programación** (Proyecto 1).
Construido **100% con HTML5, CSS3 y JavaScript Vanilla** (sin librerías ni
frameworks). Funciona offline abriendo `index.html` en cualquier navegador.

> Este es el **primer módulo** de un proyecto más grande ("Mundial" de
> minijuegos deportivos por países). Esta entrega se enfoca en el juego de
> **dominadas**.

---

## 🎮 ¿De qué trata el juego?

Eliges a uno de **10 futbolistas reconocidos** (cada uno de una nación distinta)
y debes mantener el balón en el aire haciendo **dominadas**:

- El balón cae por **gravedad**.
- Tócalo con **clic / tap** o con la **barra espaciadora** para impulsarlo.
- Cada toque = **+1 dominada** (con efecto de sonido que sube de tono).
- La dificultad sube progresivamente (la gravedad aumenta cada 8 dominadas).
- Si el balón toca el suelo → **Game Over**.
- ⚠️ **Regla estricta de impacto:** no hay margen para fallar. Un **clic fuera
  del balón**, o presionar **espacio cuando el balón no está a tu alcance**
  (todavía muy arriba), termina la partida de inmediato como "¡Patada en
  falso!" — igual que si se hubiera caído solo. No se puede "spamear" clics o
  la barra espaciadora esperando suerte.
- Tu **récord** se guarda en el navegador (`localStorage`) y persiste.

Cada jugador tiene una estadística de **control (1–10)**: a mayor control, más
amplia es la zona de toque, así que **elegir avatar cambia la dificultad**.

### 🎚️ Niveles de dificultad
Antes de jugar eliges un nivel que cambia la física:
- 🟢 **Fácil** — cae lento, zona de toque amplia.
- 🟡 **Normal** — equilibrado.
- 🔴 **Difícil** — cae rápido, sin margen extra y sube de dificultad más rápido.

### 👥 Modo 2 jugadores (pantalla dividida)
Dos personas juegan **a la vez en la misma computadora**, cada una en su mitad:
- 🔵 **Jugador 1** impulsa su balón con la tecla **A** (o clic en su campo).
- 🔴 **Jugador 2** con la tecla **L** (o clic en su campo).
- Cuando a alguien se le cae el balón queda "FUERA"; cuando ambos caen, se
  comparan los puntajes y **gana el de más dominadas**.

> Nota: el multijugador *online* (dos computadoras por internet) NO es posible
> con solo HTML/CSS/JS porque requiere un servidor; por eso el 2 jugadores es
> local en pantalla dividida.

### 🔊 Sonidos
Todos los efectos se generan **por código con la Web Audio API** (sin archivos
de audio): toque del balón, récord, game over y clics de botones. Hay un botón
🔊 / 🔇 (arriba a la derecha) para silenciar.

### Avatares disponibles
Messi 🇦🇷 · Cristiano Ronaldo 🇵🇹 · Luis Díaz 🇨🇴 · Mbappé 🇫🇷 · Neymar 🇧🇷 ·
Haaland 🇳🇴 · De Bruyne 🇧🇪 · Salah 🇪🇬 · Modrić 🇭🇷 · Son 🇰🇷

---

## 🕹️ Cómo jugar

1. Abre `index.html` en tu navegador (doble clic).
2. Pulsa **JUGAR**.
3. Elige tu crack y pulsa **¡A jugar!**.
4. Mantén el balón en el aire el mayor tiempo posible.

---

## 📁 Estructura del proyecto

```
proyectomundial/
├── index.html              # Estructura: las 4 pantallas del juego
├── css/
│   ├── README.md            # Mapa rápido de qué hace cada archivo CSS
│   ├── 01-variables.css     # Colores, fuente, reset
│   ├── 02-layout.css        # Contenedor #app y sistema de pantallas
│   ├── 03-componentes.css   # Títulos y botones reutilizables
│   ├── 04-menu-inicio.css   # Decoración animada de la portada
│   ├── 05-seleccion.css     # Tarjetas de avatar y selector de dificultad
│   ├── 06-juego.css         # Juego 1P/2P + estadio y confeti compartidos
│   ├── 07-fin.css           # Pantalla de Game Over
│   ├── 08-utilidades.css    # .oculto, accesibilidad y responsive
│   └── 09-sazon.css         # Texto flotante de "sazón" (elogios/sustos/hitos)
├── js/
│   ├── data/
│   │   ├── jugadores.js     # Datos de los 10 avatares (sin lógica)
│   │   └── dificultades.js  # Parámetros de los 3 niveles de dificultad
│   ├── utils.js            # Funciones de utilidad (localStorage, mates)
│   ├── sonidos.js          # Efectos de sonido (Web Audio API, sin archivos)
│   ├── sazon.js            # "Sazón" costeña: elogios, sustos, hitos (8/10/100)
│   ├── avatares.js         # Genera los SVG y la pantalla de selección
│   ├── juego.js            # Motor: crearPartida() + modo 1 jugador
│   ├── dosjugadores.js     # Modo 2 jugadores (pantalla dividida)
│   └── main.js             # Coordina pantallas, dificultad, sonido y botones
├── assets/                 # Reservada para imágenes/sonidos futuros
├── README.md               # Este archivo
├── MEMORIA.md              # Bitácora y decisiones del proyecto
└── PRESENTACION.md         # Cómo se construyó (para la defensa)
```

La separación sigue el principio de **responsabilidad única**: cada archivo y
cada función hace **una sola cosa bien** (`crearSvgAvatar`, `patearBalon`,
`actualizarFisica`, `mostrarPantalla`, …).

---

## 🌶️ "Sazón": la hinchada que comenta la partida

Mientras juegas, una "voz" costeña reacciona a tus dominadas (`js/sazon.js`):

- 🎉 **Elogio cada 8 dominadas** — un mensaje al azar tipo "¡Monstruo!" o
  "¡Erda, perfecto!".
- 😅 **Susto si "raspas" el toque** — si acertaste pero muy al límite (a punto
  de fallar), aparece un aviso en rojo como "¡Anda, casi la embarras!".
- 😵 **Despiste a las 10 dominadas** — el juego se congela un instante con
  "¿¡CÓMO TE DIGO!?" y al volver te devuelve el balón con un impulso sorpresa.
- 🏆 **Himno al llegar a 100** — un pequeño arpegio triunfal y el aviso
  "¡MODO CHAMPIONS LEAGUE!".

Funciona igual en 1 y 2 jugadores: cada partida tiene su propio mensaje, así
que en 2 jugadores cada quien ve el suyo solo sobre SU mitad de la pantalla.

> **Dos decisiones al integrarlo:** (1) el himno se **sintetiza** con la
> misma Web Audio API que el resto de sonidos, en vez de descargar un audio
> de internet — así el juego sigue funcionando 100% offline. (2) no se portó
> la regla de "ganar a las 21 dominadas": nuestro juego es de puntaje
> infinito (compites contra tu récord), así que ese límite no aplicaba.

## 🖼️ Foto real opcional para el avatar (uso privado/local)

Por defecto cada jugador se dibuja como un muñeco vectorial por código (sin
fotos), para evitar derechos de imagen y mantener el juego 100% offline sin
archivos que descargar. Si igual quieres ver una foto real (por ejemplo, de
Messi) **solo para tu copia local**, el sistema ya está listo:

1. Coloca tu imagen en `assets/jugadores/<id>.png` (ej. `messi.png`).
2. En `js/data/jugadores.js`, descomenta la línea `foto: "assets/..."` del
   jugador correspondiente.
3. Listo: `js/juego.js` detecta el campo `foto`, carga la imagen una sola vez
   (`obtenerFotoJugador`) y la dibuja en `dibujarAvatarConFoto`. Si el archivo
   no existe o aún no cargó, sigue mostrando el muñeco vectorial sin ningún
   error — el cambio es 100% opcional y no rompe nada si no lo usas.

> ⚠️ No se incluye ninguna foto real en este repositorio: son personas reales
> identificables y subir esas imágenes a un repo público sí implica riesgo de
> derechos de imagen. Por eso esta función es solo para **uso privado/local**,
> a discreción de quien clona el proyecto.

## 🎨 CSS dividido en 9 archivos (en vez de uno gigante)

Antes había un único `css/styles.css` de **más de 800 líneas**. Se dividió en
**9 archivos**, uno por responsabilidad (variables, layout, componentes, menú,
selección, juego, fin, utilidades, sazón), para que cada parte se pueda
**explicar por separado** y sea más rápido encontrar qué tocar. El detalle
completo — incluyendo por qué el **orden de carga importa** (cascada de CSS) —
está en [`css/README.md`](css/README.md). En resumen:

| Archivo | Qué contiene |
|---|---|
| `01-variables.css` | Paleta de colores, fuente, reset básico |
| `02-layout.css` | El "celular" `#app` y el sistema de pantallas |
| `03-componentes.css` | Títulos y botones reutilizables en toda la app |
| `04-menu-inicio.css` | Cancha animada, reflectores, balón que bota (portada) |
| `05-seleccion.css` | Tarjetas de avatar y selector de dificultad |
| `06-juego.css` | Juego 1 y 2 jugadores + estadio/confeti compartidos |
| `07-fin.css` | Pantalla de Game Over |
| `08-utilidades.css` | `.oculto`, accesibilidad y ajustes responsive |
| `09-sazon.css` | Texto flotante de elogios/sustos/hitos (`js/sazon.js`) |

> Importante para quien edite el CSS: si dos archivos definen la misma clase,
> **gana el que carga después** en `index.html`. Por eso están numerados.

## 🧠 Decisiones técnicas clave

- **Avatares en SVG/canvas generado por código** en lugar de fotos reales: evita
  problemas de derechos de imagen, no requiere descargar archivos y funciona
  offline. Cada jugador puede tener opcionalmente un campo `foto` (ruta a una
  imagen local) que, si está presente, se dibuja en vez del muñeco — ver
  sección siguiente.
- **`<canvas>` para el juego**: permite una animación fluida del balón con
  `requestAnimationFrame` y física simple (gravedad + impulso + rebotes).
- **Balón de fútbol dibujado por código** (no una imagen): `dibujarBalon()` usa
  un gradiente radial para el sombreado 3D, paneles de pentágonos estilo
  "Telstar" con costuras, un brillo especular y un contorno, todo recortado al
  círculo. El balón **gira** según su velocidad y proyecta una **sombra** en el
  césped que se encoge con la altura, dando sensación de profundidad.
- **Sonidos con Web Audio API**: se sintetizan tonos por código en vez de cargar
  archivos `.mp3`/`.wav`. Cero dependencias y funciona offline.
- **Dificultad como datos**: los 3 niveles viven en `data/dificultades.js`, así
  ajustar el balance no toca la lógica del juego.
- **Sin frameworks**: cumple el requisito de *Vanilla JS* del curso.
- **Estado mínimo y módulos por archivo**: se cargan en orden (datos → utils →
  avatares → juego → main) usando `<script>` clásicos, sin bundlers.

---

## 🤖 Uso de Inteligencia Artificial

Este proyecto fue desarrollado con asistencia de IA (**Claude / Claude Code**),
siguiendo la política del curso: la IA es el copiloto, no el piloto.

- **Brainstorming y arquitectura:** se usó la IA para definir las mecánicas del
  juego, la división en módulos y la estructura de carpetas.
- **Generación de código:** la lógica de física (gravedad, colisiones, toque),
  los avatares SVG y la gestión de pantallas se escribieron con apoyo de la IA.
- **Documentación:** README, comentarios y la memoria del proyecto.

Todo el código está **comentado en español** para poder explicar cada bloque en
la defensa. Ver `PRESENTACION.md` para el detalle del proceso y los prompts.

---

## 🗺️ Próximos pasos (roadmap)

- [x] Niveles de dificultad (Fácil / Normal / Difícil).
- [x] Sonidos y efectos (Web Audio API) con botón de silenciar.
- [x] Fondo de estadio y contador grande (inspirado en juego de referencia).
- [x] Formato vertical (retrato, tipo celular).
- [x] Modo 2 jugadores en pantalla dividida (local).
- [x] Regla estricta de impacto (un fallo es game over inmediato).
- [x] CSS dividido en 9 archivos por responsabilidad (antes un solo archivo
      de 800+ líneas).
- [x] "Sazón": elogios, sustos, despiste a las 10 y himno a las 100 dominadas.
- [ ] Mapa del mundo con **7 países**, cada uno con una actividad deportiva
      (USA → dominadas, Colombia → penaltis, Europa → cabezazos, etc.).
- [ ] Tabla de puntuaciones por jugador.
