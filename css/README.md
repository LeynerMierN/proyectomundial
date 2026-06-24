# 🎨 CSS del Mundial de Dominadas

Antes había **un solo archivo `styles.css` de más de 800 líneas**. Se dividió
en **9 archivos**, uno por responsabilidad, para que cada parte se pueda
explicar por separado y sea más fácil encontrar qué tocar.

## ⚠️ El orden importa (cascada de CSS)

Los 8 archivos se cargan en `index.html` con `<link>` **en este orden exacto**.
Si dos archivos definen la misma clase con la misma especificidad, **gana el
que carga después**. Por eso los archivos están numerados (01, 02, 03…): ese
número ES el orden de carga, no solo un nombre bonito.

## 📁 Mapa de archivos

| Archivo | Qué contiene | Se usa en |
|---|---|---|
| `01-variables.css` | Paleta de colores (`:root`), reset básico, fondo general con reflectores. | Toda la app |
| `02-layout.css` | El contenedor `#app` y el sistema de pantallas (`.pantalla`, `.pantalla--activa`). | Toda la app |
| `03-componentes.css` | Títulos, subtítulos y los botones reutilizables (principal/secundario). | Toda la app |
| `04-menu-inicio.css` | Decoración animada de la portada: cancha, reflectores, balón que bota, chip de récord. | Pantalla de inicio |
| `05-seleccion.css` | Tarjetas de avatar, selector de dificultad, botón de sonido. | Selección de jugador |
| `06-juego.css` | Marcador y lienzo de 1 jugador, pantalla dividida de 2 jugadores, y el fondo de estadio + confeti que comparten selección/fin. | Juego (1 y 2 jugadores) |
| `07-fin.css` | Pantalla de Game Over: puntaje, motivo, mensaje de récord, botones. | Game Over (1 jugador) |
| `08-utilidades.css` | Clase `.oculto`, accesibilidad (`prefers-reduced-motion`) y ajustes para pantallas angostas. | Toda la app (va al final a propósito) |
| `09-sazon.css` | Estilo del texto flotante de "sazón" (elogios, sustos, hitos) que muestra `js/sazon.js`. | Juego (1 y 2 jugadores) |

## 🧠 ¿Por qué `06-juego.css` incluye cosas de selección y fin?

El bloque "energía deportiva compartida" (fondo de estadio, entrada animada de
las tarjetas, confeti) se usa en **selección, juego y fin** a la vez. Vive en
`06-juego.css` porque en el archivo original estaba justo ahí, ya que algunas
de esas reglas **necesitan cargar después** de `05-seleccion.css` para
ganarle la cascada (por ejemplo, la animación de entrada de `.tarjeta-avatar`
se suma a su estilo base). Si lo más relacionado con la selección de avatar
estuviera en un archivo cargado antes que `05-seleccion.css`, esas animaciones
no se verían.

## ¿Cómo agrego un estilo nuevo?

1. Busca en la tabla de arriba qué archivo le corresponde por tema.
2. Si no encaja en ninguno, créalo como un archivo nuevo y agrégalo en
   `index.html` **en el orden correcto** según qué otras reglas necesite
   sobreescribir.
3. Usa siempre las variables de `01-variables.css` (`var(--color-acento)`,
   etc.) en vez de escribir colores sueltos, así un cambio de paleta se
   propaga a todo el juego.
