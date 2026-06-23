/**
 * sonidos.js
 * -----------------------------------------------------------------------------
 * Efectos de sonido generados por código con la Web Audio API. No usamos
 * archivos .mp3/.wav: cada sonido es un tono sintetizado en el momento, así el
 * juego sigue siendo solo HTML/CSS/JS y funciona 100% offline.
 *
 * Se expone un objeto global `Sonidos` con métodos públicos:
 *   Sonidos.toque(combo) -> "pop" agudo que sube de tono con el combo.
 *   Sonidos.gameOver()   -> tono descendente de derrota (el balón cayó solo).
 *   Sonidos.fallo()      -> buzz grave de error (clic/espacio fuera de zona).
 *   Sonidos.himno()      -> arpegio triunfal para el hito de 100 dominadas.
 *   Sonidos.record()     -> pequeño arpegio alegre.
 *   Sonidos.boton()      -> clic corto de interfaz.
 *   Sonidos.alternarMute() -> activa/desactiva el sonido; devuelve si está mute.
 *   Sonidos.estaSilenciado() -> true si el sonido está apagado.
 */

const Sonidos = (function () {
  let contexto = null; // AudioContext; se crea en el primer uso.
  let silenciado = false;

  /**
   * Obtiene (o crea) el AudioContext. Los navegadores exigen que se cree tras
   * una interacción del usuario, por eso se hace de forma perezosa.
   * @returns {AudioContext|null}
   */
  function obtenerContexto() {
    if (silenciado) return null;
    if (!contexto) {
      const Clase = window.AudioContext || window.webkitAudioContext;
      contexto = new Clase();
    }
    return contexto;
  }

  /**
   * Reproduce un tono simple.
   * @param {number} frecuencia - en hercios (agudo = número alto).
   * @param {number} duracion   - en segundos.
   * @param {string} tipo       - forma de onda: "sine", "square", "triangle".
   * @param {number} volumen    - de 0 a 1.
   */
  function tono(frecuencia, duracion, tipo = "sine", volumen = 0.2) {
    const ctx = obtenerContexto();
    if (!ctx) return;

    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    oscilador.type = tipo;
    oscilador.frequency.value = frecuencia;
    ganancia.gain.value = volumen;

    // Pequeño "fade out" para que el sonido no se corte de golpe (clic feo).
    ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);
    oscilador.start();
    oscilador.stop(ctx.currentTime + duracion);
  }

  /**
   * Sonido de toque del balón. Sube de tono según el combo para premiar las
   * rachas largas.
   * @param {number} combo - número de dominadas seguidas.
   */
  function toque(combo) {
    const base = 420;
    const frecuencia = base + Math.min(combo, 30) * 12; // tope para no chillar.
    tono(frecuencia, 0.12, "square", 0.15);
  }

  /** Tono descendente al perder (el balón cayó solo). */
  function gameOver() {
    tono(300, 0.18, "sawtooth", 0.2);
    setTimeout(() => tono(200, 0.25, "sawtooth", 0.2), 120);
    setTimeout(() => tono(120, 0.35, "sawtooth", 0.2), 280);
  }

  /** Doble buzz grave: error del jugador (clic/espacio fuera de la zona). */
  function fallo() {
    tono(180, 0.15, "square", 0.22);
    setTimeout(() => tono(140, 0.2, "square", 0.22), 90);
  }

  /**
   * Pequeño himno triunfal para el hito de las 100 dominadas. Es un arpegio
   * ascendente seguido de un acorde final sostenido. Se sintetiza igual que
   * todo lo demás en este archivo (sin pedir un .mp3 externo) para que el
   * juego siga funcionando 100% offline, sin depender de internet.
   */
  function himno() {
    const arpegio = [392, 440, 523, 659, 784, 880, 1046];
    arpegio.forEach((nota, i) => {
      setTimeout(() => tono(nota, 0.3, "triangle", 0.16), i * 130);
    });
    // Acorde final: varias notas sonando juntas para un remate solemne.
    setTimeout(() => {
      tono(523, 1.1, "triangle", 0.13);
      tono(659, 1.1, "triangle", 0.11);
      tono(784, 1.1, "triangle", 0.11);
    }, arpegio.length * 130);
  }

  /** Arpegio alegre al batir un récord. */
  function record() {
    [523, 659, 784, 1047].forEach((nota, i) => {
      setTimeout(() => tono(nota, 0.18, "triangle", 0.18), i * 110);
    });
  }

  /** Clic corto para los botones de la interfaz. */
  function boton() {
    tono(600, 0.07, "square", 0.12);
  }

  /**
   * Activa o desactiva todo el sonido.
   * @returns {boolean} true si quedó silenciado.
   */
  function alternarMute() {
    silenciado = !silenciado;
    return silenciado;
  }

  /** @returns {boolean} si el sonido está apagado. */
  function estaSilenciado() {
    return silenciado;
  }

  return { toque, gameOver, fallo, himno, record, boton, alternarMute, estaSilenciado };
})();
