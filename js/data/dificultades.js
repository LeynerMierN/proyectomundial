/**
 * data/dificultades.js
 * -----------------------------------------------------------------------------
 * Configuración de los niveles de dificultad. Son SOLO datos: cada nivel define
 * los parámetros de física que la lógica del juego (juego.js) leerá al iniciar.
 *
 * Campos de cada nivel:
 *   id              -> identificador único.
 *   nombre          -> texto mostrado en el botón.
 *   icono           -> emoji decorativo.
 *   gravedadInicial -> qué tan rápido cae el balón al principio.
 *   gravedadMaxima  -> tope de gravedad cuando sube la dificultad.
 *   incremento      -> cuánto sube la gravedad cada 5 dominadas.
 *   fuerzaToque     -> impulso hacia arriba al tocar (negativo = sube).
 *   toleranciaExtra -> margen adicional de la zona de toque (más = más fácil).
 *
 * Se expone como constante global `DIFICULTADES`.
 */
const DIFICULTADES = [
  {
    id: "facil",
    nombre: "Fácil",
    icono: "🟢",
    gravedadInicial: 0.18,
    gravedadMaxima: 0.38,
    incremento: 0.02,
    fuerzaToque: -9.0,
    toleranciaExtra: 24,
  },
  {
    id: "normal",
    nombre: "Normal",
    icono: "🟡",
    gravedadInicial: 0.25,
    gravedadMaxima: 0.55,
    incremento: 0.03,
    fuerzaToque: -9.5,
    toleranciaExtra: 12,
  },
  {
    id: "dificil",
    nombre: "Difícil",
    icono: "🔴",
    gravedadInicial: 0.34,
    gravedadMaxima: 0.75,
    incremento: 0.05,
    fuerzaToque: -10.5,
    toleranciaExtra: 0,
  },
];

/**
 * Busca un nivel de dificultad por su id.
 * @param {string} id
 * @returns {Object|undefined}
 */
function buscarDificultadPorId(id) {
  return DIFICULTADES.find((nivel) => nivel.id === id);
}
