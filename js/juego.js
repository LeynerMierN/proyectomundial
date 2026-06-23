/**
 * juego.js
 * -----------------------------------------------------------------------------
 * Motor del juego de dominadas. Contiene:
 *
 *   1) crearPartida(lienzo, jugador, dificultad)
 *      Una "fábrica" que devuelve UNA partida independiente: tiene su propio
 *      balón, puntaje, física y dibujo sobre su propio canvas. Se reutiliza
 *      tanto en 1 jugador como en cada mitad del modo de 2 jugadores (DRY).
 *
 *   2) Juego  -> controlador del modo de 1 JUGADOR (usa una sola partida).
 *      Juego.iniciar(jugador, dificultad, alTerminar)
 *      Juego.detener()
 *
 * El modo de 2 jugadores vive en dosjugadores.js y también usa crearPartida().
 */

// Constantes que NO dependen de la dificultad ni del tamaño del canvas.
const RADIO_BALON = 22;
// Margen base alrededor del balón para aceptar un clic. Reducido para que
// acertar el toque sea más difícil (zona de clic más ajustada).
const TOLERANCIA_BASE = 10;

/**
 * Crea una partida independiente sobre un canvas dado.
 * @param {HTMLCanvasElement} lienzo - el canvas donde se dibuja.
 * @param {Object} jugador - avatar (de JUGADORES).
 * @param {Object} dificultad - nivel (de DIFICULTADES).
 * @returns {Object} API de la partida (ver el return al final).
 */
