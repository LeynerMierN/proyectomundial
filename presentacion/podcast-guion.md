# 🎙️ Podcast: "Cómo construimos Mundial de Dominadas"

> **Cómo usar este guion:** son dos voces (ANA, la profe/guía; y JUNIOR, el
> estudiante que pregunta). Pueden leerlo en voz alta tú y tu compañero para
> estudiar, o pegarlo en una app de **texto-a-voz** (como las voces de tu
> celular, ElevenLabs, NaturalReaders, o el lector de Edge/Word) para escucharlo
> como un episodio real. Duración aproximada leído: 10–12 minutos.
>
> _Nota honesta: yo (la IA) no puedo generar el audio directamente, pero este
> guion está escrito para sonar natural al leerse._

---

## 🎬 Episodio 1 — "El juego por dentro"

**ANA:** ¡Hola y bienvenidos! Hoy vamos a abrir el capó de un videojuego web hecho
solo con HTML, CSS y JavaScript: *Mundial de Dominadas*. Conmigo está uno de sus
creadores. Junior, cuéntanos en una frase: ¿de qué va el juego?

**JUNIOR:** ¡Hola Ana! Es sencillo de jugar pero tiene su truco: eliges un
futbolista y tienes que mantener el balón en el aire haciendo dominadas. Cada
toque suma uno. Si el balón toca el suelo, o si fallas un toque, se acabó.

**ANA:** Me encanta, porque el profesor lo dijo claro en el enunciado: *lo
importante no es el juego más grande, sino el mejor estructurado y comprendido.*
Así que empecemos por la estructura. ¿Cómo está organizado el proyecto?

**JUNIOR:** Tenemos un solo `index.html`, una carpeta `css` y una carpeta `js`.
La idea es que cada archivo tenga **una sola responsabilidad**. Por ejemplo, los
datos de los jugadores están en su propio archivo, separados de la lógica.

**ANA:** Eso conecta directo con dos criterios de evaluación: el orden de las
carpetas y la modularidad. Hablemos de los datos. ¿Qué guardas ahí?

**JUNIOR:** En `data/jugadores.js` hay un arreglo con los 10 futbolistas. Cada uno
es un objeto con su nombre, su país, su bandera, sus colores de camiseta y una
estadística de "control". En `data/dificultades.js` están los tres niveles:
Fácil, Normal y Difícil, cada uno con sus números de física.

**ANA:** Espera, esto es clave. ¿Por qué los niveles de dificultad son *datos* y
no código?

**JUNIOR:** Porque así, si un nivel se siente injusto, solo cambio un número —la
gravedad, por ejemplo— sin tocar la lógica del juego. Separar el "balance" de la
"mecánica" hace todo más fácil de ajustar.

---

## 🔁 El corazón: el bucle del juego

**ANA:** Vamos al corazón. Todo videojuego tiene un "bucle". Explícamelo como si
yo nunca hubiera programado.

**JUNIOR:** Imagina un dibujo animado. Lo que ves moverse en realidad son muchas
imágenes fijas que cambian rápido. Nuestro bucle hace tres cosas, unas 60 veces
por segundo: primero **actualiza** la posición del balón con la gravedad, luego
**dibuja** todo el estadio y el balón, y luego le pide al navegador que lo llame
de nuevo. Una y otra vez.

**ANA:** ¿Y cómo termina ese ciclo infinito?

**JUNIOR:** La función `actualizar` devuelve verdadero o falso. Mientras el balón
siga vivo, devuelve verdadero y el bucle continúa. En el momento en que el balón
toca el suelo, devuelve falso, y ahí el bucle se detiene y mostramos la pantalla
de "Game Over".

**ANA:** O sea que ahí está el "sistema de derrota" que pide el enunciado. ¿Y la
física? Suena complicado.

**JUNIOR:** Es más simple de lo que parece. El balón tiene una posición y una
velocidad. En cada fotograma, la gravedad le suma un poco de velocidad hacia
abajo, y la posición cambia según esa velocidad. Cuando lo tocas, le damos una
velocidad hacia arriba. Posición, velocidad y aceleración: la misma idea de la
física del colegio, simplificada.

---

## 🧠 La decisión más inteligente: una sola "fábrica"

**ANA:** Me contaste que el juego tiene modo de un jugador y de dos en pantalla
dividida. ¿Programaste el juego dos veces?

**JUNIOR:** ¡Para nada! Y esa es la decisión de la que estoy más orgulloso.
Tenemos una función que se llama `crearPartida`. Cada vez que la llamas, te
fabrica una partida completa e independiente: su propio balón, su puntaje, su
física. El modo de un jugador crea **una** partida. El de dos jugadores crea
**dos**, una en cada mitad de la pantalla.

**ANA:** O sea, el mismo motor sirve para los dos modos.

