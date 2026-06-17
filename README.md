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
│   └── styles.css          # Todos los estilos visuales
├── js/
│   ├── data/
│   │   ├── jugadores.js     # Datos de los 10 avatares (sin lógica)
│   │   └── dificultades.js  # Parámetros de los 3 niveles de dificultad
│   ├── utils.js            # Funciones de utilidad (localStorage, mates)
│   ├── sonidos.js          # Efectos de sonido (Web Audio API, sin archivos)
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

## 🧠 Decisiones técnicas clave

- **Avatares en SVG generado por código** en lugar de fotos reales: evita
  problemas de derechos de imagen, no requiere descargar archivos y funciona
  offline.
- **`<canvas>` para el juego**: permite una animación fluida del balón con
  `requestAnimationFrame` y física simple (gravedad + impulso + rebotes).
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
- [ ] Mapa del mundo con **7 países**, cada uno con una actividad deportiva
      (USA → dominadas, Colombia → penaltis, Europa → cabezazos, etc.).
- [ ] Tabla de puntuaciones por jugador.
- [ ] Niveles de dificultad seleccionables.
