/**
 * sazon.js
 * -----------------------------------------------------------------------------
 * La "sazón" del juego: la personalidad costeña que comenta la partida.
 * No sabe nada de física ni de canvas — solo reacciona a lo que juego.js le
 * reporta en cada toque acertado (ver `opciones.alAnotar` en crearPartida,
 * dentro de juego.js) y decide qué mensaje mostrar y cuándo.
 *
 * Por qué está separado del motor: si mañana se quiere cambiar el "tono" del
 * juego (otro acento, otro idioma, sin mensajes) solo se toca este archivo;
 * la física y las reglas de victoria/derrota no se mueven ni un píxel.
 *
 * Se expone un único objeto global `Sazon` con un método público:
 *   Sazon.alAnotar(info) -> info = { puntaje, jugador, fueRasguno, contenedor, pausar }
 *     - puntaje: dominadas acumuladas en ESTA partida (después de sumar la actual).
 *     - jugador: el avatar elegido (tiene .nombre, .bandera, etc.).
 *     - fueRasguno: true si el toque acertó pero raspando el borde de la zona.
 *     - contenedor: elemento HTML donde debe aparecer el mensaje flotante
 *       (la pantalla completa en 1 jugador, o solo la mitad de esa persona
 *       en 2 jugadores — juego.js ya resuelve cuál es).
 *     - pausar(ms, impulso): congela la física de ESA partida por `ms`
 *       milisegundos y, al volver, le aplica `impulso` como nueva velocidad
 *       vertical. Lo usa la mecánica de "despiste" del toque número 10.
 */

const Sazon = (function () {
  const ELOGIOS_COSTENOS = ["¡Monstruo!", "¡Erda, perfecto!", "¡Lindooooooo!", "¡Puro crack!"];
  const MENSAJES_AZARE = ["¡Uy, cuidado!", "¡Anda, casi la embarras!", "¡Ponte las pilas!"];

  // Cuánto dura el "despiste" del hito de las 10 dominadas, y con qué
  // impulso vertical se reanuda el balón (sorpresa: sale más rápido que
  // antes de la pausa, para que el jugador tenga que reaccionar de una).
  const DURACION_DESPISTE_MS = 1500;
  const IMPULSO_AL_REANUDAR = -8;

  /**
   * Elige un texto al azar de una lista.
   * @param {string[]} lista
   * @returns {string}
   */
  function alAzar(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  /**
   * Muestra (o reutiliza) el texto flotante DENTRO de un contenedor
   * específico. Cada contenedor tiene su PROPIO texto flotante —no uno
   * global— porque en el modo 2 jugadores hay dos mitades de pantalla a la
   * vez y cada una necesita poder mostrar su propio mensaje sin pisar al del
   * otro jugador.
   * @param {HTMLElement} contenedor
   * @param {string} texto
   * @param {boolean} esAlertaNegativa - true para el tono rojo de susto.
   */
  function mostrarTextoFlotante(contenedor, texto, esAlertaNegativa) {
    if (!contenedor) return;

    let elemento = contenedor.querySelector(":scope > .texto-sazon");
    if (!elemento) {
      elemento = document.createElement("div");
      elemento.className = "texto-sazon";
      contenedor.appendChild(elemento);
    }

    elemento.textContent = texto;
    elemento.classList.toggle("texto-sazon--negativo", Boolean(esAlertaNegativa));
    elemento.classList.add("texto-sazon--visible");

    // Si ya había un mensaje por desaparecer, se cancela ese temporizador:
    // sin esto, un mensaje viejo podría ocultar a uno nuevo antes de tiempo
    // (puede pasar el mismo toque, por ejemplo un "raspón" justo en un hito).
    if (elemento._temporizadorOculto) clearTimeout(elemento._temporizadorOculto);
    elemento._temporizadorOculto = setTimeout(() => {
      elemento.classList.remove("texto-sazon--visible");
    }, 1200);
  }

  /**
   * Punto de entrada: se llama cada vez que un jugador acierta un toque.
   * Decide, en orden, si corresponde avisar un "raspón", lanzar la mecánica
   * de despiste de las 10 dominadas, felicitar cada 8, o celebrar el hito
   * de las 100 con el himno. Sigue el mismo orden que tenía el diseño
   * original para que el comportamiento sea el esperado.
   * @param {Object} info - ver el contrato documentado arriba del archivo.
   */
  function alAnotar(info) {
    const { puntaje, jugador, fueRasguno, contenedor, pausar } = info;

    if (fueRasguno) {
      mostrarTextoFlotante(contenedor, alAzar(MENSAJES_AZARE), true);
    }

    // Mecánica de distracción: al llegar a 10, se congela el juego un
    // instante para "despistar" al jugador antes de devolverle el control
    // con un impulso sorpresa. Termina aquí, igual que el diseño original,
    // para no encimar el elogio de las 8 ni el hito de las 100 en el mismo
    // toque (esos se evalúan en los toques siguientes, no en este).
    if (puntaje === 10) {
      mostrarTextoFlotante(contenedor, `¿¡CÓMO TE DIGO!? ¡${jugador.nombre}!`, false);
      if (typeof pausar === "function") {
        pausar(DURACION_DESPISTE_MS, IMPULSO_AL_REANUDAR);
      }
      return;
    }

    if (puntaje % 8 === 0) {
      mostrarTextoFlotante(contenedor, alAzar(ELOGIOS_COSTENOS), false);
    }

    if (puntaje === 100) {
      mostrarTextoFlotante(contenedor, "⚽ ¡MODO CHAMPIONS LEAGUE! ⚽", false);
      Sonidos.himno();
    }
  }

  return { alAnotar };
})();