function crearPartida(lienzo, jugador, dificultad) {
  const contexto = lienzo.getContext("2d");

  // Estado propio de esta partida.
  let balon;
  let puntaje = 0;
  let gravedad = dificultad.gravedadInicial;
  let animacionToque = 0;
  let viva = true;
  // Por qué terminó la partida: "suelo" (el balón cayó solo) o "falla" (el
  // jugador tocó/presionó fuera de la zona válida). Se usa para mostrar un
  // mensaje distinto y para no celebrar como si el balón hubiera caído solo.
  let motivoDerrota = "suelo";

  /** Ajusta el tamaño interno del canvas al tamaño que ocupa en pantalla. */
  function configurar() {
    lienzo.width = lienzo.clientWidth || 360;
    lienzo.height = lienzo.clientHeight || 480;
    reiniciarBalon();
  }

  /** Coloca el balón arriba con un leve desvío horizontal. */
  function reiniciarBalon() {
    balon = {
      x: lienzo.width / 2,
      y: RADIO_BALON + 10,
      vx: (Math.random() - 0.5) * 3,
      vy: 0,
    };
  }

  /** Coordenada Y del suelo (inicio del césped). */
  function obtenerSuelo() {
    return lienzo.height * 0.58;
  }

  /**
   * Impulsa el balón hacia arriba (una dominada).
   * @param {number} offsetX - desfase horizontal del toque para dar efecto.
   */
  function patear(offsetX) {
    balon.vy = dificultad.fuerzaToque;
    balon.vx = limitar(balon.vx - offsetX * 0.08, -7, 7);
    puntaje++;
    animacionToque = 12;
    Sonidos.toque(puntaje);
    aumentarDificultad();
  }

  /** Sube la gravedad cada 8 dominadas (8, 16, 24...), sin pasar del tope. */
  function aumentarDificultad() {
    if (puntaje % 8 === 0) {
      gravedad = limitar(
        gravedad + dificultad.incremento,
        dificultad.gravedadInicial,
        dificultad.gravedadMaxima
      );
    }
  }

  /** Margen de toque según el control del jugador y la dificultad. */
  function tolerancia() {
    return TOLERANCIA_BASE + jugador.control * 1.5 + dificultad.toleranciaExtra;
  }

  /**
   * Banda vertical "alcanzable" para el toque por teclado. La barra
   * espaciadora no tiene una posición de clic, así que en su lugar exige
   * TIEMPO: solo cuenta si el balón ya está cerca del avatar (abajo), igual
   * que en la vida real solo puedes golpear el balón cuando te llega al pie.
   * Usa el mismo margen que el clic, así que la misma dificultad/control que
   * agranda o achica la zona del clic también agranda o achica esta banda.
   */
  function zonaAlcance() {
    const alto = (RADIO_BALON + tolerancia()) * 2;
    const hasta = obtenerSuelo() - 4; // justo antes del límite que es derrota.
    return { desde: hasta - alto, hasta };
  }

  /**
   * Marca la partida como perdida por un toque fallido (clic fuera del balón
   * o espacio fuera de tiempo). A diferencia de que el balón caiga solo, este
   * es un error del jugador: por eso el balón "sale disparado" con fuerza,
   * como castigo visual claro, y se guarda el motivo para mostrar un mensaje
   * distinto al final.
   */
  function fallar() {
    if (!viva) return;
    viva = false;
    motivoDerrota = "falla";
    balon.vy = Math.max(12, Math.abs(dificultad.fuerzaToque) * 1.4);
  }

  /**
   * Intenta tocar en una coordenada del canvas. Es estricto: si el clic/tap
   * no cae sobre el balón (dentro de la tolerancia), la partida termina ahí
   * mismo. Así ya no se puede "spamear clics" sin riesgo: cada intento cuenta.
   */
  function tocarEn(x, y) {
    if (!viva) return;
    if (distancia(x, y, balon.x, balon.y) <= RADIO_BALON + tolerancia()) {
      patear(x - balon.x);
    } else {
      fallar();
    }
  }

  /**
   * Toca el balón por teclado. Solo acierta si el balón está dentro de la
   * zona de alcance (ver zonaAlcance); fuera de tiempo, es una falta y
   * termina la partida igual que un clic errado.
   */
  function tocarCentro() {
    if (!viva) return;
    const zona = zonaAlcance();
    if (balon.y >= zona.desde && balon.y <= zona.hasta) {
      patear(0);
    } else {
      fallar();
    }
  }

  /**
   * Avanza la física un fotograma.
   * @returns {boolean} si la partida sigue viva.
   */
  function actualizar() {
    if (!viva) return false;
    balon.vy += gravedad;
    balon.x += balon.vx;
    balon.y += balon.vy;

    if (balon.x - RADIO_BALON < 0 || balon.x + RADIO_BALON > lienzo.width) {
      balon.vx *= -1;
      balon.x = limitar(balon.x, RADIO_BALON, lienzo.width - RADIO_BALON);
    }

    if (balon.y + RADIO_BALON >= obtenerSuelo()) {
      viva = false;
      // Si ya estaba marcada como "falla" (un fallar() reciente la tumbó),
      // se respeta ese motivo; si no, fue el balón cayendo solo.
      if (motivoDerrota !== "falla") motivoDerrota = "suelo";
    }
    return viva;
  }

  // -------- Dibujo del estadio (cada partida pinta en su canvas) --------

  function dibujarCielo() {
    const cielo = contexto.createLinearGradient(0, 0, 0, obtenerSuelo());
    cielo.addColorStop(0, "#7ec8f0");
    cielo.addColorStop(1, "#dff1ff");
    contexto.fillStyle = cielo;
    contexto.fillRect(0, 0, lienzo.width, obtenerSuelo());

    contexto.save();
    contexto.translate(lienzo.width / 2, -20);
    contexto.fillStyle = "rgba(255, 255, 200, 0.18)";
    for (let i = 0; i < 8; i++) {
      contexto.rotate((Math.PI * 2) / 8);
      contexto.beginPath();
      contexto.moveTo(0, 0);
      contexto.lineTo(-30, lienzo.height);
      contexto.lineTo(30, lienzo.height);
      contexto.closePath();
      contexto.fill();
    }
    contexto.restore();
  }

  function dibujarGradas() {
    const yGrada = obtenerSuelo() - 46;
    contexto.fillStyle = "#3a3f4b";
    contexto.fillRect(0, yGrada, lienzo.width, 46);
    const colores = ["#ff5252", "#ffd54f", "#4fc3f7", "#fff", "#81c784"];
    for (let fila = 0; fila < 3; fila++) {
      for (let x = 6; x < lienzo.width; x += 12) {
        contexto.fillStyle = colores[(x + fila) % colores.length];
        contexto.beginPath();
        contexto.arc(x, yGrada + 10 + fila * 12, 2.5, 0, Math.PI * 2);
        contexto.fill();
      }
    }
  }

  function dibujarCesped() {
    const inicio = obtenerSuelo();
    const alto = lienzo.height - inicio;
    contexto.fillStyle = "#2e8b57";
    contexto.fillRect(0, inicio, lienzo.width, alto);
    contexto.fillStyle = "rgba(255, 255, 255, 0.06)";
    const numFranjas = 6;
    const ancho = lienzo.width / numFranjas;
    for (let i = 0; i < numFranjas; i += 2) {
      contexto.fillRect(i * ancho, inicio, ancho, alto);
    }
  }

  /** Contador grande centrado; su tamaño se adapta a la altura del canvas. */
  function dibujarContador() {
    contexto.save();
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = `bold ${Math.round(lienzo.height * 0.2)}px Segoe UI, Arial`;
    contexto.lineWidth = 6;
    contexto.strokeStyle = "rgba(0, 0, 0, 0.25)";
    contexto.fillStyle = "rgba(255, 255, 255, 0.92)";
    contexto.strokeText(puntaje, lienzo.width / 2, lienzo.height * 0.26);
    contexto.fillText(puntaje, lienzo.width / 2, lienzo.height * 0.26);
    contexto.restore();
  }

  function dibujarBalon() {
    contexto.save();
    contexto.beginPath();
    contexto.arc(balon.x, balon.y, RADIO_BALON, 0, Math.PI * 2);
    contexto.fillStyle = "#ffffff";
    contexto.fill();
    contexto.lineWidth = 2;
    contexto.strokeStyle = "#222";
    contexto.stroke();
    contexto.beginPath();
    contexto.arc(balon.x, balon.y, RADIO_BALON * 0.4, 0, Math.PI * 2);
    contexto.fillStyle = "#222";
    contexto.fill();
    contexto.restore();
  }

  function dibujarAvatar() {
    const baseX = balon.x;
    const baseY = lienzo.height - 8;
    const inclina = animacionToque > 0 ? -6 : 0;
    if (animacionToque > 0) animacionToque--;

    contexto.save();
    contexto.strokeStyle = "#1a1a1a";
    contexto.lineWidth = 6;
    contexto.beginPath();
    contexto.moveTo(baseX, baseY - 30);
    contexto.lineTo(baseX - 8, baseY);
    contexto.moveTo(baseX, baseY - 30);
    contexto.lineTo(baseX + 8 + inclina, baseY + inclina);
    contexto.stroke();
    contexto.fillStyle = jugador.colorPrimario;
    contexto.fillRect(baseX - 12, baseY - 55, 24, 28);
    contexto.beginPath();
    contexto.arc(baseX, baseY - 64, 10, 0, Math.PI * 2);
    contexto.fillStyle = jugador.colorPiel;
    contexto.fill();
    contexto.restore();
  }

  /** Si la partida murió, oscurece el campo y muestra el motivo. */
  function dibujarFueraDeJuego() {
    const esFalla = motivoDerrota === "falla";
    contexto.save();
    contexto.fillStyle = esFalla ? "rgba(130, 10, 10, 0.55)" : "rgba(0, 0, 0, 0.5)";
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    contexto.fillStyle = "#fff";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = "bold 26px Segoe UI, Arial";
    contexto.fillText(
      esFalla ? "¡FALTA! ❌" : "¡FUERA! 😵",
      lienzo.width / 2,
      lienzo.height / 2
    );
    contexto.restore();
  }

  /** Pinta una escena completa. */
  function dibujar() {
    dibujarCielo();
    dibujarGradas();
    dibujarCesped();
    dibujarContador();
    dibujarBalon();
    dibujarAvatar();
    if (!viva) dibujarFueraDeJuego();
  }

  return {
    configurar,
    tocarEn,
    tocarCentro,
    actualizar,
    dibujar,
    get puntaje() {
      return puntaje;
    },
    get viva() {
      return viva;
    },
    get motivoDerrota() {
      return motivoDerrota;
    },
  };
}

