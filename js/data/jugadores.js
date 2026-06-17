/**
 * data/jugadores.js
 * -----------------------------------------------------------------------------
 * Catálogo de los 10 avatares (futbolistas) disponibles en el juego.
 *
 * Cada jugador es un objeto con datos puramente DESCRIPTIVOS. No contiene
 * lógica: solo información que otras partes del programa leen para dibujar el
 * avatar y configurar la dificultad.
 *
 * Campos:
 *   id          -> identificador único (se usa para guardar la selección).
 *   nombre      -> nombre mostrado en pantalla.
 *   pais        -> nación que representa.
 *   bandera     -> emoji de la bandera (no requiere descargar imágenes).
 *   dorsal      -> número de camiseta (decorativo).
 *   colorPrimario / colorSecundario -> colores de la camiseta (para el SVG).
 *   colorPiel   -> tono de piel del avatar SVG.
 *   control     -> estadística de 1 a 10. Un control más alto agranda la
 *                  tolerancia del toque, haciendo al jugador más fácil de usar.
 *   frase       -> texto corto que da personalidad a cada avatar.
 *
 * Se expone como una constante global `JUGADORES` para que los módulos
 * cargados después (sin imports/módulos ES) puedan leerla.
 */
const JUGADORES = [
  {
    id: "messi",
    nombre: "Leo Messi",
    pais: "Argentina",
    bandera: "🇦🇷",
    dorsal: 10,
    colorPrimario: "#75AADB",
    colorSecundario: "#FFFFFF",
    colorPiel: "#E8B98A",
    control: 10,
    frase: "La Pulga nunca deja caer el balón.",
  },
  {
    id: "cristiano",
    nombre: "Cristiano Ronaldo",
    pais: "Portugal",
    bandera: "🇵🇹",
    dorsal: 7,
    colorPrimario: "#C8102E",
    colorSecundario: "#006600",
    colorPiel: "#D9A06B",
    control: 9,
    frase: "¡Siuuu! Potencia pura en cada toque.",
  },
  {
    id: "luisdiaz",
    nombre: "Luis Díaz",
    pais: "Colombia",
    bandera: "🇨🇴",
    dorsal: 7,
    colorPrimario: "#FCD116",
    colorSecundario: "#003893",
    colorPiel: "#9C6B4A",
    control: 8,
    frase: "Lucho dribla hasta la gravedad.",
  },
  {
    id: "mbappe",
    nombre: "Kylian Mbappé",
    pais: "Francia",
    bandera: "🇫🇷",
    dorsal: 10,
    colorPrimario: "#0055A4",
    colorSecundario: "#FFFFFF",
    colorPiel: "#7A5235",
    control: 9,
    frase: "Velocidad supersónica con el balón.",
  },
  {
    id: "neymar",
    nombre: "Neymar Jr",
    pais: "Brasil",
    bandera: "🇧🇷",
    dorsal: 10,
    colorPrimario: "#FFDF00",
    colorSecundario: "#009C3B",
    colorPiel: "#C68642",
    control: 8,
    frase: "Magia y jogo bonito.",
  },
  {
    id: "haaland",
    nombre: "Erling Haaland",
    pais: "Noruega",
    bandera: "🇳🇴",
    dorsal: 9,
    colorPrimario: "#BA0C2F",
    colorSecundario: "#00205B",
    colorPiel: "#F1C8A0",
    control: 7,
    frase: "El robot goleador no falla.",
  },
  {
    id: "debruyne",
    nombre: "Kevin De Bruyne",
    pais: "Bélgica",
    bandera: "🇧🇪",
    dorsal: 17,
    colorPrimario: "#E30613",
    colorSecundario: "#FDDA24",
    colorPiel: "#EAC19A",
    control: 9,
    frase: "Precisión quirúrgica en cada pase.",
  },
  {
    id: "salah",
    nombre: "Mohamed Salah",
    pais: "Egipto",
    bandera: "🇪🇬",
    dorsal: 11,
    colorPrimario: "#CE1126",
    colorSecundario: "#000000",
    colorPiel: "#B07A4F",
    control: 8,
    frase: "El faraón eléctrico.",
  },
  {
    id: "modric",
    nombre: "Luka Modrić",
    pais: "Croacia",
    bandera: "🇭🇷",
    dorsal: 10,
    colorPrimario: "#FF0000",
    colorSecundario: "#FFFFFF",
    colorPiel: "#E3B58C",
    control: 9,
    frase: "El maestro del mediocampo.",
  },
  {
    id: "son",
    nombre: "Heung-min Son",
    pais: "Corea del Sur",
    bandera: "🇰🇷",
    dorsal: 7,
    colorPrimario: "#FFFFFF",
    colorSecundario: "#C60C30",
    colorPiel: "#E6C39A",
    control: 8,
    frase: "Disparo letal con las dos piernas.",
  },
];
