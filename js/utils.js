/**
 * utils.js
 * -----------------------------------------------------------------------------
 * Funciones de utilidad reutilizables. Cada una hace UNA sola cosa bien.
 * Aquí viven cosas genéricas que no pertenecen a la lógica del juego en sí:
 *   - acceso al DOM
 *   - guardado/lectura del récord en localStorage
 *   - matemáticas básicas
 */

/** Clave bajo la cual se guarda el récord en el navegador. */
const CLAVE_RECORD = "mundialDominadas.record";

/**
 * Atajo para document.querySelector. Reduce código repetido (principio DRY).
 * @param {string} selector - selector CSS.
 * @returns {HTMLElement} el primer elemento que coincide.
 */
function buscar(selector) {
  return document.querySelector(selector);
}

/**
 * Lee el récord máximo guardado en el navegador.
 * @returns {number} el récord, o 0 si nunca se ha jugado.
 */
function leerRecord() {
  const valor = localStorage.getItem(CLAVE_RECORD);
  return valor ? Number(valor) : 0;
}

/**
 * Guarda un nuevo récord SOLO si supera al anterior.
 * @param {number} puntaje - el puntaje obtenido en la partida.
 * @returns {boolean} true si se estableció un récord nuevo.
 */
function guardarRecordSiEsMayor(puntaje) {
  if (puntaje > leerRecord()) {
    localStorage.setItem(CLAVE_RECORD, String(puntaje));
    return true;
  }
  return false;
}

/**
 * Limita un número a un rango [minimo, maximo].
 * Útil para que velocidades y posiciones no se salgan de control.
 * @param {number} valor
 * @param {number} minimo
 * @param {number} maximo
 * @returns {number}
 */
function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/**
 * Calcula la distancia entre dos puntos (teorema de Pitágoras).
 * Se usa para saber si un clic tocó el balón.
 * @returns {number} distancia en píxeles.
 */
function distancia(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