/**
 * Convierte las coordenadas de un evento (ratón o tacto) a coordenadas internas
 * del canvas indicado. Función compartida por ambos modos.
 * @param {HTMLCanvasElement} lienzo
 * @param {MouseEvent|Touch} evento
 * @returns {{x:number, y:number}}
 */
function coordenadasEnLienzo(lienzo, evento) {
  const rect = lienzo.getBoundingClientRect();
  return {
    x: (evento.clientX - rect.left) * (lienzo.width / rect.width),
    y: (evento.clientY - rect.top) * (lienzo.height / rect.height),
  };
}

// ============================================================================
//  Controlador del modo de 1 JUGADOR
// ============================================================================
const Juego = (function () {
  let lienzo;
  let partida;
  let alTerminarCallback;
  let idAnimacion = null;

  function manejarToque(evento) {
    const p = coordenadasEnLienzo(lienzo, evento);
    partida.tocarEn(p.x, p.y);
  }

  function manejarTactil(evento) {
    evento.preventDefault();
    manejarToque(evento.touches[0]);
  }

  function manejarTecla(evento) {
    if (evento.code === "Space") {
      evento.preventDefault();
      partida.tocarCentro();
    }
  }

  function activarControles() {
    lienzo.addEventListener("mousedown", manejarToque);
    lienzo.addEventListener("touchstart", manejarTactil);
    document.addEventListener("keydown", manejarTecla);
  }

  function desactivarControles() {
    lienzo.removeEventListener("mousedown", manejarToque);
    lienzo.removeEventListener("touchstart", manejarTactil);
    document.removeEventListener("keydown", manejarTecla);
  }

  function bucle() {
    const viva = partida.actualizar();
    partida.dibujar();
    buscar("#marcador-puntaje").textContent = partida.puntaje;

    if (!viva) {
      terminarPartida();
      return;
    }
    idAnimacion = requestAnimationFrame(bucle);
  }

  function terminarPartida() {
    detener();
    const esRecord = guardarRecordSiEsMayor(partida.puntaje);
    if (esRecord && partida.puntaje > 0) Sonidos.record();
    else if (partida.motivoDerrota === "falla") Sonidos.fallo();
    else Sonidos.gameOver();
    alTerminarCallback(partida.puntaje, esRecord, partida.motivoDerrota);
  }

  /**
   * Arranca una partida de 1 jugador.
   * @param {Object} jugador
   * @param {Object} dificultad
   * @param {Function} alTerminar - callback(puntaje, esRecord).
   */
  function iniciar(jugador, dificultad, alTerminar) {
    lienzo = buscar("#lienzo-juego");
    alTerminarCallback = alTerminar;
    partida = crearPartida(lienzo, jugador, dificultad);
    partida.configurar();
    activarControles();

    buscar("#marcador-jugador").textContent = jugador.bandera;
    buscar("#marcador-record").textContent = leerRecord();
    buscar("#marcador-puntaje").textContent = 0;

    bucle();
  }

  function detener() {
    if (idAnimacion) cancelAnimationFrame(idAnimacion);
    idAnimacion = null;
    if (lienzo) desactivarControles();
  }

  return { iniciar, detener };
})();