**JUNIOR:** Exacto. Eso es el principio DRY: "no te repitas". Si arreglo un error
en la física, se arregla para los dos modos a la vez, porque es el mismo código.

**ANA:** Eso es justo lo que más puntúa: el uso inteligente de funciones. Y de
paso, ¿por qué no hicieron multijugador por internet?

**JUNIOR:** Porque conectar dos computadoras de verdad necesita un servidor, y
nosotros solo usamos HTML, CSS y JavaScript, sin backend. Así que el modo de dos
jugadores es local: uno usa la tecla A y el otro la tecla L, en el mismo teclado.

---

## 🎨 Lo que se ve y lo que se oye

**ANA:** Hablemos de lo bonito. Los avatares de los jugadores... ¿son fotos?

**JUNIOR:** No, y fue una decisión a propósito. Son dibujos vectoriales hechos con
código, usando los colores de cada selección. Así evitamos problemas de derechos
de imagen de personas reales, y el juego funciona sin descargar nada, totalmente
offline.

**ANA:** ¿Y el balón? Me dijiste que lo mejoraron hace poco.

**JUNIOR:** Sí. Antes era un círculo blanco plano con un punto negro. Lo
rediseñamos para que parezca un balón de fútbol de verdad: tiene paneles de
pentágonos, un sombreado que lo hace ver redondo, un brillo, y hasta gira según
hacia dónde se mueve. Y le pusimos una sombra en el césped que se encoge cuando
el balón sube. Todo dibujado por código.

**ANA:** ¿Y el sonido? Porque no veo archivos de música en el proyecto.

**JUNIOR:** Porque no hay ninguno. Todos los sonidos se generan en el momento con
la Web Audio API. Creamos una nota, le damos una frecuencia y un volumen que se
desvanece, y ya. El sonido del toque sube de tono mientras más dominadas llevas,
para premiar las rachas.

---

## 🌶️ El toque de personalidad

**ANA:** Hay un archivo con un nombre curioso: `sazon.js`. ¿Qué es eso?

**JUNIOR:** Es la "sazón" del juego, la personalidad. Muestra mensajes de hinchada
costeña: te felicita cada ciertos toques, te asusta si casi fallas, y cuando
llegas a cien dominadas suena un pequeño himno. Lo divertido es cómo está
conectado.

**ANA:** ¿Cómo así?

**JUNIOR:** El motor del juego no sabe nada de esos mensajes. Solo "reporta" cada
vez que anotas un toque. Y `sazon.js` escucha ese reporte y decide qué mensaje
mostrar. Están desacoplados: yo podría borrar el archivo de la sazón y el juego
seguiría funcionando exactamente igual, solo que sin los chistes.

**ANA:** Esa separación es muy elegante. Es pensar como ingeniero, no solo como
programador.

---

## 🎤 Cierre: la defensa

**ANA:** Última parte. El profesor dijo que la regla de oro es: *deben poder
explicar cada línea*. ¿Cómo se preparan para eso?

**JUNIOR:** Tres cosas. Primero, el código está todo comentado en español, con
funciones de nombres descriptivos, así que se lee casi como un texto. Segundo,
tenemos un historial de commits en Git que muestra cómo fuimos avanzando por
pasos. Y tercero, documentamos las decisiones en el README, la memoria y la
presentación, incluyendo cómo usamos la IA.

**ANA:** ¿Y cómo usaron la inteligencia artificial?

**JUNIOR:** Como copiloto, no como piloto. Nos ayudó a estructurar las funciones y
a depurar errores, pero cada bloque lo entendemos y lo podemos explicar. Esa es
justo la habilidad que el enunciado dice que es la más valiosa: aprender a hacer
las preguntas correctas.

**ANA:** No se me ocurre mejor cierre. Junior, gracias por abrirnos el código.

**JUNIOR:** ¡Gracias a ti, Ana! Y al que esté escuchando: abran el juego, jueguen
una partida, y luego abran el código con esta guía al lado. Verán que cada cosa
en pantalla tiene su función con nombre y apellido.

**ANA:** Hasta la próxima. ⚽

---

## 📋 Mini-resumen para repasar (los 7 puntos del episodio)

1. **Estructura:** un `index.html`, carpetas `css` y `js`, cada archivo una sola
   responsabilidad.
2. **Datos separados de lógica:** jugadores y dificultades son solo datos.
3. **El bucle:** actualizar → dibujar → repetir ~60 veces por segundo.
4. **Física simple:** posición + velocidad + gravedad.
5. **La fábrica `crearPartida()`:** un solo motor para 1 y 2 jugadores (DRY).
6. **Sin archivos externos:** avatares en SVG, sonidos con Web Audio API → offline.
7. **Defensa:** código comentado + commits de Git + saber explicar cada bloque.
