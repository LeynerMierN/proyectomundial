/**
 * dosjugadores.js
 * -----------------------------------------------------------------------------
 * Controlador del modo de 2 JUGADORES en pantalla dividida (misma computadora).
 *
 * Crea DOS partidas independientes (reutilizando crearPartida de juego.js), una
 * por cada mitad de la pantalla, y las actualiza en un solo bucle. Cada jugador
 * controla su balón:
 *   - Jugador 1: tecla "A" o clic en su campo.
 *   - Jugador 2: tecla "L" o clic en su campo.
 *
 * Cuando a un jugador se le cae el balón queda "fuera". Cuando ambos están
 * fuera, termina y se compara el puntaje para declarar ganador.
 *
 * Expone el objeto global `Juego2P`:
 *   Juego2P.iniciar(jugador1, jugador2, dificultad, alTerminar)
 *   Juego2P.detener()
 */

const Juego2P = (function () {
  let lienzo1, lienzo2;
  let partida1, partida2;
  let alTerminarCallback;
  let idAnimacion = null;

  /** Maneja el teclado: cada tecla impulsa el balón de su jugador. */
  function manejarTecla(evento) {
    if (evento.code === "KeyA") {
      evento.preventDefault();
      partida1.tocarCentro();
    } else if (evento.code === "KeyL") {
      evento.preventDefault();
      partida2.tocarCentro();
    }
  }

  /** Clic en el campo del jugador 1. */
  function clicJugador1(evento) {
    const p = coordenadasEnLienzo(lienzo1, evento);
    partida1.tocarEn(p.x, p.y);
  }

  /** Clic en el campo del jugador 2. */
  function clicJugador2(evento) {
    const p = coordenadasEnLienzo(lienzo2, evento);
    partida2.tocarEn(p.x, p.y);
  }

  function activarControles() {
    document.addEventListener("keydown", manejarTecla);
    lienzo1.addEventListener("mousedown", clicJugador1);
    lienzo2.addEventListener("mousedown", clicJugador2);
  }

  function desactivarControles() {
    document.removeEventListener("keydown", manejarTecla);
    if (lienzo1) lienzo1.removeEventListener("mousedown", clicJugador1);
    if (lienzo2) lienzo2.removeEventListener("mousedown", clicJugador2);
  }

  /** Bucle único que avanza y dibuja ambas partidas. */
  function bucle() {
    partida1.actualizar();
    partida2.actualizar();
    partida1.dibujar();
    partida2.dibujar();
    buscar("#puntaje-p1").textContent = partida1.puntaje;
    buscar("#puntaje-p2").textContent = partida2.puntaje;

    // La ronda termina cuando a AMBOS se les cayó el balón.
    if (!partida1.viva && !partida2.viva) {
      terminarRonda();
      return;
    }
    idAnimacion = requestAnimationFrame(bucle);
  }

  function terminarRonda() {
    detener();
    Sonidos.gameOver();
    alTerminarCallback(partida1.puntaje, partida2.puntaje);
  }

  /**
   * Arranca una ronda de 2 jugadores.
   * @param {Object} jugador1
   * @param {Object} jugador2
   * @param {Object} dificultad - misma para ambos (juego justo).
   * @param {Function} alTerminar - callback(puntaje1, puntaje2).
   */
  function iniciar(jugador1, jugador2, dificultad, alTerminar) {
    lienzo1 = buscar("#lienzo-p1");
    lienzo2 = buscar("#lienzo-p2");
    alTerminarCallback = alTerminar;

    partida1 = crearPartida(lienzo1, jugador1, dificultad);
    partida2 = crearPartida(lienzo2, jugador2, dificultad);
    partida1.configurar();
    partida2.configurar();
    activarControles();

    bucle();
  }

  function detener() {
    if (idAnimacion) cancelAnimationFrame(idAnimacion);
    idAnimacion = null;
    desactivarControles();
  }

  return { iniciar, detener };
})();
